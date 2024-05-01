namespace Renderer {
	export namespace Three {
		export class Unit extends Node {
			cameraConfig = {
				pointerLock: false,
				pitchRange: { min: -90, max: 90 },
				offset: { x: 0, y: 0, z: 0 },
			};

			body: AnimatedSprite;

			hud = new THREE.Group();

			private label = new Label({ text: '', color: 'white', bold: false, renderOnTop: true });
			private attributes = new Attributes();
			private chat: ChatBubble;

			constructor(
				public taroId: string,
				public ownerId: string,
				spriteSheet: TextureSheet,
				public taroEntity?: TaroEntityPhysics
			) {
				super();

				this.body = new AnimatedSprite(spriteSheet);
				this.add(this.body);

				this.label.visible = false;

				this.add(this.hud);
				this.hud.add(this.label);
				this.hud.add(this.attributes);
			}

			static create(taroEntity: TaroEntityPhysics) {
				const textureMgr = TextureManager.instance();
				const renderer = Three.instance();

				let spriteSheet = textureMgr.getTextureSheetShallowCopy(taroEntity._stats.cellSheet.url);
				const entity = new Unit(taroEntity._id, taroEntity._stats.ownerId, spriteSheet, taroEntity);
				entity.hud.scale.setScalar(1 / renderer.camera.lastAuthoritativeZoom);

				if (taroEntity._stats.cameraPointerLock) {
					entity.cameraConfig.pointerLock = taroEntity._stats.cameraPointerLock;
				}

				if (taroEntity._stats.cameraPitchRange) {
					entity.cameraConfig.pitchRange = taroEntity._stats.cameraPitchRange;
				}

				if (taroEntity._stats.cameraOffset) {
					// From editor XZY to Three.js XYZ
					entity.cameraConfig.offset.x = taroEntity._stats.cameraOffset.x;
					entity.cameraConfig.offset.y = taroEntity._stats.cameraOffset.z;
					entity.cameraConfig.offset.z = taroEntity._stats.cameraOffset.y;
				}

				taroEntity.on('scale', (data: { x: number; y: number }) => entity.scale.set(data.x, 1, data.y), this);
				taroEntity.on('show', () => (entity.visible = true), this);
				taroEntity.on('hide', () => (entity.visible = false), this);
				taroEntity.on('show-label', () => (entity.label.visible = true));
				taroEntity.on('hide-label', () => (entity.label.visible = false));
				taroEntity.on('render-attributes', (data) => (entity as Unit).renderAttributes(data));
				taroEntity.on('update-attribute', (data) => (entity as Unit).attributes.update(data));
				taroEntity.on('render-chat-bubble', (text) => (entity as Unit).renderChat(text));
				taroEntity.on('layer', (layer) => entity.body.setLayer(layer));
				taroEntity.on('depth', (depth) => entity.body.setDepth(depth));
				taroEntity.on('z-offset', (offset) => entity.body.setZOffset(Utils.pixelToWorld(offset)));
				taroEntity.on('flip', (flip) => entity.body.setFlip(flip % 2 === 1, flip > 1));
				taroEntity.on('billboard', (isBillboard) => entity.body.setBillboard(isBillboard, renderer.camera));

				taroEntity.on(
					'transform',
					(data: { x: number; y: number; rotation: number }) => {
						entity.position.x = Utils.pixelToWorld(data.x);
						entity.position.z = Utils.pixelToWorld(data.y);

						entity.body.setRotationY(-data.rotation);
						const flip = taroEntity._stats.flip;
						entity.body.setFlip(flip % 2 === 1, flip > 1);
					},
					this
				);

				taroEntity.on(
					'size',
					(data: { width: number; height: number }) => {
						entity.setScale(Utils.pixelToWorld(data.width), Utils.pixelToWorld(data.height));
					},
					this
				);

				taroEntity.on('update-label', (data) => {
					entity.label.visible = true;
					entity.label.update({ text: data.text, color: data.color, bold: data.bold });

					const size = entity.body.getSizeInPixels();
					const unitHeightInLabelHeightUnits = size.height / entity.label.height;
					entity.label.setCenter(0.5, 2 + unitHeightInLabelHeightUnits);
				});

				taroEntity.on('play-animation', (id) => {
					const key = `${spriteSheet.key}/${id}/${taroEntity._stats.id}`;
					entity.body.play(key);
				});

				taroEntity.on('update-texture', (data) => {
					const textureMgr = TextureManager.instance();
					const key = taroEntity._stats.cellSheet.url;
					const animationMgr = AnimationManager.instance();
					const sheet = textureMgr.getTextureSheetShallowCopy(key);

					const replaceTexture = (spriteSheet: TextureSheet) => {
						entity.body.setTextureSheet(sheet);
						const bounds = taroEntity._bounds2d;
						entity.setScale(Utils.pixelToWorld(bounds.x), Utils.pixelToWorld(bounds.y));
					};

					if (sheet) {
						replaceTexture(sheet);
					} else {
						const cols = taroEntity._stats.cellSheet.columnCount;
						const rows = taroEntity._stats.cellSheet.rowCount;
						textureMgr.loadTextureSheetFromUrl(key, Utils.patchAssetUrl(key), cols, rows, () => {
							animationMgr.createAnimationsFromTaroData(key, taroEntity._stats as unknown as EntityData);
							replaceTexture(sheet);
						});
					}
				});

				taroEntity.on('fading-text', (data: { text: string; color?: string }) => {
					const size = entity.body.getSizeInPixels();
					const offsetInPixels = -25 - size.height * 0.5;
					const text = new FloatingText(0, 0, 0, data.text || '', data.color || '#ffffff', 0, -offsetInPixels);
					entity.add(text);
				});

				return entity;
			}

			onDestroy(): void {
				if (this.taroEntity) {
					for (const [key, listener] of Object.entries(this.taroEntity.eventList())) {
						this.taroEntity.off(key, listener);
					}
				}
			}

			update(dt) {
				this.body.update(dt);
			}

			renderChat(text: string): void {
				if (this.chat) {
					this.chat.update({ text });
				} else {
					this.chat = new ChatBubble({ text });
					const labelCenter = this.label.getCenter();
					const labelOffset = this.label.height * labelCenter.y;
					const chatOffset = (labelOffset + this.label.height) / this.chat.height;
					this.chat.setCenter(0.5, 1 + chatOffset);
					this.hud.add(this.chat);
				}
			}

			// NOTE: This whole function seems off to me. What should it being
			// exactly? Clearly it's not a render function. Dive a little deeper
			// into this when you have time.
			renderAttributes(data) {
				this.attributes.clear();
				this.attributes.addAttributes(data);

				const size = this.body.getSizeInPixels();
				const halfHeight = size.height * 0.5;
				this.attributes.position.z = Utils.pixelToWorld(halfHeight);
			}

			setScale(sx: number, sy: number) {
				this.body.setScale(sx, sy);

				const size = this.body.getSizeInPixels();
				const unitHeightInLabelHeightUnits = size.height / this.label.height;
				this.label.setCenter(0.5, 2 + unitHeightInLabelHeightUnits);
			}

			showHud(visible: boolean) {
				if (visible != this.hud.visible) {
					const fadeAnimation = (from: number, to: number, onComplete = () => {}) => {
						new TWEEN.Tween({ opacity: from })
							.to({ opacity: to }, 100)
							.onUpdate(({ opacity }) => {
								this.label.setOpacity(opacity);
								this.attributes.setOpacity(opacity);
							})
							.onComplete(onComplete)
							.start();
					};

					if (visible) {
						this.hud.visible = true;
						fadeAnimation(0, 1);
					} else {
						fadeAnimation(1, 0, () => (this.hud.visible = false));
					}
				}
			}
		}
	}
}
