/// <reference types="@types/google.analytics" />

namespace Renderer {
	export enum Mode {
		Play,
		Map,
		Entities,
	}

	export namespace Three {
		export function instance() {
			return Renderer.instance();
		}

		export function getPointer() {
			return Renderer.getPointer();
		}

		export function getVoxels() {
			return Renderer.getVoxels();
		}

		class Renderer {
			private static _instance: Renderer;
			renderer: THREE.WebGLRenderer;
			camera: Camera;
			scene: THREE.Scene;
			mode = Mode.Play;

			private clock = new THREE.Clock();
			private pointer = new THREE.Vector2();
			private initLoadingManager = new THREE.LoadingManager();

			private entityManager = new EntityManager();
			private entitiesLayer = new THREE.Group();
			private regionsLayer = new THREE.Group();

			private sky: Skybox;
			private voxels: Voxels;
			private particleSystem: ParticleSystem;

			private raycastIntervalSeconds = 0.1;
			private timeSinceLastRaycast = 0;

			// TODO: decouple this to the voxelEditor
			public tmp_tileId = 7;
			public voxelEditor: VoxelEditor;

			private regionDrawStart: { x: number; y: number } = { x: 0, y: 0 };

			private constructor() {
				// For JS interop; in case someone uses new Renderer.ThreeRenderer()
				if (!Renderer._instance) {
					Renderer._instance = this;
				} else {
					return Renderer._instance;
				}
				const { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } = window.MeshBVHLib;

				//@ts-ignore
				THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
				//@ts-ignore
				THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
				THREE.Mesh.prototype.raycast = acceleratedRaycast;
				const renderer = new THREE.WebGLRenderer();
				renderer.setSize(window.innerWidth, window.innerHeight);
				document.querySelector('#game-div')?.appendChild(renderer.domElement);
				this.renderer = renderer;

				this.camera = new Camera(window.innerWidth, window.innerHeight, this.renderer.domElement);
				this.camera.setElevationAngle(taro.game.data.settings.camera.defaultPitch);
				if (taro.game.data.settings.camera.projectionMode !== 'orthographic') {
					this.camera.setProjection(taro.game.data.settings.camera.projectionMode);
				}

				this.scene = new THREE.Scene();
				this.scene.background = new THREE.Color(taro.game.data.defaultData.mapBackgroundColor);

				window.addEventListener('resize', () => {
					this.camera.resize(window.innerWidth, window.innerHeight);
					renderer.setSize(window.innerWidth, window.innerHeight);
					renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
					renderer.render(this.scene, this.camera.instance);

					taro.client.emit('scale', { ratio: this.camera.zoom });
					taro.client.emit('update-abilities-position');
					this.entityManager.scaleGui(1 / this.camera.zoom);
				});

				let line: THREE.LineSegments;
				let width: number;
				let height: number;

				renderer.domElement.addEventListener('mousemove', (evt: MouseEvent) => {
					if (this.mode === Mode.Map) {
						switch (taro.developerMode.activeButton) {
							case 'cursor': {
								break;
							}
							case 'fill': {
							}
							case 'eraser': {
							}
							case 'brush': {
								this.voxelEditor.handleMapToolEdit();
							}
						}
					}
					this.pointer.set((evt.clientX / window.innerWidth) * 2 - 1, -(evt.clientY / window.innerHeight) * 2 + 1);
					if (!Utils.isLeftButton(evt.buttons)) return;
					if (taro.developerMode.regionTool) {
						const worldPoint = this.camera.getWorldPoint(this.pointer);
						width = worldPoint.x - this.regionDrawStart.x;
						height = worldPoint.z - this.regionDrawStart.y;
						line?.position.set(this.regionDrawStart.x + width / 2, 2, this.regionDrawStart.y + height / 2);
						line?.scale.set(width, 1, height);
					}
				});

				// TODO: add undo/redo
				renderer.domElement.addEventListener('keydown', (k: KeyboardEvent) => {});

				let rightClickPos: { x: number; y: number } = undefined;

				renderer.domElement.addEventListener('mousedown', (event: MouseEvent) => {
					if (this.mode === Mode.Map) {
						const developerMode = taro.developerMode;
						if (developerMode.regionTool) {
							const worldPoint = this.camera.getWorldPoint(this.pointer);
							this.regionDrawStart = {
								x: worldPoint.x,
								y: worldPoint.z,
							};

							const geometry = new THREE.BoxGeometry(1, 3, 1);
							const edges = new THREE.EdgesGeometry(geometry);
							line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x036ffc }));
							line.position.set(this.regionDrawStart.x + width / 2, 2, this.regionDrawStart.y + height / 2);
							line.scale.set(width, 1, height);
							line.visible = true;
							this.scene.add(line);
						} else if (developerMode.active && developerMode.activeTab === 'map') {
							if (Utils.isLeftButton(event.buttons)) {
								this.voxelEditor.leftButtonDown = true;
								switch (developerMode.activeButton) {
									case 'cursor': {
										const raycaster = new THREE.Raycaster();
										raycaster.setFromCamera(this.pointer, this.camera.instance);
										const intersects = raycaster.intersectObjects(this.entityManager.entities);
										if (intersects?.length > 0) {
											let closest: THREE.Mesh;
											let clickedList: THREE.Mesh[] = [];
											for (const intersect of intersects) {
												if ((intersect.object as THREE.Mesh).isMesh) {
													closest = intersect.object as THREE.Mesh;
													clickedList.push(closest);
												}
											}
											let regionList: RegionData[] = [];
											clickedList.forEach((clicked) => {
												const region = this.entityManager.regions.find((e) => e.mesh === clicked);
												if (region) {
													regionList.push({
														name: region.taroEntity._stats.id,
														x: region.stats.x,
														y: region.stats.y,
														width: region.stats.width,
														height: region.stats.height,
														alpha: region.stats.alpha,
														inside: region.stats.inside,
													});
												}
											});
											if (regionList.length === 1) {
												inGameEditor.addNewRegion && inGameEditor.addNewRegion(regionList[0]);
											} else if (regionList.length > 1) {
												inGameEditor.showRegionList && inGameEditor.showRegionList(regionList);
											}
										}

										break;
									}
									case 'eraser': {
									}
									case 'fill': {
									}
									case 'brush': {
										this.voxelEditor.handleMapToolEdit();
										break;
									}
								}
							} else if (
								Utils.isRightButton(event.buttons) &&
								(developerMode.activeButton === 'brush' || developerMode.activeButton === 'fill')
							) {
								const intersect = this.raycastFloor();
								if (!intersect) {
									return;
								}
								rightClickPos = { x: intersect.x, y: intersect.z };
							}
						}
					}

