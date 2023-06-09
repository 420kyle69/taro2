class EntityImage {
    devModeTools: DevModeTools;
    action: ActionData;
    image: Phaser.GameObjects.Image & {entity: EntityImage};

    startDragX: number;
    startDragY: number;
    scale: any;
    dragMode: 'position' | 'angle' | 'scale';
    

    constructor(scene, devModeTools: DevModeTools, entityImages: (Phaser.GameObjects.Image & {entity: EntityImage})[], action: ActionData, type?: string) {
        
        this.devModeTools = devModeTools;
        this.action = action;

        let key;
        
        if (action.entityType === 'unitTypes') {
            const entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            if (!entityTypeData) return;
            key = `unit/${entityTypeData.cellSheet.url}`
        } else if (type === 'unit') {
            const entityTypeData = taro.game.data['unitTypes'] && taro.game.data['unitTypes'][action.unitType];
            if (!entityTypeData) return;
            key = `unit/${entityTypeData.cellSheet.url}`
        } else if (action.entityType === 'itemTypes') {
            const entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            if (!entityTypeData) return;
            key = `item/${entityTypeData.cellSheet.url}`
        } else if (type === 'item') {
            const entityTypeData = taro.game.data['itemTypes'] && taro.game.data['itemTypes'][action.itemType];
            if (!entityTypeData) return;
            key = `item/${entityTypeData.cellSheet.url}`
        } else if (action.entityType === 'projectileTypes') {
            const entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            if (!entityTypeData) return;
            key = `projectile/${entityTypeData.cellSheet.url}`
        } else if (type === 'projectile') {
            const entityTypeData = taro.game.data['projectileTypes'] && taro.game.data['projectileTypes'][action.projectileType];
            if (!entityTypeData) return;
            key = `projectile/${entityTypeData.cellSheet.url}`
        }
    
        const image = this.image = scene.add.image(action.position?.x, action.position?.y, key);
        if (action.angle) image.angle = Number(action.angle);
        if (action.width && action.height) image.setDisplaySize(action.width, action.height);
        //image.setTint(0x9CA3AF);
        //image.setAlpha(0.75);
        image.setVisible(false);
        image.setInteractive({ draggable: true });
        image.entity = this;
        entityImages.push(image);
    
        image.on('pointerdown', () => {
            //console.log('pointerdown', action);

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

        const outline = devModeTools.outline;

        image.on('pointerover', () => {
            console.log('pointerover')
            this.updateOutline();
        });

        image.on('pointerout', () => {
            console.log('pointerout')
            outline.clear();
        });

        let editedAction: ActionData = {actionId: action.actionId};
    
        scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (!devModeTools.cursorButton.active || gameObject !== image) return;
            if (this.dragMode === 'position') {
                gameObject.x = dragX;
                gameObject.y = dragY;
                editedAction.position = {x: dragX, y: dragY};
            } else if (this.dragMode === 'angle' && action.angle) {
                const target = Phaser.Math.Angle.BetweenPoints(gameObject, { x: dragX, y: dragY });
                gameObject.rotation = target;
                editedAction.angle = gameObject.angle;
            } else if (this.dragMode === 'scale' && action.width && action.height) {
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
        });
    }

    edit (action: ActionData): void {
        taro.network.send('editInitEntity', action);
    }

    updateOutline (): void {
        const outline = this.devModeTools.outline;
        const image = this.image;
        
		outline.clear();
		outline.lineStyle(2, 0x036ffc, 1);
        outline.beginPath();
        outline.moveTo(image.getTopLeft().x, image.getTopLeft().y);
        outline.lineTo(image.getTopRight().x, image.getTopRight().y);
        outline.lineTo(image.getBottomRight().x, image.getBottomRight().y);
        outline.lineTo(image.getBottomLeft().x, image.getBottomLeft().y);
        outline.lineTo(image.getTopLeft().x, image.getTopLeft().y);
        outline.closePath();
        outline.strokePath();
    }

    update (action: ActionData): void {
        if (this.action.position && this.action.position.x && this.action.position.y &&
            action.position && action.position.x && action.position.y) {
            this.action.position = action.position;
            this.image.x = action.position.x;
            this.image.y = action.position.y;
        } 
        if (this.action.angle && action.angle) {
            this.action.angle = action.angle;
            this.image.angle = Number(action.angle);
        } 
        if (this.action.width && this.action.height && action.width && action.height) {
            this.action.width = action.width;
            this.action.height = action.height;
            this.image.setDisplaySize(action.width, action.height);
        }
    }
}