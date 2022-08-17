var HeightRenderComponent = /** @class */ (function () {
    function HeightRenderComponent(scene) {
        this.scene = scene;
        this.scene.heightRenderer = this;
        console.log('Height Render Component');
    }
    HeightRenderComponent.prototype.adjustDepth = function (gameObject) {
        gameObject.setDepth(gameObject.taroDepth + gameObject.y / 1000); // 1000 temp numerator
    };
    return HeightRenderComponent;
}());
//# sourceMappingURL=HeightRenderComponent.js.map