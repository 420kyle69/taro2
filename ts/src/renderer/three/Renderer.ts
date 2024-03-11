/// <reference types="@types/google.analytics" />

namespace Renderer {
	export namespace Three {
		export function instance() {
			return Renderer.instance();
		}

		class Renderer {
			renderer: THREE.WebGLRenderer;
			camera: Camera;
			scene: THREE.Scene;

			private static _instance: Renderer;

			private clock = new THREE.Clock();

			private zoomSize = undefined;
			private pointer = new THREE.Vector2();

			private sky: Sky;
			private voxels: Voxels;
			private particles: Particles;

			private animations: Map<string, { frames: number[]; fps: number; repeat: number }> = new Map();
			private entities: Unit[] = [];
			private animatedSprites: AnimatedSprite[] = [];

			private constructor() {
				// For JS interop; in case someone uses new Renderer.ThreeRenderer()
				if (!Renderer._instance) {
					Renderer._instance = this;
				} else {
					return Renderer._instance;
				}

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
				this.scene.translateX(-taro.game.data.map.width / 2);
				this.scene.translateZ(-taro.game.data.map.height / 2);

				window.addEventListener('resize', () => {
					this.camera.resize(window.innerWidth, window.innerHeight);
					renderer.setSize(window.innerWidth, window.innerHeight);
					renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
					renderer.render(this.scene, this.camera.instance);

					if (this.zoomSize) {
						const ratio = Math.max(window.innerWidth, window.innerHeight) / this.zoomSize;
						this.camera.setZoom(ratio);
						taro.client.emit('scale', { ratio });
						taro.client.emit('update-abilities-position');

						for (const entity of this.entities) {
							entity.setGuiScale(1 / ratio);
						}
					}
				});

				window.addEventListener('mousemove', (evt: MouseEvent) => {
					this.pointer.set((evt.clientX / window.innerWidth) * 2 - 1, -(evt.clientY / window.innerHeight) * 2 + 1);
				});

				window.addEventListener('mousedown', (event: MouseEvent) => {
					if (Utils.isRightButton(event.buttons)) {
						const raycaster = new THREE.Raycaster();
						raycaster.setFromCamera(this.pointer, this.camera.instance);

						const intersects = raycaster.intersectObjects(this.entities);
						if (intersects.length > 0) {
							const closest = intersects[0].object as THREE.Mesh;
							const unit = this.entities.find((e) => e.sprite === closest);

							if (unit) {
								const ownerPlayer = taro.$(unit.ownerId);
								if (ownerPlayer?._stats?.controlledBy === 'human') {
									if (typeof showUserDropdown !== 'undefined') {
										showUserDropdown({ ownerId: unit.ownerId, unitId: unit.taroId, pointer: { event } });
									}
								}
							}
						}
					}
				});

				THREE.DefaultLoadingManager.onStart = () => {
					this.forceLoadUnusedCSSFonts();
				};

				THREE.DefaultLoadingManager.onLoad = () => {
					this.init();
					taro.input.setupListeners(this.renderer.domElement);
					taro.client.rendererLoaded.resolve();
					requestAnimationFrame(this.render.bind(this));
				};

				this.loadTextures();
			}

			static instance() {
				if (!this._instance) {
					this._instance = new Renderer();
				}

				return this._instance;
			}

