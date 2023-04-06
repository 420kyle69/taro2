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
var PhaserChatBubble = /** @class */ (function (_super) {
    __extends(PhaserChatBubble, _super);
    function PhaserChatBubble(scene, chatText, unit) {
        var _this = _super.call(this, scene) || this;
        _this.unit = unit;
        var bubble = _this.bubble = scene.add.graphics();
        _this.add(bubble);
        var text = _this.bitmapText = scene.add.bitmapText(0, 0, BitmapFontManager.font(scene, 'Arial', true, false, '#FFFFFF'));
        // needs to be created with the correct scale of the client
        _this.setScale(1 / _this.scene.cameras.main.zoom);
        text.setFontSize(12);
        text.setCenterAlign();
        text.setOrigin(0.5);
        text.letterSpacing = -0.6;
        _this.add(text);
        if (scene.renderer.type === Phaser.CANVAS) {
            text.visible = false;
            var rt = _this.rtText = scene.add.renderTexture(0, 0);
            rt.setOrigin(0.5);
            _this.add(rt);
        }
        scene.add.existing(_this);
        _this.showMessage(chatText);
        return _this;
    }
    PhaserChatBubble.prototype.showMessage = function (chatText) {
        var text = this.bitmapText;
        text.setText(BitmapFontManager.sanitize(text.fontData, this.trimText(chatText)));
        var rt = this.rtText;
        if (rt) {
            rt.resize(text.width, text.height);
            rt.clear();
            rt.draw(text, text.width / 2, text.height / 2);
        }
        this.drawBubble();
        this.updateScale();
        this.updateOffset();
        this.fadeOut();
    };
    PhaserChatBubble.prototype.fadeOut = function () {
        var _this = this;
        var scene = this.scene;
        // reset fade timer and tween
        if (this.fadeTimerEvent) {
            scene.time.removeEvent(this.fadeTimerEvent);
            this.fadeTimerEvent = null;
        }
        if (this.fadeTween) {
            this.fadeTween.remove();
            this.fadeTween = null;
        }
        this.visible = true;
        this.alpha = 1;
        this.fadeTimerEvent = scene.time.delayedCall(3000, function () {
            _this.fadeTimerEvent = null;
            _this.fadeTween = scene.tweens.add({
                targets: _this,
                // @ts-ignore
                alpha: 0,
                duration: 500,
                onComplete: function () {
                    _this.fadeTween = null;
                    _this.visible = false;
                }
            });
        });
    };
    PhaserChatBubble.prototype.updateScale = function () {
        this.setScale(1 / this.scene.cameras.main.zoom);
    };
    PhaserChatBubble.prototype.trimText = function (chatText) {
        if (chatText.length > 43) {
            chatText = chatText.substring(0, 40);
            chatText += '...';
        }
        return chatText;
    };
    PhaserChatBubble.prototype.drawBubble = function () {
        var bubble = this.bubble;
        var text = this.rtText || this.bitmapText;
        var width = text.width + 20;
        var height = text.height + 10;
        bubble.clear();
        bubble.fillStyle(0x000000, 0.5);
        bubble.fillRoundedRect(-width / 2, -height / 2, width, height, 5);
        bubble.fillTriangle(0, height / 2 + 7, 7, height / 2, -7, height / 2);
    };
    PhaserChatBubble.prototype.updateOffset = function () {
        var _a = this.unit, sprite = _a.sprite, label = _a.label, gameObject = _a.gameObject;
        this.offset = 25 +
            (sprite.displayHeight + sprite.displayWidth) / 4 +
            label.height * 2;
        this.y = gameObject.y - this.offset;
    };
    PhaserChatBubble.prototype.updatePosition = function () {
        var _a = this.unit.gameObject, x = _a.x, y = _a.y;
        this.x = x;
        this.y = y - this.offset;
    };
    return PhaserChatBubble;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=PhaserChatBubble.js.map