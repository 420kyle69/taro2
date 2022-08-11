var DepthRenderComponent = /** @class */ (function () {
    function DepthRenderComponent(scene) {
        this.scene = scene;
        this.scene.depthRenderer = this;
    }
    DepthRenderComponent.prototype.adjustDepth = function (gameObject) {
        gameObject.setDepth(gameObject.taroDepth + gameObject.y / 1000); // 1000 temp numerator
    };
    return DepthRenderComponent;
}());
//# sourceMappingURL=DepthRenderComponent.js.map