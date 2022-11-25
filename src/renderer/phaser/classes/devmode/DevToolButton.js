var DevToolButton = /** @class */ (function () {
    function DevToolButton(devModeTools, text, texture, x, y, w, container, func, value) {
        this.devModeTools = devModeTools;
        //const text = '+';
        //const w = 30;
        var h = 30;
        //const x = 0;
        //const y = -h -1;
        var scene = devModeTools.scene;
        var button = this.button = scene.add.rectangle(x + w / 2, y + h / 2, w, h, devModeTools.COLOR_DARK);
        button.setInteractive();
        container.add(button);
        if (texture) {
            var image = scene.add.image(x + w / 4 + h * 0.1, y + h * 0.1, texture)
                .setDisplaySize(h * 0.8, h * 0.8)
                .setOrigin(0);
            container.add(image);
        }
        else {
            var label = scene.add.bitmapText(x + w / 2, y + h / 2, BitmapFontManager.font(scene, 'Verdana', false, false, '#000000'), text, 26);
            label.setOrigin(0.5);
            label.letterSpacing = 1.3;
            container.add(label);
            if (scene.renderer.type === Phaser.CANVAS) {
                var rt = scene.add.renderTexture(label.x, label.y, label.width, label.height);
                rt.draw(label, label.width / 2, label.height / 2);
                rt.setOrigin(0.5);
                container.add(rt);
                label.visible = false;
            }
        }
        button.on('pointerdown', function () {
            if (value || value === 0)
                func(value);
            else
                func();
        });
    }
    DevToolButton.prototype.highlight = function (active) {
        this.active = active;
        this.button.setFillStyle(this.devModeTools[active ? 'COLOR_LIGHT' : 'COLOR_DARK'], 1);
    };
    return DevToolButton;
}());
//# sourceMappingURL=DevToolButton.js.map