/// <reference types="@types/google.analytics" />

namespace Renderer {
	export namespace Three {
		export function instance() {
			return Renderer.instance();
		}

		class Renderer {
			private static _instance: Renderer;

			renderer: THREE.WebGLRenderer;
			camera: Camera;
			scene: THREE.Scene;

			private clock = new THREE.Clock();
			private pointer = new THREE.Vector2();
			private initLoadingManager = new THREE.LoadingManager();
			private entityManager = new EntityManager();

			private sky: Sky;
			private voxels: Voxels;
			private particles: Particles;

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

					taro.client.emit('scale', { ratio: this.camera.zoom });
					taro.client.emit('update-abilities-position');
					this.entityManager.scaleGui(1 / this.camera.zoom);
				});

				window.addEventListener('mousemove', (evt: MouseEvent) => {
					this.pointer.set((evt.clientX / window.innerWidth) * 2 - 1, -(evt.clientY / window.innerHeight) * 2 + 1);
				});

				window.addEventListener('mousedown', (event: MouseEvent) => {
					if (Utils.isRightButton(event.buttons)) {
						const raycaster = new THREE.Raycaster();
						raycaster.setFromCamera(this.pointer, this.camera.instance);

						const intersects = raycaster.intersectObjects(this.entityManager.entities);
						if (intersects.length > 0) {
							const closest = intersects[0].object as THREE.Mesh;
							const unit = this.entityManager.entities.find((e) => e.sprite === closest);

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

				this.forceLoadUnusedCSSFonts();

				this.initLoadingManager.onLoad = () => {
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

			private loadTextures() {
				const textureRepository = TextureRepository.instance();
				textureRepository.setFilter(taro.game.data.defaultData.renderingFilter);
				textureRepository.setLoadingManager(this.initLoadingManager);

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
						AnimatedSprite.createAnimations(type);
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

				textureRepository.setLoadingManager(THREE.DefaultLoadingManager);
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
				this.sky = new Sky();
				this.sky.translateX(taro.game.data.map.width / 2);
				this.sky.translateZ(taro.game.data.map.height / 2);
				this.scene.add(this.sky);

				this.voxels = Voxels.create(taro.game.data.map.layers);
				this.scene.add(this.voxels);

				this.particles = new Particles();
				this.scene.add(this.particles);

				const entities = new THREE.Group();
				entities.position.y = 0.51;
				this.scene.add(entities);

				const createEntity = (taroEntity: TaroEntityPhysics) => {
					const entity = this.entityManager.create(taroEntity);
					entities.add(entity);
					taroEntity.on('destroy', () => this.entityManager.destroy(entity));

					taroEntity.on('follow', () => {
						this.camera.follow(entity);

						const offset = entity.cameraConfig.offset;
						this.camera.setOffset(offset.x, offset.y, offset.z);

						if (entity.cameraConfig.pointerLock) {
							const { min, max } = entity.cameraConfig.pitchRange;
							this.camera.setElevationRange(min, max);
						}
					});
				};

				taro.client.on('create-unit', (u: TaroEntityPhysics) => createEntity(u), this);
				taro.client.on('create-item', (i: TaroEntityPhysics) => createEntity(i), this);
				taro.client.on('create-projectile', (p: TaroEntityPhysics) => createEntity(p), this);

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
					const emitter = this.particles.createEmitter(particle);
					emitter.position.y += entities.position.y;

					if (particle.entityId) {
						const entity = this.entityManager.entities.find((entity) => entity.taroId == particle.entityId);
						if (entity) {
							emitter.target = entity;
						}
					}

					this.particles.emit(emitter);
				});

				taro.client.on('floating-text', (config: FloatingTextConfig) => this.scene.add(FloatingText.create(config)));
			}

			private render() {
				requestAnimationFrame(this.render.bind(this));
				taro.client.emit('tick');

				if (this.camera.target) {
					const worldPos = this.camera.getWorldPoint(this.pointer);
					const center = { x: taro.game.data.map.width / 2 + 0.5, z: taro.game.data.map.height / 2 + 0.5 };
					taro.input.emit('pointermove', [{ x: (worldPos.x + center.x) * 64, y: (worldPos.z + center.z) * 64 }]);
				}

				// TODO: Is this the proper way to get deltaTime or should I get it from the
				// engine somewhere? Also it feels a little weird that the renderer triggers
				// the engine update. It should be the other way around.
				let dt = this.clock.getDelta();
				const time = this.clock.elapsedTime;
				if (dt <= 0) dt = 1 / 60;
				else if (dt >= 0.25) dt = 0.25;

				this.entityManager.update(dt);
				this.particles.update(dt, time, this.camera.instance);
				this.camera.update();

				if (this.camera.target) {
					this.sky.position.copy(this.camera.target.position);
				}

				TWEEN.update();
				this.renderer.render(this.scene, this.camera.instance);
			}
		}
	}
}
