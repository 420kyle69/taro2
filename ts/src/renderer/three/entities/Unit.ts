namespace Renderer {
	export namespace Three {
		export class Unit extends AnimatedSprite {
			cameraConfig = {
				pointerLock: false,
				pitchRange: { min: -90, max: 90 },
				offset: { x: 0, y: 0, z: 0 },
			};

			hud = new THREE.Group();

			private label = new Label({ text: '', color: 'white', bold: false, renderOnTop: true });
			private attributes = new Attributes();
			private chat: ChatBubble;

			constructor(
				public taroId: string,
				public ownerId: string,
				tex: THREE.Texture,
				public taroEntity?: TaroEntityPhysics
			) {
				super(tex);

				this.label.visible = false;

				this.add(this.hud);
				this.hud.add(this.label);
				this.hud.add(this.attributes);
			}

			static create(taroEntity: TaroEntityPhysics) {
				const textureRepository = TextureRepository.instance();
				const renderer = Three.instance();

				let tex = textureRepository.get(taroEntity._stats.cellSheet.url);
				const entity = new Unit(taroEntity._id, taroEntity._stats.ownerId, tex.clone(), taroEntity);
				entity.setBillboard(!!taroEntity._stats.isBillboard, renderer.camera);
				entity.hud.scale.setScalar(1 / renderer.camera.zoom);

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
				taroEntity.on('layer', (layer) => entity.setLayer(layer));
				taroEntity.on('depth', (depth) => entity.setDepth(depth));
				taroEntity.on('z-offset', (offset) => entity.setZOffset(Utils.pixelToWorld(offset)));
				taroEntity.on('flip', (flip) => entity.setFlip(flip % 2 === 1, flip > 1));

				taroEntity.on(
					'transform',
					(data: { x: number; y: number; rotation: number }) => {
						entity.position.x = Utils.pixelToWorld(data.x);
						entity.position.z = Utils.pixelToWorld(data.y);

						entity.setRotationY(-data.rotation);
						const flip = taroEntity._stats.flip;
						entity.setFlip(flip % 2 === 1, flip > 1);
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
				});

				taroEntity.on('play-animation', (id) => {
					const animation = Unit.animations.get(`${tex.userData.key}/${id}/${taroEntity._stats.id}`);
					if (animation) {
						entity.loop(animation.frames, animation.fps, animation.repeat);
					}
				});

				taroEntity.on('update-texture', (data) => {
					const textureRepository = TextureRepository.instance();
					const key = taroEntity._stats.cellSheet.url;
					const tex2 = textureRepository.get(key);
					if (tex2) {
						this.createAnimations(taroEntity._stats);
						tex = tex2.clone();
						entity.setTexture(tex);
						const bounds = taroEntity._bounds2d;
						entity.setScale(Utils.pixelToWorld(bounds.x), Utils.pixelToWorld(bounds.y));
					} else {
						textureRepository.loadFromUrl(key, Utils.patchAssetUrl(key), (tex2) => {
							this.createAnimations(taroEntity._stats);
							tex = tex2.clone();
							entity.setTexture(tex);
							const bounds = taroEntity._bounds2d;
							entity.setScale(Utils.pixelToWorld(bounds.x), Utils.pixelToWorld(bounds.y));
						});
					}
				});

				taroEntity.on('fading-text', (data: { text: string; color?: string }) => {
					const size = entity.getSizeInPixels();
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

				const size = this.getSizeInPixels();
				const halfHeight = size.height * 0.5;
				this.attributes.position.z = Utils.pixelToWorld(halfHeight);
			}

			setScale(sx: number, sy: number) {
				super.setScale(sx, sy);

				const size = this.getSizeInPixels();
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
