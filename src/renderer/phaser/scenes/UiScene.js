var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var UiScene = /** @class */ (function (_super) {
    __extends(UiScene, _super);
    function UiScene() {
        return _super.call(this, { key: 'UI', active: true }) || this;
    }
    UiScene.prototype.init = function () {
    };
    UiScene.prototype.create = function () {
        //  simple text for testing
        // const info = this.add.text(100, 100, 'UI SCENE', /*{ font: '48px Arial', fill: '#000000' }*/);
    };
    UiScene.prototype.preload = function () {
    };
    UiScene.prototype.update = function () {
    };
    return UiScene;
}(PhaserScene));
//# sourceMappingURL=UiScene.js.map