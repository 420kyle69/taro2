var HeightRenderComponent = /** @class */ (function () {
    function HeightRenderComponent(scene, mapHeight) {
        this.scene = scene;
        this.mapHeight = mapHeight;
        this.scene.heightRenderer = this;
        console.log('Height Render Component');
    }
    HeightRenderComponent.prototype.adjustDepth = function (gameObject) {
        gameObject.setDepth(gameObject.taroDepth + gameObject.y / this.mapHeight);
    };
    return HeightRenderComponent;
}());
//# sourceMappingURL=HeightRenderComponent.js.map