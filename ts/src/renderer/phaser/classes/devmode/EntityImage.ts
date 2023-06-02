class EntityImage {
    image: Phaser.GameObjects.Image;

    startDragX: number;
    startDragY: number;
    scale: any;
    dragMode: 'position' | 'angle' | 'scale';

    constructor(scene, devModeTools, entitiesOnInit, action: ActionData) {
        
        let key;
        
        if (action.entityType === 'unitTypes') {
            const entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            key = `unit/${entityTypeData.cellSheet.url}`
        } else if (action.entityType === 'itemTypes') {
            const entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            key = `item/${entityTypeData.cellSheet.url}`
        } else if (action.entityType === 'projectileTypes') {
            const entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            key = `projectile/${entityTypeData.cellSheet.url}`
        }
    
        const image = this.image = scene.add.image(action.position?.x, action.position?.y, key);
        image.angle = Number(action.angle);
        image.setDisplaySize(action.width, action.height);
        image.setTint(0x9CA3AF);
        image.setAlpha(0.75);
        image.setVisible(false);
        image.setInteractive({ draggable: true });
        entitiesOnInit.push(image);
    
        image.on('pointerdown', () => {
            console.log('pointerdown', action);

            this.startDragX = image.x;
            this.startDragY = image.y;
            this.scale = image.scale;
            if (!devModeTools.altKey.isDown && !devModeTools.shiftKey.isDown) {
                this.dragMode = 'position';
            } else if (devModeTools.altKey.isDown) {
                this.dragMode = 'angle';
            } else if (devModeTools.shiftKey.isDown) {
                this.dragMode = 'scale';
            }
        });

        let editedAction: ActionData = {actionId: action.actionId};
    
        scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject !== image) return;
            console.log(this.dragMode)
            if (this.dragMode === 'position') {
                gameObject.x = dragX;
                gameObject.y = dragY;
                editedAction.position = {x: dragX, y: dragY};
            } else if (this.dragMode === 'angle') {
                const target = Phaser.Math.Angle.BetweenPoints(gameObject, { x: dragX, y: dragY });
                gameObject.rotation = target;
                editedAction.angle = gameObject.angle;
            } else if (this.dragMode === 'scale') {
                const dragScale = Math.min(500, Math.max(-250, (this.startDragY - dragY)));
                gameObject.scale = this.scale + this.scale * dragScale / 500;
                editedAction.width = image.displayWidth;
                editedAction.height = image.displayHeight;
            }
        });

        scene.input.on('dragend', (pointer, gameObject) => {
            if (gameObject !== image) return;
            this.dragMode = null;
            console.log('dragend', action);
            this.edit(editedAction);
            editedAction = {};
        });
    }

    edit (action: ActionData): void {
        taro.network.send('editInitEntity', action);
    }
}