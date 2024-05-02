namespace Renderer {
	export namespace Three {
		export class Item extends Entity {
			ownerUnitId: string | undefined;
			ownerUnit: Unit | undefined;
			body: AnimatedSprite;

			constructor(
				public taroId: string,
				public ownerId: string,
				spriteSheet: TextureSheet,
				public taroEntity: TaroEntityPhysics
			) {
				super(taroEntity);

				this.body = new AnimatedSprite(spriteSheet);
				this.add(this.body);

				this.ownerUnitId = taroEntity._stats.ownerUnitId;
			}

			static create(taroEntity: TaroEntityPhysics) {
				const key = taroEntity._stats.cellSheet.url;
				const cols = taroEntity._stats.cellSheet.columnCount || 1;
				const rows = taroEntity._stats.cellSheet.rowCount || 1;
				const tex = gAssetManager.getTexture(key).clone();
				const frameWidth = tex.image.width / cols;
				const frameHeight = tex.image.height / rows;
				const spriteSheet = new TextureSheet(key, tex, frameWidth, frameHeight);
				const entity = new Item(taroEntity._id, taroEntity._stats.ownerId, spriteSheet, taroEntity);

				taroEntity.on('depth', (depth) => entity.body.setDepth(depth));
				taroEntity.on('flip', (flip) => entity.body.setFlip(flip % 2 === 1, flip > 1));
				taroEntity.on('billboard', (isBillboard) => entity.body.setBillboard(isBillboard, Three.instance().camera));

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
									entity.body.sprite.position.x = x;
									entity.body.sprite.position.z = y;
								}
							}
						} else if (entity.body.sprite.position.x != 0 || entity.body.sprite.position.z != 0) {
							entity.body.sprite.position.x = 0;
							entity.body.sprite.position.z = 0;
						}

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

				taroEntity.on('play-animation', (id) => {
					const key = `${spriteSheet.key}/${id}/${taroEntity._stats.id}`;
					entity.body.play(key);
				});

				taroEntity.on('update-texture', (data) => {
					const key = taroEntity._stats.cellSheet.url;
					const cols = taroEntity._stats.cellSheet.columnCount || 1;
					const rows = taroEntity._stats.cellSheet.rowCount || 1;
					const tex = gAssetManager.getTexture(key);

					const replaceTexture = (spriteSheet: TextureSheet) => {
						entity.body.setTextureSheet(spriteSheet);
						const bounds = taroEntity._bounds2d;
						entity.setScale(Utils.pixelToWorld(bounds.x), Utils.pixelToWorld(bounds.y));
					};

					if (tex) {
						const frameWidth = tex.image.width / cols;
						const frameHeight = tex.image.height / rows;
						const sheet = new TextureSheet(key, tex.clone(), frameWidth, frameHeight);
						replaceTexture(sheet);
					} else {
						const animationMgr = AnimationManager.instance();
						gAssetManager.load([{ name: key, type: 'texture', src: Utils.patchAssetUrl(key) }], null, () => {
							animationMgr.createAnimationsFromTaroData(key, taroEntity._stats as unknown as EntityData);
							const frameWidth = tex.image.width / cols;
							const frameHeight = tex.image.height / rows;
							const sheet = new TextureSheet(key, tex.clone(), frameWidth, frameHeight);
							replaceTexture(sheet);
						});
					}
				});

				taroEntity.on('setOwnerUnit', (unitId: string) => {
					entity.ownerUnitId = unitId;
				});

				return entity;
			}

			update(dt: number) {
				this.body.update(dt);
			}

			setScale(sx: number, sy: number) {
				this.body.setScale(sx, sy);
			}
		}
	}
}
