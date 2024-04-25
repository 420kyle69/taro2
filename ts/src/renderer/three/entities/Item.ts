namespace Renderer {
	export namespace Three {
		export class Item extends AnimatedSprite {
			ownerUnitId: string | undefined;
			ownerUnit: Unit | undefined;

			constructor(
				public taroId: string,
				public ownerId: string,
				spriteSheet: TextureSheet,
				public taroEntity?: TaroEntityPhysics
			) {
				super(spriteSheet);

				this.ownerUnitId = taroEntity._stats.ownerUnitId;
			}

			static create(taroEntity: TaroEntityPhysics) {
				const textureMgr = TextureManager.instance();
				const renderer = Three.instance();

				let spriteSheet = textureMgr.getTextureSheetShallowCopy(taroEntity._stats.cellSheet.url);
				const entity = new Item(taroEntity._id, taroEntity._stats.ownerId, spriteSheet, taroEntity);
				entity.setBillboard(!!taroEntity._stats.isBillboard, renderer.camera);

				taroEntity.on('scale', (data: { x: number; y: number }) => entity.scale.set(data.x, 1, data.y), this);
				taroEntity.on('show', () => (entity.visible = true), this);
				taroEntity.on('hide', () => (entity.visible = false), this);
				taroEntity.on('layer', (layer) => entity.setLayer(layer));
				taroEntity.on('depth', (depth) => entity.setDepth(depth));
				taroEntity.on('z-offset', (offset) => entity.setZOffset(Utils.pixelToWorld(offset)));
				taroEntity.on('flip', (flip) => entity.setFlip(flip % 2 === 1, flip > 1));

				taroEntity.on(
					'transform',
					(data: { x: number; y: number; rotation: number }) => {
						entity.position.x = Utils.pixelToWorld(data.x);
						entity.position.z = Utils.pixelToWorld(data.y);

						if (entity.ownerUnit) {
							const parent = entity.ownerUnit;
							entity.position.y = parent.position.y;

							const anchoredOffset = entity.taroEntity?.anchoredOffset;
							if (anchoredOffset) {
								let x = Utils.pixelToWorld(anchoredOffset.x);
								let y = Utils.pixelToWorld(anchoredOffset.y);

								// This should be a local/world coordinates flag on the entity body.
								if (entity.taroEntity?._stats.type == 'weapon') {
									entity.position.x += x;
									entity.position.z += y;
								} else {
									entity.sprite.position.x = x;
									entity.sprite.position.z = y;
								}
							}
						} else if (entity.sprite.position.x != 0 || entity.sprite.position.z != 0) {
							entity.sprite.position.x = 0;
							entity.sprite.position.z = 0;
						}

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

				taroEntity.on('play-animation', (id) => {
					const key = `${spriteSheet.key}/${id}/${taroEntity._stats.id}`;
					const animation = AnimationManager.instance().animations.get(key);
					if (animation) {
						entity.loop(animation.frames, animation.fps, animation.repeat);
					}
				});

				// taroEntity.on('update-texture', (data) => {
				// 	const textureMgr = TextureManager.instance();
				// 	const key = taroEntity._stats.cellSheet.url;
				// 	const tex2 = textureMgr.get(key);
				// 	if (tex2) {
				// 		this.createAnimations(taroEntity._stats);
				// 		tex = tex2.clone();
				// 		entity.setTexture(tex);
				// 		const bounds = taroEntity._bounds2d;
				// 		entity.setScale(Utils.pixelToWorld(bounds.x), Utils.pixelToWorld(bounds.y));
				// 	} else {
				// 		textureMgr.loadTextureFromUrl(key, Utils.patchAssetUrl(key), (tex2) => {
				// 			this.createAnimations(taroEntity._stats);
				// 			tex = tex2.clone();
				// 			entity.setTexture(tex);
				// 			const bounds = taroEntity._bounds2d;
				// 			entity.setScale(Utils.pixelToWorld(bounds.x), Utils.pixelToWorld(bounds.y));
				// 		});
				// 	}
				// });

				taroEntity.on('fading-text', (data: { text: string; color?: string }) => {
					const size = entity.getSizeInPixels();
					const offsetInPixels = -25 - size.height * 0.5;
					const text = new FloatingText(0, 0, 0, data.text || '', data.color || '#ffffff', 0, -offsetInPixels);
					entity.add(text);
				});

				taroEntity.on('setOwnerUnit', (unitId: string) => {
					entity.ownerUnitId = unitId;
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

			setScale(sx: number, sy: number) {
				super.setScale(sx, sy);
			}
		}
	}
}
