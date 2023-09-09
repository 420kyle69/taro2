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
    function AbilityButton(scene, name, key, tooltipText, texture, x, y, size, radius) {
        var _this = _super.call(this, scene) || this;
        _this.key = key;
        _this.size = size;
        _this.radius = radius;
        _this.name = name;
        var backgroundColor = _this.backgroundColor = 0x000000;
        var activeColor = _this.activeColor = 0xFFFF00;
        _this.x = x;
        _this.y = y;
        // @ts-ignore
        var button = _this.button = scene.add.rexRoundRectangle(0, 0, size, size, radius, backgroundColor, 0.7);
        button.setInteractive();
        _this.add(button);
        //button.setVisible(defaultVisible);
        if (texture && scene.textures.exists(texture)) {
            var image = _this.image = scene.add.image(0, 0, texture).setDisplaySize(size * 0.8, size * 0.8);
            _this.add(image);
        } /*else {
            const label = scene.add.bitmapText(
                x + w / 2, y + h / 2,
                BitmapFontManager.font(scene,
                    'Verdana', false, false, '#000000'
                ),
                text,
                22
            );
            label.setOrigin(0.5);
            label.letterSpacing = 1.3;
            //label.setVisible(defaultVisible);
            //container.add(label);
            this.label = label;
        }*/
        var label = scene.add.bitmapText(-7 + size / 2, +7 - size / 2, BitmapFontManager.font(scene, 'Verdana', true, false, '#FFFFFF'), key, 18);
        label.setOrigin(0.5);
        label.letterSpacing = 1.3;
        _this.add(label);
        //label.setVisible(defaultVisible);
        //container.add(label);
        _this.label = label;
        scene.add.existing(_this);
        button.on('pointerdown', function () {
            //console.log('ability pointerdown');
            if (key) {
                taro.network.send('playerKeyDown', {
                    // @ts-ignore
                    device: 'key', key: key.toLowerCase()
                });
            }
            _this.activate(true);
            /*if (value || value === 0) func(value);
            else func();*/
        });
        button.on('pointerup', function () {
            if (key) {
                taro.network.send('playerKeyUp', {
                    // @ts-ignore
                    device: 'key', key: key.toLowerCase()
                });
            }
            _this.activate(false);
        });
        //const gameScene = taro.renderer.scene.getScene('Game');
        if (taro.isMobile) {
            if (_this.image)
                label.visible = false;
        }
        else {
            button.on('pointerover', function () {
                //gameScene.input.setTopOnly(true);
                scene.tooltip.showMessage(name, tooltipText);
                clearTimeout(_this.timer);
            });
            button.on('pointerout', function () {
                scene.tooltip.fadeOut();
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
    /*highlight(mode: 'no' | 'active' | 'hidden'): void {
        switch (mode) {
            case 'hidden':
                this.hidden = true;
                this.active = false;
                this.button.setFillStyle(this.devModeTools['COLOR_GRAY'], 1);
                break;

            case 'active':
                this.active = true;
                this.hidden = false;
                this.button.setFillStyle(this.devModeTools['COLOR_LIGHT'], 1);
                break;

            case 'no':
                if (!this.hidden) {
                    this.active = false;
                    this.button.setFillStyle(this.devModeTools['COLOR_WHITE'], 1);
                }
                break;
        }
    }*/
    AbilityButton.prototype.increaseSize = function (value) {
        this.button.setScale(1 + (Number(value) * 0.2), 1 + (Number(value) * 0.10));
        /*if (value) {
            this.button.setStrokeStyle(2, 0x000000, 1);
        }
        else {
            this.button.setStrokeStyle();
        }*/
    };
    return AbilityButton;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=AbilityButton.js.map