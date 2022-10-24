var HeightRenderComponent = /** @class */ (function () {
    function HeightRenderComponent(scene, mapHeight) {
        this.scene = scene;
        this.mapHeight = mapHeight;
        this.scene.heightRenderer = this;
    }
    HeightRenderComponent.prototype.adjustDepth = function (gameObject) {
        var castGameObject = !gameObject.owner ? gameObject : gameObject.owner.gameObject;
        var yPos = castGameObject.y;
        var halfHeight = castGameObject.spriteHeight2;
        var depth = gameObject.taroDepth + (yPos + halfHeight) / this.mapHeight;
        depth = Number(depth.toFixed(3));
        // hack to always paint items on top of units
        if (castGameObject !== gameObject) {
            depth += 0.001;
        }
        gameObject.setDepth(depth);
    };
    return HeightRenderComponent;
}());
//# sourceMappingURL=HeightRenderComponent.js.map