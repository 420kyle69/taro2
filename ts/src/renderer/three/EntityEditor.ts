namespace Renderer {
	export namespace Three {
		export class EntityEditor {
			activeEntityPlacement: boolean;
			//preview: Phaser.GameObjects.Image;

			//outline: Phaser.GameObjects.Graphics;
			//outlineHover: Phaser.GameObjects.Graphics;
			//selectionContainer: Phaser.GameObjects.Container;
			//handlers: Record<string, Phaser.GameObjects.Rectangle & { orientation?: HandlerType }>;
			activeHandler: boolean;

			activeEntity: { id: string; player: string; entityType: string };
			selectedEntityImage: EntityImage;

			COLOR_HANDLER: number;

			constructor() {
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
				/*const entityData = this.activeEntity;
				if (!entityData) {
					this.preview.setVisible(false);
					return;
				}

				const entity = taro.game.data[entityData.entityType] && taro.game.data[entityData.entityType][entityData.id];
				let height;
				let width;
				let key;

				if (entityData.entityType === 'unitTypes') {
					key = `unit/${entity.cellSheet.url}`;
					if (entity.bodies?.default) {
						height = entity.bodies.default.height;
						width = entity.bodies.default.width;
					} else {
						console.log('no default body for unit', entityData.id);
						return;
					}
				} else if (entityData.entityType === 'itemTypes') {
					key = `item/${entity.cellSheet.url}`;
					if (entity.bodies?.dropped) {
						height = entity.bodies.dropped.height;
						width = entity.bodies.dropped.width;
					} else {
						console.log('no dropped body for item', entityData.id);
						return;
					}
				} else if (entityData.entityType === 'projectileTypes') {
					key = `projectile/${entity.cellSheet.url}`;
					if (entity.bodies?.default) {
						height = entity.bodies.default.height;
						width = entity.bodies.default.width;
					} else {
						console.log('no default body for projectile', entityData.id);
						return;
					}
				}
				this.preview.setTexture(key, 0).setDisplaySize(width, height).setVisible(true);*/
			}

			update(): void {
				/*if (this.activeEntityPlacement && this.preview) {
					const worldPoint = this.gameScene.cameras.main.getWorldPoint(
						this.gameScene.input.activePointer.x,
						this.gameScene.input.activePointer.y
					);
					this.preview.x = worldPoint.x;
					this.preview.y = worldPoint.y;
				}*/
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
