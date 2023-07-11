class EntityImage {
    devModeTools: DevModeTools;
    entityEditor: EntityEditor;
    action: ActionData;
    image: Phaser.GameObjects.Image & {entity: EntityImage};

    startDragX: number;
    startDragY: number;
    scale: any;
    dragMode: 'position' | 'angle' | 'scale';

    constructor(scene, devModeTools: DevModeTools, entityImages: (Phaser.GameObjects.Image & {entity: EntityImage})[], action: ActionData, type?: string) {

        this.devModeTools = devModeTools;
        const entityEditor = this.entityEditor = devModeTools.entityEditor;
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
        if (action.angle) image.angle = action.angle;
        if (action.width && action.height) image.setDisplaySize(action.width, action.height);
        if (taro.developerMode.active && taro.developerMode.activeTab === 'map') {
            image.setVisible(true);
        } else {
            image.setVisible(false);
        }
        image.setInteractive({ draggable: true });
        image.entity = this;
        entityImages.push(image);

        image.on('pointerdown', () => {
            //console.log('pointerdown', action);
            if (!devModeTools.cursorButton.active) return;
            if (entityEditor.selectedEntityImage !== this) {
                entityEditor.selectEntityImage(this);
            }

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

        const outline = entityEditor.outline;

        image.on('pointerover', () => {
            if (!devModeTools.cursorButton.active) return;
            if (entityEditor.selectedEntityImage !== this) entityEditor.selectedEntityImage = null;
            this.updateOutline();
        });

        image.on('pointerout', () => {
            if (entityEditor.selectedEntityImage === this) return;
            outline.clear();
        });

        let editedAction: ActionData = {actionId: action.actionId};

        scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
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
        });
    }

    edit (action: ActionData): void {
        if (!this.action.wasEdited) {
            this.action.wasEdited = true;
            action.wasEdited = true;
        }
        taro.network.send<any>('editInitEntity', action);
    }

    updateOutline (): void {
        const outline = this.entityEditor.outline;
        const image = this.image;

		outline.clear();
        if (this.devModeTools.entityEditor.selectedEntityImage === this) {
            outline.lineStyle(6, 0x036ffc, 1);
        } else {
            outline.lineStyle(2, 0x036ffc, 1);
        }
        outline.strokeRect(-image.displayWidth / 2, -image.displayHeight / 2, image.displayWidth, image.displayHeight);
        outline.x = image.x;
        outline.y = image.y;
        outline.angle = image.angle;
    }

    update (action: ActionData): void {
        if (action.wasEdited) this.action.wasEdited = true;
        if (this.action.position && this.action.position.x && this.action.position.y &&
            action.position && action.position.x && action.position.y) {
            this.action.position = action.position;
            this.image.x = action.position.x;
            this.image.y = action.position.y;
        }
        if (this.action.angle && action.angle) {
            this.action.angle = action.angle;
            this.image.angle = action.angle;
        }
        if (this.action.width && this.action.height && action.width && action.height) {
            this.action.width = action.width;
            this.action.height = action.height;
            this.image.setDisplaySize(action.width, action.height);
        }
        if (action.wasDeleted) {
            this.hide();
            this.action.wasDeleted = true;
        }
    }

    hide (): void {
        this.image.alpha = 0;
        this.image.setInteractive(false);
    }

    delete (): void {
        this.hide();
        let editedAction: ActionData = {actionId: this.action.actionId, wasDeleted: true};
        this.edit(editedAction);
        this.entityEditor.outline.clear();
    }
}
