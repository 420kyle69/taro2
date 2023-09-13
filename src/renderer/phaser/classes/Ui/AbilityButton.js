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
var AbilityButton = /** @class */ (function (_super) {
    __extends(AbilityButton, _super);
    function AbilityButton(scene, name, id, key, tooltipText, texture, x, y, size, radius) {
        if (key === void 0) { key = ''; }
        var _this = _super.call(this, scene) || this;
        _this.id = id;
        _this.key = key;
        _this.size = size;
        _this.radius = radius;
        _this.name = name;
        var backgroundColor = _this.backgroundColor = 0x000000;
        if (taro.isMobile)
            backgroundColor = _this.backgroundColor = 0x333333;
        _this.activeColor = 0xFFFF00;
        _this.x = x;
        _this.y = y;
        // @ts-ignore
        var button = _this.button = scene.add.rexRoundRectangle(0, 0, size, size, radius, backgroundColor, 0.7);
        button.setInteractive();
        _this.add(button);
        // image
        if (texture && scene.textures.exists(texture)) {
            var image = _this.image = scene.add.image(0, 0, texture).setDisplaySize(size * 0.8, size * 0.8);
            _this.add(image);
            _this.fx = image.preFX.addBloom(0xffffff, 1, 1, 2, 1.2).setActive(false);
        }
        // label
        var label = _this.label = scene.add.bitmapText(-7 + size / 2, +7 - size / 2, BitmapFontManager.font(scene, 'Verdana', true, false, '#FFFFFF'), key.toUpperCase(), 16);
        label.setOrigin(0.5);
        label.letterSpacing = 1.3;
        _this.add(label);
        scene.add.existing(_this);
        if (taro.isMobile) {
            //hide key on mobile
            //if (this.image) label.visible = false;
            var mobileControlScene_1 = taro.renderer.scene.getScene('MobileControls');
            var clicked_1 = false;
            button.on('pointerdown', function () {
                mobileControlScene_1.disablePointerEvents = true;
                _this.activate(true);
                if (clicked_1)
                    return;
                clicked_1 = true;
                if (key) {
                    taro.client.emit('key-down', {
                        device: 'key', key: key.toLowerCase()
                    });
                }
                else {
                    // ability have no keybinding
                }
            });
            var onPointerEnd = function () {
                mobileControlScene_1.enablePointerNextUpdate = true;
                _this.activate(false);
                if (!clicked_1)
                    return;
                clicked_1 = false;
                if (key) {
                    taro.client.emit('key-up', {
                        device: 'key', key: key.toLowerCase()
                    });
                }
                else {
                    // ability have no keybinding
                }
            };
            button.on('pointerup', onPointerEnd);
            button.on('pointerout', onPointerEnd);
        }
        else {
            button.on('pointerdown', function () {
                taro.client.isPressingAbility = true;
                if (key) {
                    taro.client.emit('key-down', {
                        device: 'key', key: key.toLowerCase()
                    });
                }
                else {
                    // ability have no keybinding
                }
            });
            button.on('pointerup', function () {
                taro.client.isPressingAbility = false;
                if (key) {
                    taro.client.emit('key-up', {
                        device: 'key', key: key.toLowerCase()
                    });
                }
                else {
                    // ability have no keybinding
                }
            });
            button.on('pointerover', function () {
                //scene.tooltip.showMessage(name, tooltipText);
                clearTimeout(_this.timer);
            });
            button.on('pointerout', function () {
                //scene.tooltip.fadeOut();
                _this.activate(false);
            });
        }
        return _this;
    }
    AbilityButton.prototype.customize = function (size, radius) {
        var _a;
        this.size = size;
        this.radius = radius;
        this.button.setSize(size, size);
        this.button.setRadius(radius);
        (_a = this.image) === null || _a === void 0 ? void 0 : _a.setDisplaySize(size * 0.8, size * 0.8);
        this.label.setPosition(-7 + size / 2, +7 - size / 2);
    };
    AbilityButton.prototype.activate = function (bool) {
        if (bool) {
            this.button.setFillStyle(this.activeColor, 1);
        }
        else {
            this.button.setFillStyle(this.backgroundColor, 0.7);
        }
    };
    AbilityButton.prototype.casting = function (bool) {
        if (bool) {
            if (this.image)
                this.fx.setActive(true);
        }
        else {
            if (this.image)
                this.fx.setActive(false);
        }
    };
    return AbilityButton;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=AbilityButton.js.map