					if (
						Utils.isRightButton(event.buttons) &&
						taro.game.data.defaultData.contextMenuEnabled &&
						(!taro.developerMode.active || (taro.developerMode.active && taro.developerMode.activeTab === 'play'))
					) {
						const raycaster = new THREE.Raycaster();
						raycaster.setFromCamera(this.pointer, this.camera.instance);

						const intersects = raycaster.intersectObjects(this.entityManager.entities);
						for (const intersect of intersects) {
							const closest = intersect.object as THREE.Mesh;
							const unit = this.entityManager.units.find((unit) => unit.sprite === closest);
							if (unit) {
								const clientUnit = taro.client.selectedUnit;
								const otherUnit = taro.$(unit.taroId);

								if (clientUnit === otherUnit) {
									break;
								}

								const otherOwnerUnit = taro.$(unit.ownerId);
								if (otherOwnerUnit?._stats?.controlledBy === 'human') {
									if (typeof showUserDropdown !== 'undefined') {
										showUserDropdown({ ownerId: unit.ownerId, unitId: unit.taroId, pointer: { event } });
									}
								}

								break;
							}
						}
					}
				});

				window.addEventListener('mouseup', (event: MouseEvent) => {
					const developerMode = taro.developerMode;
					this.voxelEditor.leftButtonDown = false;
					if (developerMode.regionTool) {
						developerMode.regionTool = false;
						this.camera.controls.enablePan = true;
						this.camera.controls.enableRotate = true;
						this.camera.controls.enableZoom = true;
						line?.geometry.dispose();
						this.scene.remove(line);
						line = null;

						taro.mapEditorUI.highlightToolsButton('cursor');
						let x = this.regionDrawStart.x;
						let y = this.regionDrawStart.y;
						if (width < 0) {
							x = this.regionDrawStart.x + width;
							width *= -1;
						}
						if (height < 0) {
							y = this.regionDrawStart.y + height;
							height *= -1;
						}

						inGameEditor.addNewRegion &&
							inGameEditor.addNewRegion({
								name: '',
								x: Math.trunc(Utils.worldToPixel(x)),
								y: Math.trunc(Utils.worldToPixel(y)),
								width: Math.trunc(Utils.worldToPixel(width)),
								height: Math.trunc(Utils.worldToPixel(height)),
							});

						this.regionDrawStart = null;
					} else if (
						developerMode.active &&
						developerMode.activeTab === 'map' &&
						Utils.isRightButton(event.button) &&
						(developerMode.activeButton === 'brush' || developerMode.activeButton === 'fill')
					) {
						const intersect = this.raycastFloor();
						if (!intersect) {
							return;
						}
						const newRightClickPos = { x: intersect.x, y: intersect.z };
						if (
							rightClickPos &&
							Math.abs(newRightClickPos.x - rightClickPos.x) < 0.01 &&
							Math.abs(newRightClickPos.y - rightClickPos.y) < 0.01
						) {
							this.voxelEditor.handleMapToolCopy();
						}
						rightClickPos = undefined;
					}
				});

