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
var DevTooltip = /** @class */ (function (_super) {
    __extends(DevTooltip, _super);
    function DevTooltip(scene) {
        var _this = _super.call(this, scene) || this;
        _this.x = _this.scene.sys.game.canvas.width - 100;
        _this.y = 70;
        _this.visible = false;
        _this.setScrollFactor(0);
        var bubble = _this.bubble = scene.add.graphics();
        _this.add(bubble);
        var text = _this.bitmapText = scene.add.bitmapText(0, 0, BitmapFontManager.font(scene, 'Verdana', true, false, '#000000'));
        text.setFontSize(14);
        text.setCenterAlign();
        text.setOrigin(0.5);
        text.letterSpacing = -0.6;
        _this.add(text);
        scene.add.existing(_this);
        return _this;
    }
    DevTooltip.prototype.drawBubble = function () {
        var bubble = this.bubble;
        var text = /*this.rtText ||*/ this.bitmapText;
        var width = text.width + 30;
        var height = text.height + 30;
        bubble.clear();
        bubble.fillStyle(0xffffff, 1);
        bubble.fillRect(-width / 2, -height / 2, width, height);
    };
    DevTooltip.prototype.showMessage = function (tooltipText) {
        // reset fade timer and tween
        if (this.fadeTimerEvent) {
            this.scene.time.removeEvent(this.fadeTimerEvent);
            this.fadeTimerEvent = null;
        }
        if (this.fadeTween) {
            this.fadeTween.remove();
            this.fadeTween = null;
        }
        this.visible = true;
        this.alpha = 1;
        var text = this.bitmapText;
        text.setText(BitmapFontManager.sanitize(text.fontData, tooltipText));
        this.x = this.scene.sys.game.canvas.width - text.width / 2 - 50;
        this.y = 70;
        this.drawBubble();
    };
    DevTooltip.prototype.fadeOut = function () {
        var _this = this;
        var scene = this.scene;
        this.fadeTimerEvent = scene.time.delayedCall(500, function () {
            _this.fadeTimerEvent = null;
            _this.fadeTween = scene.tweens.add({
                targets: _this,
                alpha: 0,
                duration: 500,
                onComplete: function () {
                    _this.fadeTween = null;
                    _this.visible = false;
                }
            });
        });
    };
    return DevTooltip;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=DevTooltip.js.map