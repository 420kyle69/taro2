var EntityImage = /** @class */ (function () {
    function EntityImage(scene, devModeTools, entityImages, action, type) {
        var _this = this;
        var _a, _b;
        this.action = action;
        var key;
        if (action.entityType === 'unitTypes') {
            var entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            key = "unit/".concat(entityTypeData.cellSheet.url);
        }
        else if (type === 'unit') {
            var entityTypeData = taro.game.data['unitTypes'] && taro.game.data['unitTypes'][action.unitType];
            key = "unit/".concat(entityTypeData.cellSheet.url);
        }
        else if (action.entityType === 'itemTypes') {
            var entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            key = "item/".concat(entityTypeData.cellSheet.url);
        }
        else if (type === 'item') {
            var entityTypeData = taro.game.data['itemTypes'] && taro.game.data['itemTypes'][action.itemType];
            key = "item/".concat(entityTypeData.cellSheet.url);
        }
        else if (action.entityType === 'projectileTypes') {
            var entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            key = "projectile/".concat(entityTypeData.cellSheet.url);
        }
        else if (type === 'projectile') {
            var entityTypeData = taro.game.data['projectileTypes'] && taro.game.data['projectileTypes'][action.projectileType];
            key = "projectile/".concat(entityTypeData.cellSheet.url);
        }
        var image = this.image = scene.add.image((_a = action.position) === null || _a === void 0 ? void 0 : _a.x, (_b = action.position) === null || _b === void 0 ? void 0 : _b.y, key);
        if (action.angle)
            image.angle = Number(action.angle);
        if (action.width && action.height)
            image.setDisplaySize(action.width, action.height);
        //image.setTint(0x9CA3AF);
        //image.setAlpha(0.75);
        image.setVisible(false);
        image.setInteractive({ draggable: true });
        image.entity = this;
        entityImages.push(image);
        image.on('pointerdown', function () {
            console.log('pointerdown', action);
            _this.startDragX = image.x;
            _this.startDragY = image.y;
            _this.scale = image.scale;
            if (!devModeTools.altKey.isDown && !devModeTools.shiftKey.isDown) {
                _this.dragMode = 'position';
            }
            else if (devModeTools.altKey.isDown) {
                _this.dragMode = 'angle';
            }
            else if (devModeTools.shiftKey.isDown) {
                _this.dragMode = 'scale';
            }
        });
        var editedAction = { actionId: action.actionId };
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            if (!devModeTools.cursorButton.active || gameObject !== image)
                return;
            //console.log(this.dragMode)
            if (_this.dragMode === 'position') {
                gameObject.x = dragX;
                gameObject.y = dragY;
                editedAction.position = { x: dragX, y: dragY };
            }
            else if (_this.dragMode === 'angle' && action.angle) {
                var target = Phaser.Math.Angle.BetweenPoints(gameObject, { x: dragX, y: dragY });
                gameObject.rotation = target;
                editedAction.angle = gameObject.angle;
            }
            else if (_this.dragMode === 'scale' && action.width && action.height) {
                var dragScale = Math.min(500, Math.max(-250, (_this.startDragY - dragY)));
                gameObject.scale = _this.scale + _this.scale * dragScale / 500;
                editedAction.width = image.displayWidth;
                editedAction.height = image.displayHeight;
            }
        });
        scene.input.on('dragend', function (pointer, gameObject) {
            if (gameObject !== image)
                return;
            _this.dragMode = null;
            //console.log('dragend', action);
            _this.edit(editedAction);
            editedAction = { actionId: action.actionId };
        });
    }
    EntityImage.prototype.edit = function (action) {
        taro.network.send('editInitEntity', action);
    };
    EntityImage.prototype.update = function (action) {
        if (this.action.position && this.action.position.x && this.action.position.y &&
            action.position && action.position.x && action.position.y) {
            this.action.position = action.position;
            this.image.x = action.position.x;
            this.image.y = action.position.y;
        }
        else if (this.action.angle && action.angle) {
            this.action.angle = action.angle;
            this.image.angle = Number(action.angle);
        }
        else if (this.action.width && this.action.height && action.width && action.height) {
            this.action.width = action.width;
            this.action.height = action.height;
            this.image.setDisplaySize(action.width, action.height);
        }
    };
    return EntityImage;
}());
//# sourceMappingURL=EntityImage.js.map