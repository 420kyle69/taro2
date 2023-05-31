var EntityImage = /** @class */ (function () {
    function EntityImage(scene, devModeTools, entitiesOnInit, action) {
        var _this = this;
        var _a, _b;
        var key;
        if (action.entityType === 'unitTypes') {
            var entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            key = "unit/".concat(entityTypeData.cellSheet.url);
        }
        else if (action.entityType === 'itemTypes') {
            var entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            key = "item/".concat(entityTypeData.cellSheet.url);
        }
        else if (action.entityType === 'projectileTypes') {
            var entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            key = "projectile/".concat(entityTypeData.cellSheet.url);
        }
        var image = this.image = scene.add.image((_a = action.position) === null || _a === void 0 ? void 0 : _a.x, (_b = action.position) === null || _b === void 0 ? void 0 : _b.y, key);
        image.angle = Number(action.angle);
        image.setDisplaySize(action.width, action.height);
        image.setTint(0x9CA3AF);
        image.setAlpha(0.75);
        image.setVisible(false);
        image.setInteractive({ draggable: true });
        entitiesOnInit.push(image);
        this.image.on('pointerdown', function () {
            console.log('pointerdown', action);
        });
        scene.input.on('dragstart', function (pointer, gameObject) {
            _this.startDragX = gameObject.x;
            _this.startDragY = gameObject.y;
            _this.scale = gameObject.scale;
        });
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            console.log(_this.startDragX - dragX, _this.startDragY - dragY);
            if (!devModeTools.altKey.isDown && !devModeTools.shiftKey.isDown) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }
            else if (devModeTools.altKey.isDown) {
                var target = Phaser.Math.Angle.BetweenPoints(gameObject, { x: dragX, y: dragY });
                gameObject.rotation = target;
            }
            else if (devModeTools.shiftKey.isDown) {
                var dragScale = Math.min(500, Math.max(-250, (_this.startDragY - dragY)));
                gameObject.scale = _this.scale + _this.scale * dragScale / 500;
            }
        });
    }
    return EntityImage;
}());
//# sourceMappingURL=EntityImage.js.map