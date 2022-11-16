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
var PhaserAttributeBar = /** @class */ (function (_super) {
    __extends(PhaserAttributeBar, _super);
    function PhaserAttributeBar(unit) {
        var _this = this;
        var scene = unit.scene;
        _this = _super.call(this, scene) || this;
        _this.unit = unit;
        var bar = _this.bar = scene.add.graphics();
        _this.add(bar);
        var text = _this.text = scene.add.bitmapText(0, 0, BitmapFontManager.font(scene, 'Arial', true, '#000000'));
        text.setCenterAlign();
        text.setFontSize(14);
        text.setOrigin(0.5);
        text.letterSpacing = -0.8;
        _this.add(text);
        unit.attributesContainer.add(_this);
        return _this;
    }
    PhaserAttributeBar.get = function (unit) {
        if (!this.pool) {
            this.pool = unit.scene.make.group({});
        }
        var bar = this.pool.getFirstDead(false);
        if (!bar) {
            bar = new PhaserAttributeBar(unit);
            this.pool.add(bar);
        }
        bar.setActive(true);
        bar.unit = unit;
        unit.attributesContainer.add(bar);
        bar.setVisible(true);
        return bar;
    };
    PhaserAttributeBar.release = function (bar) {
        bar.resetFadeOut();
        bar.setVisible(false);
        bar.unit.attributesContainer.remove(bar);
        bar.unit = null;
        bar.name = null;
        bar.setActive(false);
    };
    PhaserAttributeBar.prototype.render = function (data) {
        var color = data.color, value = data.value, max = data.max, displayValue = data.displayValue, index = data.index, showWhen = data.showWhen, decimalPlaces = data.decimalPlaces;
        this.name = data.type || data.key;
        var bar = this.bar;
        var w = 94;
        var h = 16;
        var borderRadius = h / 2 - 1;
        bar.clear();
        bar.fillStyle(Phaser.Display.Color
            .HexStringToColor(color)
            .color);
        if (value !== 0) {
            bar.fillRoundedRect(-w / 2, -h / 2, Math.max(w * value / max, borderRadius * 1.5), h, borderRadius);
        }
        bar.lineStyle(2, 0x000000, 1);
        bar.strokeRoundedRect(-w / 2, -h / 2, w, h, borderRadius);
        var valueText = value.toFixed(decimalPlaces);
        this.text.setText(displayValue ?
            valueText :
            '' // no text
        );
        this.y = (index - 1) * h * 1.1;
        this.resetFadeOut();
        if ((showWhen instanceof Array &&
            showWhen.indexOf('valueChanges') > -1) ||
            showWhen === 'valueChanges') {
            this.fadeOut();
        }
    };
    PhaserAttributeBar.prototype.fadeOut = function () {
        var _this = this;
        var scene = this.scene;
        this.fadeTimerEvent = scene.time.delayedCall(1000, function () {
            _this.fadeTimerEvent = null;
            _this.fadeTween = scene.tweens.add({
                targets: _this,
                alpha: 0,
                duration: 500,
                onComplete: function () {
                    _this.fadeTween = null;
                    var unit = _this.unit;
                    if (unit) {
                        var attributes = unit.attributes;
                        var index = attributes.indexOf(_this);
                        if (index !== -1) {
                            attributes.splice(index, 1);
                            PhaserAttributeBar.release(_this);
                        }
                    }
                }
            });
        });
    };
    PhaserAttributeBar.prototype.resetFadeOut = function () {
        // reset fade timer and tween
        if (this.fadeTimerEvent) {
            this.scene.time.removeEvent(this.fadeTimerEvent);
            this.fadeTimerEvent = null;
        }
        if (this.fadeTween) {
            this.fadeTween.remove();
            this.fadeTween = null;
        }
        this.alpha = 1;
    };
    return PhaserAttributeBar;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=PhaserAttributeBar.js.map