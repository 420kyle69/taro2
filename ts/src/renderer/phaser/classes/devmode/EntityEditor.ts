class EntityEditor {
    activeEntityPlacement: boolean;
    preview: Phaser.GameObjects.Image;

    outline: Phaser.GameObjects.Graphics;
    selectionContainer: Phaser.GameObjects.Container;
    handlers: Record<string, Phaser.GameObjects.Rectangle & {orientation: HandlerType}>;
    activeHandler: boolean;

    activeEntity: { id: string; player: string; entityType: string; };
    selectedEntityImage: EntityImage;

    COLOR_HANDLER: number;
    

	constructor (
        private gameScene: GameScene,
		devModeScene: DevModeScene,
		private devModeTools: DevModeTools
	) {
        const COLOR_HANDLER = this.COLOR_HANDLER = 0x00fffb;

        this.preview = gameScene.add.image(0, 0, null, 0).setDepth(1000);
        this.preview.setAlpha(0.75).setVisible(false);

        this.outline = gameScene.add.graphics().setDepth(1000);
        const selectionContainer = this.selectionContainer = new Phaser.GameObjects.Container(gameScene);

        const scaleArray = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft', 'left', 'right', 'top', 'bottom'];
        const angleArray = ['topLeftRotate', 'topRightRotate', 'bottomRightRotate', 'bottomLeftRotate'];

        const handlers = this.handlers = {};
        handlers['topLeft'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        handlers['topLeft'].orientation = 'topLeft';
        handlers['topLeftRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        handlers['topLeftRotate'].orientation = 'topLeftRotate';
        handlers['top'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        handlers['top'].orientation = 'top';
        handlers['topRight'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        handlers['topRight'].orientation = 'topRight';
        handlers['topRightRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        handlers['topRightRotate'].orientation = 'topRightRotate';
        handlers['right'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        handlers['right'].orientation = 'right';
        handlers['bottomRight'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        handlers['bottomRight'].orientation = 'bottomRight';
        handlers['bottomRightRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        handlers['bottomRightRotate'].orientation = 'bottomRightRotate';
        handlers['bottom'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        handlers['bottom'].orientation = 'bottom';
        handlers['bottomLeft'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        handlers['bottomLeft'].orientation = 'bottomLeft';
        handlers['bottomLeftRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        handlers['bottomLeftRotate'].orientation = 'bottomLeftRotate';
        handlers['left'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        handlers['left'].orientation = 'left';

        Object.values(handlers).forEach((handler: Phaser.GameObjects.Rectangle) => selectionContainer.add(handler));
        selectionContainer.setPosition(10, 10).setAngle(0).setDepth(1000).setVisible(false);
        gameScene.add.existing(selectionContainer);

        taro.client.on('scale', (data: { ratio: number }) => {
            Object.values(this.handlers).forEach((handler: Phaser.GameObjects.Rectangle) => handler.setScale(1 / data.ratio));
            if (this.selectedEntityImage) this.selectedEntityImage.updateOutline();
        });

        Object.values(this.handlers).forEach(handler => {
            if (angleArray.includes(handler.orientation)) {
                handler.setInteractive({ draggable: true , cursor: 'url(/assets/cursors/rotate.cur), pointer' });
            } else {
                selectionContainer.bringToTop(handler);
                handler.setInteractive({ draggable: true/* , cursor: 'url(assets/cursors/resize.cur), pointer'*/ });
            }

            handler.on('pointerover', () => {
                gameScene.input.setTopOnly(true);
                handler.fillColor = devModeTools.COLOR_LIGHT;
            });
    
            handler.on('pointerout', () => {
                if (angleArray.includes(handler.orientation)) {
                    handler.fillColor = COLOR_HANDLER;
                } else {
                    handler.fillColor = COLOR_HANDLER;
                }
            });

            handler.on('pointerdown', (pointer) => {
                const selectedEntityImage = this.selectedEntityImage;
                if (!devModeTools.cursorButton.active || !selectedEntityImage) return;

                this.activeHandler = true;
                const worldPoint = this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                selectedEntityImage.startDragX = worldPoint.x;
                selectedEntityImage.startDragY = worldPoint.y;
                selectedEntityImage.rotation = selectedEntityImage.image.rotation;
                selectedEntityImage.scale = selectedEntityImage.image.scale;
                selectedEntityImage.scaleX = selectedEntityImage.image.scaleX;
                selectedEntityImage.scaleY = selectedEntityImage.image.scaleY;
                selectedEntityImage.displayWidth = selectedEntityImage.image.displayWidth;
                selectedEntityImage.displayHeight = selectedEntityImage.image.displayHeight;
                selectedEntityImage.x = selectedEntityImage.image.x;
                selectedEntityImage.y = selectedEntityImage.image.y;
            });

            gameScene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                const worldPoint = this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                const selectedEntityImage = this.selectedEntityImage;
                if (!devModeTools.cursorButton.active || gameObject !== handler || !selectedEntityImage) return;
                const action = selectedEntityImage.action;
                const editedAction = selectedEntityImage.editedAction;
                
                if (angleArray.includes(handler.orientation) && !isNaN(action.angle)) {
                    const startingAngle = Phaser.Math.Angle.BetweenPoints(selectedEntityImage.image, { x: selectedEntityImage.startDragX, y: selectedEntityImage.startDragY });
                    const lastAngle = Phaser.Math.Angle.BetweenPoints(selectedEntityImage.image, worldPoint);
                    const targetAngle = lastAngle - startingAngle;
                    selectedEntityImage.image.rotation = selectedEntityImage.rotation + targetAngle;
                    editedAction.angle = selectedEntityImage.image.angle;
                } else {
                    if (scaleArray.includes(handler.orientation) && !isNaN(action.width) && !isNaN(action.height)) {
                        let targetPoint;
                        switch (handler.orientation) {
                            case 'topLeft':
                                this.rescaleInitEntity(true, true, worldPoint, selectedEntityImage.image.getBottomRight(), selectedEntityImage, editedAction);
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                                break;
                            case 'topRight':
                                this.rescaleInitEntity(true, true, worldPoint, selectedEntityImage.image.getBottomLeft(), selectedEntityImage, editedAction);
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                                break;
                            case 'bottomRight':
                                this.rescaleInitEntity(true, true, worldPoint, selectedEntityImage.image.getTopLeft(), selectedEntityImage, editedAction);
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                                break;
                            case 'bottomLeft':
                                this.rescaleInitEntity(true, true, worldPoint, selectedEntityImage.image.getTopRight(), selectedEntityImage, editedAction);
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                                break;
                            case 'left':
                                this.rescaleInitEntity(true, false, worldPoint, selectedEntityImage.image.getRightCenter(), selectedEntityImage, editedAction);
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, 0);
                                break;
                            case 'right':
                                this.rescaleInitEntity(true, false, worldPoint, selectedEntityImage.image.getLeftCenter(), selectedEntityImage, editedAction);
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, 0);
                                break;
                            case 'top':
                                this.rescaleInitEntity(false, true, worldPoint, selectedEntityImage.image.getBottomCenter(), selectedEntityImage, editedAction);
                                targetPoint = new Phaser.Math.Vector2 (0, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                                break;
                            case 'bottom':
                                this.rescaleInitEntity(false, true, worldPoint, selectedEntityImage.image.getTopCenter(), selectedEntityImage, editedAction);
                                targetPoint = new Phaser.Math.Vector2 (0, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                                break;
                            default:
                                break;
                        }
                        targetPoint.rotate(selectedEntityImage.image.rotation);
                        const x = selectedEntityImage.x + targetPoint.x;
                        const y = selectedEntityImage.y + targetPoint.y;
                        selectedEntityImage.image.x = x;
                        selectedEntityImage.image.y = y;
                        editedAction.position = {x: x, y: y};
                    }
                }
                selectedEntityImage.updateOutline();
            });
    
            gameScene.input.on('dragend', (pointer, gameObject) => {
                const selectedEntityImage = this.selectedEntityImage;
                if (gameObject !== handler || !selectedEntityImage) return;
                this.activeHandler = false;
                selectedEntityImage.dragMode = null;
                selectedEntityImage.edit(selectedEntityImage.editedAction);
                selectedEntityImage.editedAction = {actionId: selectedEntityImage.action.actionId};
            });
        });

        taro.client.on('updateActiveEntity', () => {
            this.activeEntity = inGameEditor.getActiveEntity && inGameEditor.getActiveEntity();
			this.updatePreview();
		});

		gameScene.input.on('pointerdown', (p) => {
            if (!p.leftButtonDown()) return;
            const entityData = this.activeEntity;
            if (this.activeEntityPlacement && entityData) {
                const worldPoint = gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
                const entity = taro.game.data[entityData.entityType] && taro.game.data[entityData.entityType][entityData.id];
                let actionType;
                let height;
                let width;
                if (entityData.entityType === 'unitTypes') {
                    actionType = 'createEntityForPlayerAtPositionWithDimensions';
                    if (entity.bodies?.default) {
                        height = entity.bodies.default.height;
                        width = entity.bodies.default.width;
                    } else {
                        console.log('no default body for unit', entityData.id);
                        return;
                    }
                } else if (entityData.entityType === 'itemTypes') {
                    actionType = 'createEntityAtPositionWithDimensions';
                    if (entity.bodies?.dropped) {
                        height = entity.bodies.dropped.height;
                        width = entity.bodies.dropped.width;
                    } else {
                        console.log('no dropped body for item', entityData.id);
                        return;
                    }
                } else if (entityData.entityType === 'projectileTypes') {
                    actionType = 'createEntityAtPositionWithDimensions';
                    if (entity.bodies?.default) {
                        height = entity.bodies.default.height;
                        width = entity.bodies.default.width;
                    } else {
                        console.log('no default body for projectile', entityData.id);
                        return;
                    }
                }

                const action: ActionData = {
                    type: actionType,
                    entity: entityData.id,
                    entityType: entityData.entityType,
                    position: {
                        function: 'xyCoordinate',
                        x: worldPoint.x,
                        y: worldPoint.y
                    },
                    width: width,
                    height: height,
                    angle: 0,
                    actionId: taro.newIdHex()
                }
                if (entityData.entityType === 'unitTypes') {
                    action.player = {
                        variableName: entityData.player,
                        function: 'getVariable'
                    }
                }
                devModeScene.createEntityImage(action);
                taro.network.send<any>('editInitEntity', action);
            }
		});

        this.selectedEntityImage = null;
    }

    activatePlacement(active: boolean): void {
        if (active) {
            //show entities list
            this.activeEntityPlacement = true;
			inGameEditor.toggleEntityPlacementWindow && inGameEditor.toggleEntityPlacementWindow(true);

            if (!this.devModeTools.paletteButton.hidden) {
                this.devModeTools.palette.toggle();
            }
        } else {
            //hide entities list
            this.activeEntityPlacement = false;
			inGameEditor.toggleEntityPlacementWindow && inGameEditor.toggleEntityPlacementWindow(false);

            if (this.devModeTools.paletteButton.hidden) {
                this.devModeTools.palette.toggle();
            }
        }
    }

    updatePreview(): void {
        const entityData = this.activeEntity;
        if (!entityData) {
            this.preview.setVisible(false);
            return;
        }

        const entity = taro.game.data[entityData.entityType] && taro.game.data[entityData.entityType][entityData.id];
        let height;
        let width;
        let key;

        if (entityData.entityType === 'unitTypes') {
            key = `unit/${entity.cellSheet.url}`
            if (entity.bodies?.default) {
                height = entity.bodies.default.height;
                width = entity.bodies.default.width;
            } else {
                console.log('no default body for unit', entityData.id);
                return;
            }
        } else if (entityData.entityType === 'itemTypes') {
            key = `item/${entity.cellSheet.url}`
            if (entity.bodies?.dropped) {
                height = entity.bodies.dropped.height;
                width = entity.bodies.dropped.width;
            } else {
                console.log('no dropped body for item', entityData.id);
                return;
            }
        } else if (entityData.entityType === 'projectileTypes') {
            key = `projectile/${entity.cellSheet.url}`
            if (entity.bodies?.default) {
                height = entity.bodies.default.height;
                width = entity.bodies.default.width;
            } else {
                console.log('no default body for projectile', entityData.id);
                return;
            }
        }
        this.preview.setTexture(key, 0).setDisplaySize(width, height).setVisible(true);
    }

    update (): void {
        if (this.activeEntityPlacement && this.preview) {
            const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
            this.preview.x = worldPoint.x;
            this.preview.y = worldPoint.y;
        }
	}
    
    selectEntityImage(entityImage: EntityImage): void {
        this.selectedEntityImage = entityImage;
        entityImage.updateOutline();
    }

    rescaleInitEntity (width: boolean, height: boolean, worldPoint: Phaser.Math.Vector2, imagePoint: Phaser.Types.Math.Vector2Like, selectedEntityImage: EntityImage, editedAction: ActionData): void {
        const distanceToStart = Phaser.Math.Distance.Between(imagePoint.x, imagePoint.y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
        const distanceToCurrent = Phaser.Math.Distance.Between(imagePoint.x, imagePoint.y, worldPoint.x, worldPoint.y);
        if (width) {
            selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
            editedAction.width = selectedEntityImage.image.displayWidth;
        }
        if (height) {
            selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
            editedAction.height = selectedEntityImage.image.displayHeight;
        }
    }

    deleteInitEntity(): void {
        if (this.selectedEntityImage) {
            this.selectedEntityImage.delete();
            this.selectedEntityImage = null;
        }
    }
}

type HandlerType = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft' | 'left' | 'right' | 'top' | 'bottom' | 'topLeftRotate' | 'topRightRotate' | 'bottomRightRotate' | 'bottomLeftRotate';

