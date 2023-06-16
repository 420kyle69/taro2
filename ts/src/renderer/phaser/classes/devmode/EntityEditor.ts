class EntityEditor {
    activeEntityPlacement: boolean;
    preview: Phaser.GameObjects.Image;

	constructor (
        private gameScene: GameScene, 
		devModeScene: DevModeScene, 
		private devModeTools: DevModeTools
	) {
        this.preview = this.gameScene.add.image(0, 0, null, 0);
        this.preview.setAlpha(0.75);
        this.updatePreview();

        taro.client.on('updateActiveEntity', () => {
			this.updatePreview();
		});

		gameScene.input.on('pointerdown', (p) => {
            const entityData = {
                id: 'uNdbzdXKIs',
                player: 'AI resources',
                entityType: 'itemTypes'
            }
            //inGameEditor.getActiveEntity && inGameEditor.getActiveEntity();
            if (this.activeEntityPlacement && entityData) {
                const worldPoint = gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
                const entity = taro.game.data[entityData.entityType][entityData.id];
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
                taro.network.send('editInitEntity', action);
            }
		});
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
        const entityData = {
            id: 'uNdbzdXKIs',
            player: 'AI resources',
            entityType: 'itemTypes'
        }
        //inGameEditor.getActiveEntity && inGameEditor.getActiveEntity();
        const entity = taro.game.data[entityData.entityType][entityData.id];
        //let actionType;
        let height;
        let width;
        let key;
        if (entityData.entityType === 'unitTypes') {
            key = `unit/${entity.cellSheet.url}`
            //actionType = 'createEntityForPlayerAtPositionWithDimensions';
            if (entity.bodies?.default) {
                height = entity.bodies.default.height;
                width = entity.bodies.default.width;
            } else {
                console.log('no default body for unit', entityData.id);
                return;
            }
        } else if (entityData.entityType === 'itemTypes') {
            key = `item/${entity.cellSheet.url}`
            //actionType = 'createEntityAtPositionWithDimensions';
            if (entity.bodies?.dropped) {
                height = entity.bodies.dropped.height;
                width = entity.bodies.dropped.width;
            } else {
                console.log('no dropped body for item', entityData.id);
                return;
            }
        } else if (entityData.entityType === 'projectileTypes') {
            key = `projectile/${entity.cellSheet.url}`
            //actionType = 'createEntityAtPositionWithDimensions';
            if (entity.bodies?.default) {
                height = entity.bodies.default.height;
                width = entity.bodies.default.width;
            } else {
                console.log('no default body for projectile', entityData.id);
                return;
            }
        }
        this.preview.setTexture(key, 0);
        this.preview.setDisplaySize(width, height);
    }

    update (): void {
        const entityData = {
            id: 'uNdbzdXKIs',
            player: 'AI resources',
            entityType: 'itemTypes'
        }
        //inGameEditor.getActiveEntity && inGameEditor.getActiveEntity();
        if (this.activeEntityPlacement && entityData) {
            const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
            this.preview.x = worldPoint.x;
            this.preview.y = worldPoint.y;
        }
	}
}
 