			private loadTextures() {
				const textureRepository = TextureRepository.instance();
				textureRepository.setFilter(taro.game.data.defaultData.renderingFilter);

				const data = taro.game.data;

				data.map.tilesets.forEach((tileset) => {
					const key = tileset.image;
					textureRepository.loadFromUrl(key, Utils.patchAssetUrl(key));
				});

				const entityTypes = [
					...Object.values(data.unitTypes),
					...Object.values(data.projectileTypes),
					...Object.values(data.itemTypes),
				];

				for (const type of entityTypes) {
					const cellSheet = type.cellSheet;
					if (!cellSheet) continue;
					const key = cellSheet.url;
					textureRepository.loadFromUrl(key, Utils.patchAssetUrl(key), () => {
						this.createAnimations(type);
					});
				}

				for (const type of Object.values(data.particleTypes)) {
					const key = type.url;
					textureRepository.loadFromUrl(`particle/${key}`, Utils.patchAssetUrl(key));
				}

				const urls = taro.game.data.settings.skybox;
				textureRepository.loadFromUrl('left', urls.left);
				textureRepository.loadFromUrl('right', urls.right);
				textureRepository.loadFromUrl('top', urls.top);
				textureRepository.loadFromUrl('bottom', urls.bottom);
				textureRepository.loadFromUrl('front', urls.front);
				textureRepository.loadFromUrl('back', urls.back);
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
				// Sky
				const sky = new Sky();
				sky.translateX(taro.game.data.map.width / 2);
				sky.translateZ(taro.game.data.map.height / 2);
				this.scene.add(sky);
				this.sky = sky;

				// Voxels
				const textureRepository = TextureRepository.instance();
				const tilesetMain = this.getTilesetFromType('top');
				let tilesetSide = this.getTilesetFromType('side');
				if (!tilesetSide) tilesetSide = tilesetMain;

				const texMain = textureRepository.get(tilesetMain.image);
				const texSide = textureRepository.get(tilesetSide.image);

				const topTileset = new Tileset(texMain, tilesetMain.tilewidth, tilesetMain.tilewidth);
				const sidesTileset = new Tileset(texSide, tilesetSide.tilewidth, tilesetSide.tilewidth);

				this.voxels = new Voxels(topTileset, sidesTileset);
				this.scene.add(this.voxels);

				let numTileLayers = 0;
				for (const [idx, layer] of taro.game.data.map.layers.entries()) {
					if (layer.type === 'tilelayer' && layer.data) {
						this.voxels.addLayer(layer, numTileLayers, true, false, (idx + 1) * 100);
						numTileLayers++;
					}
				}

				// Particles
				this.particles = new Particles();
				this.scene.add(this.particles);

				const entities = new THREE.Group();
				entities.position.y = 0.51;
				this.scene.add(entities);

				const createEntity = (entity: TaroEntityPhysics) => {
					let tex = textureRepository.get(entity._stats.cellSheet.url);
					const ent = new Unit(entity._id, entity._stats.ownerId, tex.clone());
					ent.setBillboard(!!entity._stats.isBillboard, this.camera);

					if (this.zoomSize) {
						// TODO(nick): Refactor to get zoom value from camera?
						const ratio = Math.max(window.innerWidth, window.innerHeight) / this.zoomSize;
						ent.setGuiScale(1 / ratio);
					}

					if (entity._stats.cameraPointerLock) {
						ent.cameraConfig.pointerLock = entity._stats.cameraPointerLock;
					}

					if (entity._stats.cameraPitchRange) {
						ent.cameraConfig.pitchRange = entity._stats.cameraPitchRange;
					}

					if (entity._stats.cameraOffset) {
						// From editor XZY to Three.js XYZ
						ent.cameraConfig.offset.x = entity._stats.cameraOffset.x;
						ent.cameraConfig.offset.y = entity._stats.cameraOffset.z;
						ent.cameraConfig.offset.z = entity._stats.cameraOffset.y;
					}

					entities.add(ent);
					this.entities.push(ent);
					this.animatedSprites.push(ent);

					entity.on('scale', (data: { x: number; y: number }) => ent.scale.set(data.x, 1, data.y), this);
					entity.on('show', () => (ent.visible = true), this);
					entity.on('hide', () => (ent.visible = false), this);
					entity.on('show-label', () => (ent.label.visible = true));
					entity.on('hide-label', () => (ent.label.visible = false));
					entity.on('render-attributes', (data) => (ent as Unit).renderAttributes(data));
					entity.on('update-attribute', (data) => (ent as Unit).updateAttribute(data));
					entity.on('render-chat-bubble', (text) => (ent as Unit).renderChat(text));
					entity.on('layer', (layer) => ent.setLayer(layer));
					entity.on('depth', (depth) => ent.setDepth(depth));
					entity.on('z-offset', (offset) => ent.setZOffset(Utils.pixelToWorld(offset)));
					entity.on('flip', (flip) => ent.setFlip(flip % 2 === 1, flip > 1));

					entity.on(
						'transform',
						(data: { x: number; y: number; rotation: number }) => {
							ent.position.x = Utils.pixelToWorld(data.x) - 0.5;
							ent.position.z = Utils.pixelToWorld(data.y) - 0.5;

							// let angle = -data.rotation;
							// if (ent.billboard && (entity instanceof Item || entity instanceof Projectile)) {
							// 	// Might be able to delete this once units rotate with camera yaw.
							// 	angle -= this.camera.controls.getAzimuthalAngle();
							// }
							ent.setRotationY(-data.rotation);
						},
						this
					);

					entity.on(
						'size',
						(data: { width: number; height: number }) => {
							ent.setScale(Utils.pixelToWorld(data.width), Utils.pixelToWorld(data.height));
						},
						this
					);

					entity.on(
						'follow',
						() => {
							this.camera.startFollow(ent);

							const offset = ent.cameraConfig.offset;
							this.camera.setOffset(offset.x, offset.y, offset.z);

							if (ent.cameraConfig.pointerLock) {
								const { min, max } = ent.cameraConfig.pitchRange;
								this.camera.setElevationRange(min, max);
							}
						},
						this
					);

					entity.on('update-label', (data) => {
						ent.label.visible = true;
						ent.label.update(data.text, data.color, data.bold);
					});

					entity.on('play-animation', (id) => {
						const animation = this.animations.get(`${tex.userData.key}/${id}`);
						if (animation) {
							ent.loop(animation.frames, animation.fps, animation.repeat);
						}
					});

					entity.on('update-texture', (data) => {
						const textureRepository = TextureRepository.instance();
						const key = entity._stats.cellSheet.url;
						const tex2 = textureRepository.get(key);
						if (tex2) {
							this.createAnimations(entity._stats);
							tex = tex2.clone();
							ent.setTexture(tex);
							const bounds = entity._bounds2d;
							ent.setScale(Utils.pixelToWorld(bounds.x), Utils.pixelToWorld(bounds.y));
						} else {
							textureRepository.loadFromUrl(key, Utils.patchAssetUrl(key), (tex2) => {
								this.createAnimations(entity._stats);
								tex = tex2.clone();
								ent.setTexture(tex);
								const bounds = entity._bounds2d;
								ent.setScale(Utils.pixelToWorld(bounds.x), Utils.pixelToWorld(bounds.y));
							});
						}
					});

					entity.on('fading-text', (data: { text: string; color?: string }) => {
						const size = ent.getSizeInPixels();
						const offsetInPixels = -25 - size.height * 0.5;
						const text = new FloatingText(0, 0, 0, data.text || '', data.color || '#ffffff', 0, -offsetInPixels);
						ent.add(text);
					});

					entity.on(
						'destroy',
						() => {
							const idx = this.entities.indexOf(ent, 0);
							if (idx > -1) {
								entities.remove(ent);
								this.entities.splice(idx, 1);

								for (const emitter of this.particles.emitters) {
									if (emitter.target === ent) {
										emitter.target = null;
									}
								}

								const animIdx = this.animatedSprites.indexOf(ent as AnimatedSprite, 0);
								if (animIdx > -1) {
									this.animatedSprites.splice(animIdx, 1);
								}

								for (const [key, listener] of Object.entries(entity.eventList())) {
									entity.off(key, listener);
								}
							}
						},
						this
					);
				};

				taro.client.on('create-unit', (u: TaroEntityPhysics) => createEntity(u), this);
				taro.client.on('create-item', (i: TaroEntityPhysics) => createEntity(i), this);
				taro.client.on('create-projectile', (p: TaroEntityPhysics) => createEntity(p), this);

				taro.client.on('zoom', (height: number) => {
					if (this.zoomSize === height * 2.15) return;

					this.zoomSize = height * 2.15;
					const ratio = Math.max(window.innerWidth, window.innerHeight) / this.zoomSize;

					// TODO: Quadratic zoomTo over 1 second
					this.camera.setZoom(ratio);

					taro.client.emit('scale', { ratio });

					for (const entity of this.entities) {
						entity.setGuiScale(1 / ratio);
					}
				});

				taro.client.on('stop-follow', () => this.camera.stopFollow());
				taro.client.on('camera-pitch', (deg: number) => this.camera.setElevationAngle(deg));

				taro.client.on('camera-position', (x: number, y: number) => {
					if (!taro.developerMode.active || taro.developerMode.activeTab === 'play') {
						this.camera.setPosition2D(
							this.scene.position.x + Utils.pixelToWorld(x),
							this.scene.position.z + Utils.pixelToWorld(y),
							true
						);
					}
				});

				taro.client.on('camera-instant-move', (x: number, y: number) => {
					if (!taro.developerMode.active || taro.developerMode.activeTab === 'play') {
						this.camera.setPosition2D(
							this.scene.position.x + Utils.pixelToWorld(x),
							this.scene.position.z + Utils.pixelToWorld(y)
						);
					}
				});

				taro.client.on('create-particle', (particle: Particle) => {
					const particleData = taro.game.data.particleTypes[particle.particleId];
					const tex = TextureRepository.instance().get(`particle/${particleData.url}`);

					let zPosition = entities.position.y;
					if (particleData['z-index'].layer) zPosition += Utils.getLayerZOffset(particleData['z-index'].layer);
					if (particleData['z-index'].depth) zPosition += Utils.getDepthZOffset(particleData['z-index'].depth);
					if (particleData['z-index'].offset) zPosition += Utils.pixelToWorld(particleData['z-index'].offset);

					let target = null;
					if (particle.entityId) {
						const entity = this.entities.find((entity) => entity.taroId == particle.entityId);
						if (entity) {
							target = entity;
						}
					}

					const angle = particleData.fixedRotation ? 0 : particle.angle * (Math.PI / 180);
					const direction = { x: 0, y: 0, z: 1 }; // Phaser particle system starts in this direction
					const cos = Math.cos(angle);
					const sin = Math.sin(angle);
					direction.x = direction.x * cos - direction.z * sin;
					direction.z = direction.x * sin + direction.z * cos;

					const angleMin = (particleData.angle.min - 180) * (Math.PI / 180);
					const angleMax = (particleData.angle.max - 180) * (Math.PI / 180);

					const speedMin = Utils.pixelToWorld(particleData.speed.min);
					const speedMax = Utils.pixelToWorld(particleData.speed.max);

					const lifetimeFrom = particleData.lifeBase * 0.001;
					const lifetimeTo = particleData.lifeBase * 0.001;

					const opacityFrom = 1;
					const opacityTo = particleData.deathOpacityBase;

					const duration = particleData.duration * 0.001;

					const frequency = particleData.emitFrequency * 0.001;

					const width = Utils.pixelToWorld(particleData.dimensions.width);
					const height = Utils.pixelToWorld(particleData.dimensions.height);

					let emitWidth = 0;
					let emitDepth = 0;
					if (particleData.emitZone) {
						if (particleData.emitZone.x) emitWidth = Utils.pixelToWorld(particleData.emitZone.x);
						if (particleData.emitZone.y) emitDepth = Utils.pixelToWorld(particleData.emitZone.y);
					}

					this.particles.emit({
						position: { x: particle.position.x, y: zPosition, z: particle.position.y },
						target: target,
						direction: direction,
						azimuth: { min: angleMin, max: angleMax },
						elevation: { min: 0, max: 0 },
						shape: { width: emitWidth, height: 0, depth: emitDepth },
						addInterval: frequency,
						lifetime: { min: lifetimeFrom, max: lifetimeTo },
						rotation: { min: 0.5, max: 1 },
						speed: { min: speedMin, max: speedMax },
						scale: { x: width, y: height, start: 1, step: 0 },
						color: { start: [1, 1, 1], end: [1, 1, 1] },
						color_speed: { min: 1, max: 1 },
						brightness: { min: 1, max: 1 },
						opacity: { start: opacityFrom, end: opacityTo },
						blend: 1,
						texture: tex,
						duration: duration,
					});
				});

				taro.client.on('floating-text', (data: { text: string; x: number; y: number; color: string }) => {
					const text = new FloatingText(
						Utils.pixelToWorld(data.x) - 0.5,
						// Will only look good top down orthographic currently; Need to get
						// correct height from engine when the engine uses 3D coords.
						1500,
						Utils.pixelToWorld(data.y) - 0.5,
						data.text,
						data.color
					);
					this.scene.add(text);
				});
			}

