class EntityEditor {
    activeEntityPlacement: boolean;
    preview: Phaser.GameObjects.Image;
    outline: Phaser.GameObjects.Graphics;
    dragPoints: Record<string, Phaser.GameObjects.Graphics>;
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
        this.dragPoints = {};
        this.dragPoints['topLeft'] = this.gameScene.add.graphics();
        this.dragPoints['top'] = this.gameScene.add.graphics();
        this.dragPoints['topRight'] = this.gameScene.add.graphics();
        this.dragPoints['right'] = this.gameScene.add.graphics();
        this.dragPoints['bottomRight'] = this.gameScene.add.graphics();
        this.dragPoints['bottom'] = this.gameScene.add.graphics();
        this.dragPoints['bottomLeft'] = this.gameScene.add.graphics();
        this.dragPoints['left'] = this.gameScene.add.graphics();

        Object.values(this.dragPoints).forEach(point => {
            point.setInteractive({ draggable: true });

            /*scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                if (!devModeTools.cursorButton.active || gameObject !== image) return;
                if (this.dragMode === 'position') {
                    gameObject.x = dragX;
                    gameObject.y = dragY;
                    editedAction.position = {x: dragX, y: dragY};
                } else if (this.dragMode === 'angle' && !isNaN(action.angle)) {
                    const target = Phaser.Math.Angle.BetweenPoints(gameObject, { x: dragX, y: dragY });
                    gameObject.rotation = target;
                    editedAction.angle = gameObject.angle;
                } else if (this.dragMode === 'scale' && !isNaN(action.width) && !isNaN(action.height)) {
                    const dragScale = Math.min(500, Math.max(-250, (this.startDragY - dragY)));
                    gameObject.scale = this.scale + this.scale * dragScale / 500;
                    editedAction.width = image.displayWidth;
                    editedAction.height = image.displayHeight;
                }
                this.updateOutline();
            });
    
            scene.input.on('dragend', (pointer, gameObject) => {
                if (gameObject !== image) return;
                this.dragMode = null;
                this.edit(editedAction);
                editedAction = {actionId: action.actionId};
            });*/

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

