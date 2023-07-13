class EntityEditor {
    activeEntityPlacement: boolean;
    preview: Phaser.GameObjects.Image;
    outline: Phaser.GameObjects.Graphics;
    selectionContainer: Phaser.GameObjects.Container;
    dragPoints: Record<string, Phaser.GameObjects.Rectangle & {functionality: string}>;
    activeEntity: { id: string; player: string; entityType: string; };
    selectedEntityImage: EntityImage;

	constructor (
        private gameScene: GameScene,
		devModeScene: DevModeScene,
		private devModeTools: DevModeTools
	) {
        this.preview = gameScene.add.image(0, 0, null, 0);
        this.preview.setAlpha(0.75).setVisible(false);

        this.outline = gameScene.add.graphics();
        const selectionContainer = this.selectionContainer = new Phaser.GameObjects.Container(gameScene);

        const dragPoints = this.dragPoints = {};
        dragPoints['topLeft'] = gameScene.add.rectangle(0, 0, 10, 10, 0x00fffb);
        dragPoints['topLeft'].functionality = 'angle';
        dragPoints['top'] = gameScene.add.rectangle(0, 0, 10, 10, 0x00fffb);
        dragPoints['top'].functionality = 'scale';
        dragPoints['topRight'] = gameScene.add.rectangle(0, 0, 10, 10, 0x00fffb);
        dragPoints['topRight'].functionality = 'angle';
        dragPoints['right'] = gameScene.add.rectangle(0, 0, 10, 10, 0x00fffb);
        dragPoints['right'].functionality = 'scale';
        dragPoints['bottomRight'] = gameScene.add.rectangle(0, 0, 10, 10, 0x00fffb);
        dragPoints['bottomRight'].functionality = 'angle';
        dragPoints['bottom'] = gameScene.add.rectangle(0, 0, 10, 10, 0x00fffb);
        dragPoints['bottom'].functionality = 'scale';
        dragPoints['bottomLeft'] = gameScene.add.rectangle(0, 0, 10, 10, 0x00fffb);
        dragPoints['bottomLeft'].functionality = 'angle';
        dragPoints['left'] = gameScene.add.rectangle(0, 0, 10, 10, 0x00fffb);
        dragPoints['left'].functionality = 'scale';

        Object.values(dragPoints).forEach((point: Phaser.GameObjects.Rectangle) => selectionContainer.add(point));
        selectionContainer.setPosition(10, 10).setAngle(0).setVisible(false);
        gameScene.add.existing(selectionContainer);


        Object.values(this.dragPoints).forEach(point => {
            point.setInteractive({ draggable: true });

            point.on('pointerover', () => {
                console.log('point over', point)
                point.setScale(1.5);
            });
    
            point.on('pointerout', () => {
                console.log('point out')
                point.setScale(1);
            });

            point.on('pointerdown', (pointer) => {
                const selectedEntityImage = this.selectedEntityImage;
                if (!devModeTools.cursorButton.active || !selectedEntityImage) return;

                const worldPoint = this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                selectedEntityImage.startDragX = worldPoint.x;
                selectedEntityImage.startDragY = worldPoint.y;
                selectedEntityImage.rotation = selectedEntityImage.image.rotation;
                selectedEntityImage.scale = selectedEntityImage.image.scale;
            });

            gameScene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                const worldPoint = this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                const selectedEntityImage = this.selectedEntityImage;
                if (!devModeTools.cursorButton.active || gameObject !== point || !selectedEntityImage) return;
                const action = selectedEntityImage.action;
                const editedAction = selectedEntityImage.editedAction;
                
                if (!isNaN(action.angle) && gameObject.functionality === 'angle') {
                    const startingAngle = Phaser.Math.Angle.BetweenPoints(selectedEntityImage.image, { x: selectedEntityImage.startDragX, y: selectedEntityImage.startDragY });
                    const lastAngle = Phaser.Math.Angle.BetweenPoints(selectedEntityImage.image, worldPoint);
                    const targetAngle = lastAngle - startingAngle;
                    console.log('angle', selectedEntityImage.rotation, targetAngle)
                    selectedEntityImage.image.rotation = selectedEntityImage.rotation + targetAngle;
                    editedAction.angle = selectedEntityImage.image.angle;
                } else if (gameObject.functionality === 'scale' && !isNaN(action.width) && !isNaN(action.height)) {
                    const distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.x, selectedEntityImage.image.y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                    const distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.x, selectedEntityImage.image.y, worldPoint.x, worldPoint.y);
                    console.log('scale', distanceToStart, distanceToCurrent)
                    selectedEntityImage.image.scale = selectedEntityImage.scale * (distanceToCurrent / distanceToStart);
                    editedAction.width = selectedEntityImage.image.displayWidth;
                    editedAction.height = selectedEntityImage.image.displayHeight;
                }
                selectedEntityImage.updateOutline();
            });
    
            gameScene.input.on('dragend', (pointer, gameObject) => {
                const selectedEntityImage = this.selectedEntityImage;
                if (gameObject !== point || !selectedEntityImage) return;
                selectedEntityImage.dragMode = null;
                selectedEntityImage.edit(selectedEntityImage.editedAction);
                selectedEntityImage.editedAction = {actionId: selectedEntityImage.action.actionId};
            });

        });



        /*for (let i = 0; i < 4; i++) {
            const dragPoint = this.gameScene.add.graphics();
            dragPoint.fillStyle(0xffffff, 1);
            dragPoint.fillRect(0, 0, 5, 5);
            dragPoint.setVisible(true);
            this.dragPoints.push(dragPoint);
        }*/

        /*
        this.activeEntity = {
            id: 'ROrWqytd2r',
            player: 'AI resources',
            entityType: 'unitTypes'
        }
        this.updatePreview();
        */

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
        if (this.selectedEntityImage) this.selectedEntityImage.updateOutline();
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

