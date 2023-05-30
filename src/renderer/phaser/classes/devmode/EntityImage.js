var EntityImage = /** @class */ (function () {
    function EntityImage(scene, entitiesOnInit, action) {
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
        image.setInteractive();
        entitiesOnInit.push(image);
        this.image.on('pointerdown', function () {
            console.log('pointerdown', action);
        });
    }
    return EntityImage;
}());
//# sourceMappingURL=EntityImage.js.map