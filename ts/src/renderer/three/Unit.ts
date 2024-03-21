namespace Renderer {
	export namespace Three {
		export class Unit extends AnimatedSprite {
			label = new Label();

			cameraConfig = {
				pointerLock: false,
				pitchRange: { min: -90, max: 90 },
				offset: { x: 0, y: 0, z: 0 },
			};

			private guiScale = 1;
			private attributeBars = new THREE.Group();
			private chat: ChatBubble;
			private hidden = false;
			private hasVisibleLabel;

			constructor(
				public taroId: string,
				public ownerId: string,
				tex: THREE.Texture,
				private taroEntity?: TaroEntityPhysics
			) {
				super(tex);

				this.label.visible = false;
				this.hasVisibleLabel = this.label.visible;
				this.add(this.label);

				this.add(this.attributeBars);
			}

			static create(taroEntity: TaroEntityPhysics) {
				const textureRepository = TextureRepository.instance();
				const renderer = Three.instance();

				let tex = textureRepository.get(taroEntity._stats.cellSheet.url);
				const entity = new Unit(taroEntity._id, taroEntity._stats.ownerId, tex.clone(), taroEntity);
				entity.setBillboard(!!taroEntity._stats.isBillboard, renderer.camera);
				entity.setGuiScale(1 / renderer.camera.zoom);

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
				taroEntity.on('show-label', () => (entity.hasVisibleLabel = entity.label.visible = true));
				taroEntity.on('hide-label', () => (entity.hasVisibleLabel = entity.label.visible = false));
				taroEntity.on('render-attributes', (data) => (entity as Unit).renderAttributes(data));
				taroEntity.on('update-attribute', (data) => (entity as Unit).updateAttribute(data));
				taroEntity.on('render-chat-bubble', (text) => (entity as Unit).renderChat(text));
				taroEntity.on('layer', (layer) => entity.setLayer(layer));
				taroEntity.on('depth', (depth) => entity.setDepth(depth));
				taroEntity.on('z-offset', (offset) => entity.setZOffset(Utils.pixelToWorld(offset)));
				taroEntity.on('flip', (flip) => entity.setFlip(flip % 2 === 1, flip > 1));

				taroEntity.on(
					'transform',
					(data: { x: number; y: number; rotation: number }) => {
						entity.position.x = Utils.pixelToWorld(data.x) - 0.5;
						entity.position.z = Utils.pixelToWorld(data.y) - 0.5;

						// let angle = -data.rotation;
						// if (ent.billboard && (entity instanceof Item || entity instanceof Projectile)) {
						// 	// Might be able to delete this once units rotate with camera yaw.
						// 	angle -= this.camera.controls.getAzimuthalAngle();
						// }
						entity.setRotationY(-data.rotation);
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
					entity.hasVisibleLabel = true;
					entity.label.update(data.text, data.color, data.bold);
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

			setHidden(hidden: boolean) {
				this.hidden = hidden;
				if (hidden) {
					this.label.visible = false;
					this.attributeBars.visible = false;
				} else {
					this.label.visible = this.hasVisibleLabel;
					this.attributeBars.visible = true;
				}
			}

			renderChat(text: string): void {
				if (this.chat) {
					this.chat.update(text);
				} else {
					this.chat = new ChatBubble(text);
					this.chat.setScale(this.guiScale);
					const textHeight = this.label.getTextSizeInPixels().height;
					this.chat.setOffset(
						new THREE.Vector2(0, this.getSizeInPixels().height * 0.5 + textHeight * 4),
						new THREE.Vector2(0.5, 0)
					);
					this.add(this.chat);
				}
			}

			renderAttributes(data) {
				this.attributeBars.remove(...this.attributeBars.children);
				data.attrs.forEach((attributeData) => this.attributeBars.add(this.createAttributeBar(attributeData)));
			}

			updateAttribute(data: { attr: AttributeData; shouldRender: boolean }) {
				let barToUpdate: AttributeBar;

				// Refactor attributeBars into map (name -> bar)
				for (const bar of this.attributeBars.children) {
					if (bar.name === data.attr.type) {
						barToUpdate = bar as AttributeBar;
						break;
					}
				}

				if (!data.shouldRender) {
					if (barToUpdate) {
						barToUpdate.visible = data.shouldRender;
					}

					return;
				}

				if (barToUpdate) {
					barToUpdate.update(data.attr);
				} else {
					this.attributeBars.add(this.createAttributeBar(data.attr));
				}
			}

			setScale(sx: number, sy: number) {
				super.setScale(sx, sy);

				const size = this.getSizeInPixels();
				const halfHeight = size.height * 0.5;

				this.label.setOffset(new THREE.Vector2(0, halfHeight), new THREE.Vector2(0.5, -1));

				for (const [idx, bar] of this.attributeBars.children.entries()) {
					const height = (bar as AttributeBar).height;
					const yOffset = idx * height * 1.1;
					(bar as AttributeBar).setOffset(
						new THREE.Vector2(
							0,
							// NOTE(nick): Mostly taken from the Phaser renderer and trial and error.
							-(halfHeight + height * (1 / 1.1) + 16 * this.guiScale + yOffset)
						)
					),
						new THREE.Vector2(0.5, 1);
				}
			}

			setGuiScale(scale: number) {
				this.guiScale = scale;

				this.label.setScale(scale);

				for (const bar of this.attributeBars.children) {
					(bar as AttributeBar).setScale(scale);
				}

				if (this.chat) {
					this.chat.setScale(scale);
				}
			}

			private createAttributeBar(data) {
				const bar = new AttributeBar();
				bar.update(data);
				const yOffset = (data.index - 1) * bar.height * 1.1;

				bar.setOffset(
					new THREE.Vector2(
						0,
						-(Utils.worldToPixel(this.scaleUnflipped.y * 0.5) + bar.height * (1 / 1.1) + 16 * this.guiScale + yOffset)
					)
				),
					new THREE.Vector2(0.5, 1);

				bar.setScale(this.guiScale);
				return bar;
			}
		}
	}
}
