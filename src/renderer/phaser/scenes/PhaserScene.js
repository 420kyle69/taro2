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
        if (url === null || url === void 0 ? void 0 : url.startsWith('https://modd.s3.amazonaws.com')) {
            url = url.replace('https://modd.s3.amazonaws.com', 'https://old-cache.modd.io');
        }
        var shouldOptimize = new URL(window.location.href).searchParams.get('optimize');
        if (shouldOptimize && ((url === null || url === void 0 ? void 0 : url.indexOf('.png')) !== -1 || (url === null || url === void 0 ? void 0 : url.indexOf('.jpg')) !== -1)) {
            // load images via Image tag, helps CF optimize and convert(to webp) images via Polish - https://newdocs.phaser.io/docs/3.60.0/focus/Phaser.Loader.LoaderPlugin-image
            this.load.imageLoadType = 'HTMLImageElement';
            // use cache2 and old-cache2 endpoints for images which serve cached and optimized images 
            url = url.replace('https://cache.modd.io', 'https://cache2.modd.io');
            url = url.replace('https://old-cache.modd.io', 'https://old-cache2.modd.io');
        }
        else {
            // default loader type
            this.load.imageLoadType = 'XHR';
        }
        // https://stackoverflow.com/a/37455118
        return "".concat(url, "?v=1");
    };
    return PhaserScene;
}(Phaser.Scene));
//# sourceMappingURL=PhaserScene.js.map