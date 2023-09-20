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
var PhaserScene = /** @class */ (function (_super) {
    __extends(PhaserScene, _super);
    function PhaserScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PhaserScene.prototype.patchAssetUrl = function (url) {
        // proxy all s3 requests via cloudflare, old-cache.modd.io points to same 'modd' s3 bucket
        if (url.startsWith('https://modd.s3.amazonaws.com')) {
            url = url.replace('https://modd.s3.amazonaws.com', 'https://old-cache.modd.io');
        }
        // https://stackoverflow.com/a/37455118
        return "".concat(url, "?v=1");
    };
    return PhaserScene;
}(Phaser.Scene));
//# sourceMappingURL=PhaserScene.js.map