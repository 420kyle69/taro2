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
    function AbilityButton(scene, ability, id, key, tooltipText, texture, x, y, size, radius) {
        if (key === void 0) { key = ''; }
        var _this = _super.call(this, scene) || this;
        _this.ability = ability;
        _this.id = id;
        _this.key = key;
        _this.size = size;
        _this.radius = radius;
        _this.name = ability.name;
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
            if (taro.isMobile) {
                // @ts-ignore
                var image = _this.image = scene.add.rexCircleMaskImage(0, 0, texture).setDisplaySize(size * 0.8, size * 0.8);
                _this.add(image);
            }
            else {
                var image = _this.image = scene.add.image(0, 0, texture).setDisplaySize(size * 0.8, size * 0.8);
                _this.add(image);
            }
            _this.fx = _this.image.preFX.addBloom(0xffffff, 1, 1, 2, 1.2).setActive(false);
        }
        // label
        if (key && key.length < 2) {
            var label = _this.label = scene.add.bitmapText(-7 + size / 2, +7 - size / 2, BitmapFontManager.font(scene, 'Verdana', true, false, '#FFFFFF'), key.toUpperCase(), 16);
            label.setOrigin(0.5);
            label.letterSpacing = 1.3;
            _this.add(label);
        }
        // cooldown label
        if (ability.cooldown > 0) {
            var cooldownLabel = _this.cooldownLabel = scene.add.bitmapText(0, 0, BitmapFontManager.font(scene, 'Verdana', false, true, '#FFFF00'), '', 24);
            cooldownLabel.setOrigin(0.5);
            cooldownLabel.letterSpacing = 1.3;
            _this.add(cooldownLabel);
        }
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
        var _a, _b;
        this.size = size;
        this.radius = radius;
        this.button.setSize(size, size);
        this.button.setRadius(radius);
        (_a = this.image) === null || _a === void 0 ? void 0 : _a.setDisplaySize(size * 0.8, size * 0.8);
        (_b = this.label) === null || _b === void 0 ? void 0 : _b.setPosition(-7 + size / 2, +7 - size / 2);
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
            if (this.image) {
                this.fx.setActive(true);
                //this.image.clearTint();
            }
        }
        else {
            if (this.image) {
                this.fx.setActive(false);
                if (this.onCooldown) {
                    this.image.setTint(0x707070);
                    this.startCooldownTimer();
                }
            }
        }
    };
    AbilityButton.prototype.cooldown = function (bool) {
        if (bool) {
            this.onCooldown = true;
            /*if (this.image) {
                this.image.setTint(0x707070);
            }*/
        }
        else {
            this.onCooldown = false;
            if (this.image)
                this.image.clearTint();
            clearInterval(this.cooldownTimer);
            this.cooldownTimeLeft = 0;
            this.cooldownLabel.text = '';
        }
    };
    AbilityButton.prototype.startCooldownTimer = function () {
        var _this = this;
        this.cooldownTimeLeft = Math.floor((this.ability.cooldown - this.ability.castDuration) / 1000);
        this.cooldownLabel.text = this.getCooldownText();
        this.cooldownTimer = setInterval(function () {
            _this.cooldownTimeLeft--;
            _this.cooldownLabel.text = _this.getCooldownText();
        }, 1000);
    };
    AbilityButton.prototype.getCooldownText = function () {
        var cooldownText = this.cooldownTimeLeft.toString();
        if (this.cooldownTimeLeft > 99)
            cooldownText = (Math.floor(this.cooldownTimeLeft / 60)).toString() + 'm';
        return cooldownText;
    };
    return AbilityButton;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=AbilityButton.js.map