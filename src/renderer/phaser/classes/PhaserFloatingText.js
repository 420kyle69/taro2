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
var PhaserFloatingText = /** @class */ (function (_super) {
    __extends(PhaserFloatingText, _super);
    function PhaserFloatingText(scene, data) {
        var _this = _super.call(this, scene, data.x, data.y, BitmapFontManager.font(scene, 'Verdana', true, taro.game.data.settings
            .addStrokeToNameAndAttributes !== false, data.color || '#FFFFFF')) || this;
        _this.setText(BitmapFontManager.sanitize(_this.fontData, data.text));
        _this.setOrigin(0.5);
        _this.setFontSize(16);
        _this.letterSpacing = 1.3;
        scene.add.existing(_this);
        if (scene.renderer.type === Phaser.CANVAS) {
            var rt = _this.rt = scene.add.renderTexture(_this.x, _this.y, _this.width, _this.height);
            // TODO clear when pooled
            rt.draw(_this, _this.width / 2, _this.height / 2);
            rt.setOrigin(0.5);
            _this.visible = false;
        }
        scene.tweens.add({
            targets: _this.rt || _this,
            // @ts-ignore
            alpha: 0.5,
            duration: 2500,
            y: _this.y - 40,
            onComplete: function () {
                _this.rt && _this.rt.destroy();
                _this.destroy(); // TODO object pool
            }
        });
        return _this;
    }
    return PhaserFloatingText;
}(Phaser.GameObjects.BitmapText));
//# sourceMappingURL=PhaserFloatingText.js.map