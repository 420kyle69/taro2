class EntityEditor {
    activeEntityPlacement: boolean;
    preview: Phaser.GameObjects.Image;

    outline: Phaser.GameObjects.Graphics;
    selectionContainer: Phaser.GameObjects.Container;
    dragPoints: Record<string, Phaser.GameObjects.Rectangle & {orientation: string}>;
    activeDragPoint: boolean;

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

        const angleArray = ['topLeftRotate', 'topRightRotate', 'bottomRightRotate', 'bottomLeftRotate'];
        const scaleArray = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft', 'left', 'right', 'top', 'bottom'];
        /*const widthArray = ['left', 'right'];
        const heightArray = ['top', 'bottom'];*/

        const dragPoints = this.dragPoints = {};
        dragPoints['topLeft'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        dragPoints['topLeft'].orientation = 'topLeft';
        dragPoints['topLeftRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        dragPoints['topLeftRotate'].orientation = 'topLeftRotate';
        dragPoints['top'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        dragPoints['top'].orientation = 'top';
        dragPoints['topRight'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        dragPoints['topRight'].orientation = 'topRight';
        dragPoints['topRightRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        dragPoints['topRightRotate'].orientation = 'topRightRotate';
        dragPoints['right'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        dragPoints['right'].orientation = 'right';
        dragPoints['bottomRight'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        dragPoints['bottomRight'].orientation = 'bottomRight';
        dragPoints['bottomRightRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        dragPoints['bottomRightRotate'].orientation = 'bottomRightRotate';
        dragPoints['bottom'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        dragPoints['bottom'].orientation = 'bottom';
        dragPoints['bottomLeft'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        dragPoints['bottomLeft'].orientation = 'bottomLeft';
        dragPoints['bottomLeftRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        dragPoints['bottomLeftRotate'].orientation = 'bottomLeftRotate';
        dragPoints['left'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        dragPoints['left'].orientation = 'left';

        Object.values(dragPoints).forEach((point: Phaser.GameObjects.Rectangle) => selectionContainer.add(point));
        selectionContainer.setPosition(10, 10).setAngle(0).setDepth(1000).setVisible(false);
        gameScene.add.existing(selectionContainer);

        taro.client.on('scale', (data: { ratio: number }) => {
            Object.values(this.dragPoints).forEach((point: Phaser.GameObjects.Rectangle) => point.setScale(1 / data.ratio));
            if (this.selectedEntityImage) this.selectedEntityImage.updateOutline();
        });

        Object.values(this.dragPoints).forEach(point => {
            if (angleArray.includes(point.orientation)) {
                point.setInteractive({ draggable: true , cursor: 'url(/assets/cursors/rotate.cur), pointer' });
            } else {
                selectionContainer.bringToTop(point);
                point.setInteractive({ draggable: true/* , cursor: 'url(assets/cursors/resize.cur), pointer'*/ });
            }

            point.on('pointerover', () => {
                gameScene.input.setTopOnly(true);
                point.fillColor = devModeTools.COLOR_LIGHT;
            });
    
            point.on('pointerout', () => {
                if (angleArray.includes(point.orientation)) {
                    point.fillColor = COLOR_HANDLER;
                } else {
                    point.fillColor = COLOR_HANDLER;
                }
            });

            point.on('pointerdown', (pointer) => {
                const selectedEntityImage = this.selectedEntityImage;
                if (!devModeTools.cursorButton.active || !selectedEntityImage) return;

                this.activeDragPoint = true;
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
                if (!devModeTools.cursorButton.active || gameObject !== point || !selectedEntityImage) return;
                const action = selectedEntityImage.action;
                const editedAction = selectedEntityImage.editedAction;
                
                if (angleArray.includes(point.orientation) && !isNaN(action.angle)) {
                    const startingAngle = Phaser.Math.Angle.BetweenPoints(selectedEntityImage.image, { x: selectedEntityImage.startDragX, y: selectedEntityImage.startDragY });
                    const lastAngle = Phaser.Math.Angle.BetweenPoints(selectedEntityImage.image, worldPoint);
                    const targetAngle = lastAngle - startingAngle;
                    selectedEntityImage.image.rotation = selectedEntityImage.rotation + targetAngle;
                    editedAction.angle = selectedEntityImage.image.angle;
                    console.log('angle', editedAction.angle);
                } else {
                    if (scaleArray.includes(point.orientation) && !isNaN(action.width) && !isNaN(action.height)) {
                        let targetPoint;
                        let distanceToStart;
                        let distanceToCurrent;
                        switch (point.orientation) {
                            case 'topLeft':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomRight().x, selectedEntityImage.image.getBottomRight().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomRight().x, selectedEntityImage.image.getBottomRight().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                                break;
                            case 'topRight':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomLeft().x, selectedEntityImage.image.getBottomLeft().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomLeft().x, selectedEntityImage.image.getBottomLeft().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                                break;
                            case 'bottomRight':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopLeft().x, selectedEntityImage.image.getTopLeft().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopLeft().x, selectedEntityImage.image.getTopLeft().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                                break;
                            case 'bottomLeft':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopRight().x, selectedEntityImage.image.getTopRight().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopRight().x, selectedEntityImage.image.getTopRight().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                                break;
                            case 'left':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getRightCenter().x, selectedEntityImage.image.getRightCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getRightCenter().x, selectedEntityImage.image.getRightCenter().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, 0);
                                break;
                            case 'right':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getLeftCenter().x, selectedEntityImage.image.getLeftCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getLeftCenter().x, selectedEntityImage.image.getLeftCenter().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, 0);
                                break;
                            case 'top':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomCenter().x, selectedEntityImage.image.getBottomCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomCenter().x, selectedEntityImage.image.getBottomCenter().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2 (0, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                                break;
                            case 'bottom':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopCenter().x, selectedEntityImage.image.getTopCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopCenter().x, selectedEntityImage.image.getTopCenter().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2 (0, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                                break;
                            default:
                                break;
                        }
                        /*if (point.orientation === 'left') {
                            const distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getRightCenter().x, selectedEntityImage.image.getRightCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                            const distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getRightCenter().x, selectedEntityImage.image.getRightCenter().y, worldPoint.x, worldPoint.y);
                            selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                            editedAction.width = selectedEntityImage.image.displayWidth;
                            targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, 0);
                        } else if (point.orientation === 'right') {
                            const distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getLeftCenter().x, selectedEntityImage.image.getLeftCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                            const distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getLeftCenter().x, selectedEntityImage.image.getLeftCenter().y, worldPoint.x, worldPoint.y);
                            selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                            editedAction.width = selectedEntityImage.image.displayWidth;
                            targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, 0);
                        }
                        else if (point.orientation === 'top') {
                            const distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomCenter().x, selectedEntityImage.image.getBottomCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                            const distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomCenter().x, selectedEntityImage.image.getBottomCenter().y, worldPoint.x, worldPoint.y);
                            selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                            editedAction.height = selectedEntityImage.image.displayHeight;
                            targetPoint = new Phaser.Math.Vector2 (0, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                        } else if (point.orientation === 'bottom') {
                            const distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopCenter().x, selectedEntityImage.image.getTopCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                            const distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopCenter().x, selectedEntityImage.image.getTopCenter().y, worldPoint.x, worldPoint.y);
                            selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                            editedAction.height = selectedEntityImage.image.displayHeight;
                            targetPoint = new Phaser.Math.Vector2 (0, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                        }*/
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
                if (gameObject !== point || !selectedEntityImage) return;
                this.activeDragPoint = false;
                selectedEntityImage.dragMode = null;
                console.log('editedAction', selectedEntityImage.editedAction)
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

    deleteInitEntity(): void {
        if (this.selectedEntityImage) {
            this.selectedEntityImage.delete();
            this.selectedEntityImage = null;
        }
    }
}

