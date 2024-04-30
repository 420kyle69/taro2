namespace Renderer {
	export namespace Three {
		export class EntityEditor {
			activeEntityPlacement: boolean;
			preview: Renderer.Three.AnimatedSprite | undefined;

			//outline: Phaser.GameObjects.Graphics;
			//outlineHover: Phaser.GameObjects.Graphics;
			//selectionContainer: Phaser.GameObjects.Container;
			//handlers: Record<string, Phaser.GameObjects.Rectangle & { orientation?: HandlerType }>;
			activeHandler: boolean;

			activeEntity: { id: string; player: string; entityType: string };
			selectedEntityImage: EntityImage;

			COLOR_HANDLER: number;

			constructor() {
				this.preview = undefined;
				const renderer = Renderer.Three.instance();
				renderer.entityPreviewLayer.add(this.preview);
				this.activatePlacement(false);
				taro.client.on('add-entities', () => {
					this.activatePlacement(true);
				});
				taro.client.on('cursor', () => {
					this.activatePlacement(false);
				});
				taro.client.on('draw-region', () => {
					this.activatePlacement(false);
				});
				taro.client.on('brush', () => {
					this.activatePlacement(false);
				});
				taro.client.on('empty-tile', () => {
					this.activatePlacement(false);
				});
				taro.client.on('fill', () => {
					this.activatePlacement(false);
				});
				taro.client.on('updateActiveEntity', () => {
					this.activeEntity = inGameEditor.getActiveEntity && inGameEditor.getActiveEntity();
					this.updatePreview();
				});
			}

			createHandler(orientation: HandlerType, size: number, alpha: number): void {
				//this.handlers[orientation] = this.gameScene.add.rectangle(0, 0, size, size, this.COLOR_HANDLER, alpha);
				//this.handlers[orientation].orientation = orientation;
			}

			activatePlacement(active: boolean): void {
				console.log('activatePlacement', active);
				if (active) {
					//show entities list
					this.activeEntityPlacement = true;
					inGameEditor.toggleEntityPlacementWindow && inGameEditor.toggleEntityPlacementWindow(true);

					/*if (!this.devModeTools.paletteButton.hidden) {
                        this.devModeTools.palette.toggle();
                    }*/
				} else {
					//hide entities list
					this.activeEntityPlacement = false;
					inGameEditor.toggleEntityPlacementWindow && inGameEditor.toggleEntityPlacementWindow(false);

					/*if (this.devModeTools.paletteButton.hidden) {
                        this.devModeTools.palette.toggle();
                    }*/
				}
			}

			updatePreview(): void {
				const entityData = this.activeEntity;
				const renderer = Renderer.Three.instance();
				const textureMgr = TextureManager.instance();
				if (!entityData) {
					if (this.preview) {
						this.preview.visible = false;
					}
					return;
				}

				const entity = taro.game.data[entityData.entityType] && taro.game.data[entityData.entityType][entityData.id];
				let height: number;
				let width: number;
				let key: string;

				if (entityData.entityType === 'unitTypes') {
					key = `${entity.cellSheet.url}`;
					if (entity.bodies?.default) {
						height = entity.bodies.default.height;
						width = entity.bodies.default.width;
					} else {
						console.log('no default body for unit', entityData.id);
						return;
					}
				} else if (entityData.entityType === 'itemTypes') {
					key = `${entity.cellSheet.url}`;
					if (entity.bodies?.dropped) {
						height = entity.bodies.dropped.height;
						width = entity.bodies.dropped.width;
					} else {
						console.log('no dropped body for item', entityData.id);
						return;
					}
				} else if (entityData.entityType === 'projectileTypes') {
					key = `${entity.cellSheet.url}`;
					if (entity.bodies?.default) {
						height = entity.bodies.default.height;
						width = entity.bodies.default.width;
					} else {
						console.log('no default body for projectile', entityData.id);
						return;
					}
				}

				this.preview = new Renderer.Three.AnimatedSprite(textureMgr.getTextureSheetShallowCopy(key));
				this.preview.setBillboard(entity.isBillboard, renderer.camera);
				this.preview.setOpacity(0.5);
				// this.preview.setTexture(textureMgr.getTextureSheetShallowCopy(key).texture);
				renderer.scene.add(this.preview);
			}

			update(): void {
				if (this.activeEntityPlacement && this.preview) {
					const renderer = Renderer.Three.instance();
					const worldPoint = renderer.raycastFloor();
					if (worldPoint) {
						console.log(worldPoint, this.preview);
						this.preview.position.setX(worldPoint.x);
						this.preview.position.setY(worldPoint.y + 1);
						this.preview.position.setZ(worldPoint.z);
					}
				}
			}

			selectEntityImage(entityImage: EntityImage): void {
				if (entityImage === null) {
					if (this.selectedEntityImage) this.selectedEntityImage.updateOutline(true);
					this.selectedEntityImage = null;
					return;
				}
				this.selectedEntityImage = entityImage;
				entityImage.updateOutline();
			}

			rescaleInitEntity(
				width: boolean,
				height: boolean,
				worldPoint: Phaser.Math.Vector2,
				imagePoint: Phaser.Types.Math.Vector2Like,
				selectedEntityImage: EntityImage,
				editedAction: ActionData
			): void {
				const distanceToStart = Phaser.Math.Distance.Between(
					imagePoint.x,
					imagePoint.y,
					selectedEntityImage.startDragX,
					selectedEntityImage.startDragY
				);
				const distanceToCurrent = Phaser.Math.Distance.Between(imagePoint.x, imagePoint.y, worldPoint.x, worldPoint.y);
				if (width) {
					selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
					editedAction.width = Math.floor(selectedEntityImage.image.displayWidth);
				}
				if (height) {
					selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
					editedAction.height = Math.floor(selectedEntityImage.image.displayHeight);
				}
			}

			deleteInitEntity(): void {
				if (this.selectedEntityImage) {
					this.selectedEntityImage.delete();
					this.selectEntityImage(null);
				}
			}
		}
	}
}
