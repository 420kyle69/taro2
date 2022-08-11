var DepthRenderComponent = /** @class */ (function () {
    function DepthRenderComponent(scene) {
        this.scene = scene;
        this.scene.depthRenderer = this;
    }
    DepthRenderComponent.prototype.adjustDepth = function (gameObject) {
        var storeDepth = gameObject.depth;
        gameObject.setDepth(Math.floor(gameObject.depth) + gameObject.y / 1000); // 1000 temp numerator
    };
    return DepthRenderComponent;
}());
//# sourceMappingURL=DepthRenderComponent.js.map