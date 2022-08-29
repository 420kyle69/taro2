var HeightRenderComponent = /** @class */ (function () {
    function HeightRenderComponent(scene, mapHeight) {
        this.scene = scene;
        this.mapHeight = mapHeight;
        this.scene.heightRenderer = this;
        console.log('Height Render Component');
    }
    HeightRenderComponent.prototype.adjustDepth = function (gameObject) {
        var yPos = !gameObject.owner ?
            gameObject.y :
            gameObject.owner.gameObject.y;
        var depth = gameObject.taroDepth + yPos / this.mapHeight;
        depth = Number(depth.toFixed(3));
        gameObject.setDepth(depth);
    };
    return HeightRenderComponent;
}());
//# sourceMappingURL=HeightRenderComponent.js.map