			private render() {
				requestAnimationFrame(this.render.bind(this));
				taro.client.emit('tick');

				if (this.camera.target) {
					const worldPos = this.camera.getWorldPoint(this.pointer);
					const center = { x: taro.game.data.map.width / 2 + 0.5, z: taro.game.data.map.height / 2 + 0.5 };
					taro.input.emit('pointermove', [{ x: (worldPos.x + center.x) * 64, y: (worldPos.z + center.z) * 64 }]);
				}

				for (const sprite of this.animatedSprites) {
					sprite.update(1 / 60);
				}

				// TODO: Is this the proper way to get deltaTime or should I get it from the
				// engine somewhere? Also it feels a little weird that the renderer triggers
				// the engine update. It should be the other way around.
				let dt = this.clock.getDelta();
				const time = this.clock.elapsedTime;

				if (dt <= 0) dt = 1 / 60;
				else if (dt >= 0.25) dt = 0.25;

				this.particles.update(dt, time, this.camera.instance);

				this.camera.update();

				if (this.camera.target) {
					this.sky.position.copy(this.camera.target.position);
				}

				TWEEN.update();

				this.renderer.render(this.scene, this.camera.instance);
			}

			private createAnimations(entity: EntityData) {
				const cellSheet = entity.cellSheet;
				if (!cellSheet) return;
				const key = cellSheet.url;
				const tex = TextureRepository.instance().get(key);
				tex.userData.numColumns = cellSheet.columnCount || 1;
				tex.userData.numRows = cellSheet.rowCount || 1;
				tex.userData.key = key;

				// Add animations
				for (let animationsKey in entity.animations) {
					const animation = entity.animations[animationsKey];
					const frames = animation.frames;
					const animationFrames: number[] = [];

					// Correction for 0-based indexing
					for (let i = 0; i < frames.length; i++) {
						animationFrames.push(+frames[i] - 1);
					}

					// Avoid crash by giving it frame 0 if no frame data provided
					if (animationFrames.length === 0) {
						animationFrames.push(0);
					}

					if (this.animations.has(`${key}/${animationsKey}`)) {
						this.animations.delete(`${key}/${animationsKey}`);
					}

					this.animations.set(`${key}/${animationsKey}`, {
						frames: animationFrames,
						fps: +animation.framesPerSecond || 15,
						repeat: +animation.loopCount - 1, // correction for loop/repeat values
					});
				}
			}

			// NOTE(nick): this feels hacky, why don't all tilesets have a type? Part
			// of a bigger problem regarding game.json parsing and presenting it in a
			// valid state for the rest of the application?
			private getTilesetFromType(type: 'top' | 'side') {
				let index = -1;
				if (type === 'top') {
					index = taro.game.data.map.tilesets.findIndex((tilesheet) => {
						return (
							(tilesheet.name === 'tilesheet_complete' || tilesheet.name === 'tilesheet') &&
							(tilesheet.type === undefined || tilesheet.type === 'top')
						);
					});
				} else {
					index = taro.game.data.map.tilesets.findIndex((tilesheet) => {
						return tilesheet.type === type;
					});
				}

				return index > -1 ? taro.game.data.map.tilesets[index] : null;
			}

			getViewportBounds() {
				const halfWidth = (window.innerWidth * 0.5) / this.camera.zoom;
				const halfHeight = (window.innerHeight * 0.5) / this.camera.zoom;
				const p = this.camera.target.position;
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
		}
	}
}