				this.forceLoadUnusedCSSFonts();

				this.initLoadingManager.onLoad = () => {
					this.init();
					taro.input.setupListeners(this.renderer.domElement);
					taro.client.rendererLoaded.resolve();
					requestAnimationFrame(this.render.bind(this));
				};

				this.loadTextures();

				taro.client.on('enterPlayTab', () => {
					this.mode = Mode.Play;
					this.onEnterPlayMode();
				});

				taro.client.on('leavePlayTab', () => {
					this.onExitPlayMode();
				});

				taro.client.on('enterMapTab', () => {
					this.mode = Mode.Map;
					this.onEnterMapMode();
				});

				taro.client.on('leaveMapTab', () => {
					this.onExitMapMode();
				});

				taro.client.on('enterEntitiesTab', () => {
					this.mode = Mode.Entities;
					this.onEnterEntitiesMode();
				});

				taro.client.on('leaveEntitiesTab', () => {
					this.onExitEntitiesMode();
				});

				taro.client.on('update-region-name', (data: { name: string; newName: string }) => {
					const region = this.entityManager.entities.find((e) => e instanceof Region && e.name === data.name) as Region;
					if (region) {
						region.name = data.newName;
						region.updateLabel(data.newName);
					}
				});
			}

			static instance() {
				if (!this._instance) {
					this._instance = new Renderer();
				}

				return this._instance;
			}

			static getPointer() {
				return this._instance.pointer.clone();
			}

			static getVoxels() {
				return this._instance.voxels;
			}

			tmpSetTIleId(tileId: number) {
				this.tmp_tileId = tileId;
				this.voxelEditor.voxelMarker.updatePreview(false);
			}

			raycastFloor(layer?: number): THREE.Vector3 | null {
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(this.pointer, this.camera.instance);
				let intersectionPoint = new THREE.Vector3();
				const intersect = raycaster.ray.intersectPlane(
					this.voxels.layerPlanes[layer ?? this.voxelEditor.currentLayerIndex],
					intersectionPoint
				);
				return intersect;
			}

			getViewportBounds() {
				const halfWidth = (window.innerWidth * 0.5) / this.camera.zoom;
				const halfHeight = (window.innerHeight * 0.5) / this.camera.zoom;
				const p = this.camera.instance.position;
				return {
					x: Utils.worldToPixel(p.x) - halfWidth,
					y: Utils.worldToPixel(p.z) - halfHeight,
					width: halfWidth * 2,
					height: halfHeight * 2,
				};
			}

			getCameraWidth(): number {
				return window.innerWidth;
			}

			getCameraHeight(): number {
				return window.innerHeight;
			}

			private onEnterPlayMode() {
				this.camera.setEditorMode(false);
			}

			private onExitPlayMode() {
				this.camera.setEditorMode(true);
			}

			private onEnterMapMode() {
				this.hideEntities();
				this.entityManager.regions.forEach((r) => r.setMode(RegionMode.Development));
			}

			private onExitMapMode() {
				this.showEntities();
				this.entityManager.regions.forEach((r) => r.setMode(RegionMode.Normal));
				this.voxelEditor.voxels.updateLayer(new Map(), this.voxelEditor.currentLayerIndex);
				this.voxelEditor.showAllLayers();
			}

			private onEnterEntitiesMode() {}

			private onExitEntitiesMode() {}

			private showEntities() {
				this.setEntitiesVisible(true);
			}

			private hideEntities() {
				this.setEntitiesVisible(false);
			}

			private setEntitiesVisible(visible: boolean) {
				this.particleSystem.visible = visible;
				this.entitiesLayer.visible = visible;
			}

			private loadTextures() {
				const textureMgr = TextureManager.instance();
				textureMgr.setFilter(taro.game.data.defaultData.renderingFilter);
				textureMgr.setLoadingManager(this.initLoadingManager);

				const data = taro.game.data;

				data.map.tilesets.forEach((tileset) => {
					const key = tileset.image;
					textureMgr.loadTextureFromUrl(key, Utils.patchAssetUrl(key));
				});

				const taroEntities = [
					...Object.values(data.unitTypes),
					...Object.values(data.projectileTypes),
					...Object.values(data.itemTypes),
				];

				for (const taroEntity of taroEntities) {
					const cellSheet = taroEntity.cellSheet;
					if (!cellSheet) continue;

					const key = cellSheet.url;
					const cols = cellSheet.columnCount;
					const rows = cellSheet.rowCount;

					textureMgr.loadTextureSheetFromUrl(key, Utils.patchAssetUrl(key), cols, rows, () => {
						AnimationManager.instance().createAnimationsFromTaroData(key, taroEntity);
					});
				}

				for (const taroEntity of Object.values(data.particleTypes)) {
					const key = taroEntity.url;
					textureMgr.loadTextureFromUrl(`particle/${key}`, Utils.patchAssetUrl(key));
				}

				const urls = taro.game.data.settings.skybox;
				textureMgr.loadTextureFromUrl('left', urls.left);
				textureMgr.loadTextureFromUrl('right', urls.right);
				textureMgr.loadTextureFromUrl('top', urls.top);
				textureMgr.loadTextureFromUrl('bottom', urls.bottom);
				textureMgr.loadTextureFromUrl('front', urls.front);
				textureMgr.loadTextureFromUrl('back', urls.back);

				textureMgr.setLoadingManager(THREE.DefaultLoadingManager);
			}

			private forceLoadUnusedCSSFonts() {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				ctx.font = 'normal 4px Verdana';
				ctx.fillText('text', 0, 8);
				ctx.font = 'bold 4px Verdana';
				ctx.fillText('text', 0, 8);
			}

			private init() {
				this.sky = new Skybox();
				this.scene.add(this.sky);

				this.voxels = Voxels.create(taro.game.data.map.layers);
				this.voxelEditor = new VoxelEditor(this.voxels);
				this.scene.add(this.voxels);
				this.scene.add(this.voxelEditor.voxelMarker);

				this.particleSystem = new ParticleSystem();
				this.scene.add(this.particleSystem);

				this.entitiesLayer.position.y = 0.51;
				this.scene.add(this.entitiesLayer);

				this.regionsLayer.position.y = 0.51;
				this.scene.add(this.regionsLayer);

				const createEntity = (taroEntity: TaroEntityPhysics, type: 'unit' | 'item' | 'projectile' | 'region') => {
					const entity = this.entityManager.create(taroEntity, type);

					switch (type) {
						case 'region':
							this.regionsLayer.add(entity);
							break;
						default:
							this.entitiesLayer.add(entity);
					}

					taroEntity.on('destroy', () => {
						this.entityManager.destroy(entity);
						this.particleSystem.destroyEmittersWithTarget(entity);
					});

					taroEntity.on('follow', () => {
						this.camera.follow(entity);

						const offset = entity.cameraConfig.offset;
						this.camera.setOffset(offset.x, offset.y, offset.z);

						if (entity.cameraConfig.pointerLock) {
							const { min, max } = entity.cameraConfig.pitchRange;
							this.camera.setElevationRange(min, max);
						}

						this.camera.setPointerLock(entity.cameraConfig.pointerLock);
					});
				};

				taro.client.on('create-unit', (u: TaroEntityPhysics) => createEntity(u, 'unit'), this);
				taro.client.on('create-item', (i: TaroEntityPhysics) => createEntity(i, 'item'), this);
				taro.client.on('create-projectile', (p: TaroEntityPhysics) => createEntity(p, 'projectile'), this);
				taro.client.on('create-region', (r: TaroEntityPhysics) => createEntity(r, 'region'), this);

				taro.client.on('zoom', (height: number) => {
					if (this.camera.zoomHeight === height * 2.15) return;
					this.camera.setZoomByHeight(height * 2.15);
					taro.client.emit('scale', { ratio: this.camera.zoom });
					this.entityManager.scaleGui(1 / this.camera.zoom);
				});

				taro.client.on('stop-follow', () => this.camera.unfollow());
				taro.client.on('camera-pitch', (deg: number) => this.camera.setElevationAngle(deg));

				taro.client.on('camera-position', (x: number, y: number) => {
					if (!taro.developerMode.active || taro.developerMode.activeTab === 'play') {
						this.camera.setPosition2D(Utils.pixelToWorld(x), Utils.pixelToWorld(y), true);
					}
				});

				taro.client.on('camera-instant-move', (x: number, y: number) => {
					if (!taro.developerMode.active || taro.developerMode.activeTab === 'play') {
						this.camera.setPosition2D(Utils.pixelToWorld(x), Utils.pixelToWorld(y));
					}
				});

				taro.client.on('create-particle-emitter', (particle: Particle) => {
					const emitter = this.particleSystem.createEmitter(particle);
					emitter.position.y += this.entitiesLayer.position.y;

					if (particle.entityId) {
						const entity = this.entityManager.entities.find((entity) => entity.taroId == particle.entityId);
						if (entity) {
							emitter.target = entity;
						}
					}

					this.particleSystem.emit(emitter);
				});

				taro.client.on('start-emitting-particles', (data: { particleTypeId: string; entityId: string }) => {
					const emitter = this.particleSystem.emitters.find(({ particleTypeId, target }) => {
						return particleTypeId === data.particleTypeId && target.taroId === data.entityId;
					});

					this.particleSystem.startEmitter(emitter);
				});

				taro.client.on('stop-emitting-particles', (data: { particleTypeId: string; entityId: string }) => {
					const emitter = this.particleSystem.emitters.find(({ particleTypeId, target }) => {
						return particleTypeId === data.particleTypeId && target.taroId === data.entityId;
					});

					this.particleSystem.stopEmitter(emitter);
				});

				taro.client.on('floating-text', (config: FloatingTextConfig) => {
					const zOffset = this.camera.target ? this.camera.target.position.y : 0;
					this.entitiesLayer.add(FloatingText.create(config, zOffset));
				});

				taro.client.on('dynamic-floating-text', (config: DynamicFloatingTextConfig) => {
					const zOffset = this.camera.target ? this.camera.target.position.y : 0;
					const dynamicText = DynamicFloatingText.create(config, zOffset);
					this.entitiesLayer.add(dynamicText);
				});
			}

			private render() {
				requestAnimationFrame(this.render.bind(this));
				taro.client.emit('tick');

				if (this.camera.target && !taro.isMobile) {
					const worldPos = this.camera.getWorldPoint(this.pointer);
					const x = Utils.worldToPixel(worldPos.x);
					const y = Utils.worldToPixel(worldPos.z);
					const yaw = this.camera.getAzimuthAngle();
					const pitch = this.camera.getElevationAngle();
					taro.input.emit('pointermove', [{ x, y, yaw, pitch }]);
				}

				// TODO: Is this the proper way to get deltaTime or should I get it from the
				// engine somewhere? Also it feels a little weird that the renderer triggers
				// the engine update. It should be the other way around.
				let dt = this.clock.getDelta();
				const time = this.clock.elapsedTime;
				if (dt <= 0) dt = 1 / 60;
				else if (dt >= 0.25) dt = 0.25;

				this.entityManager.update(dt);
				this.particleSystem.update(dt, time, this.camera.instance);
				this.camera.update();
				this.voxelEditor.update();

				if (this.camera.target) {
					this.sky.position.copy(this.camera.target.position);
				}

				this.timeSinceLastRaycast += dt;
				if (this.timeSinceLastRaycast > this.raycastIntervalSeconds) {
					this.timeSinceLastRaycast = 0;
					// this.checkForHiddenEntities();
				}

				TWEEN.update();
				this.renderer.render(this.scene, this.camera.instance);
			}

			private checkForHiddenEntities() {
				for (const unit of this.entityManager.units) {
					// TODO(nick): Need a way to to identify avatar units from NPC's
					unit.showHud(this.isEntityInLineOfSight(unit));
				}
			}

			private isEntityInLineOfSight(unit: Unit) {
				return this.camera.isVisible(unit, this.voxels);
			}
		}
	}
}
