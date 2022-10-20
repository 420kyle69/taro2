var PhaserPaletteButton = /** @class */ (function () {
    function PhaserPaletteButton(palette, text, texture, x, y, w, container, func, value) {
        //const text = '+';
        //const w = 30;
        var h = 30;
        //const x = 0;
        //const y = -h -1;
        this.palette = palette;
        var button = this.button = palette.scene.add.rectangle(x + w / 2, y + h / 2, w, h, palette.COLOR_DARK);
        button.setInteractive();
        container.add(button);
        if (texture) {
            var image = palette.scene.add.image(x + w / 4 + h * 0.1, y + h * 0.1, texture)
                .setDisplaySize(h * 0.8, h * 0.8)
                .setOrigin(0);
            container.add(image);
        }
        else {
            var label = palette.scene.add.text(x + w / 2, y + h / 2, text);
            label.setFontFamily('Rubik');
            label.setColor('#000000');
            label.setFontSize(26);
            label.setOrigin(0.5);
            label.setResolution(4);
            container.add(label);
        }
        /*label.setFontFamily('Verdana');
        label.setColor('#000000')
        label.setFontSize(26);
        label.setOrigin(0.5);
        label.setResolution(4);
        container.add(label);*/
        button.on('pointerdown', function () {
            if (value || value === 0)
                func(value);
            else
                func();
        });
    }
    PhaserPaletteButton.prototype.highlight = function (boolean) {
        this.active = boolean;
        if (boolean) {
            this.button.setFillStyle(this.palette.COLOR_LIGHT, 1);
        }
        else {
            this.button.setFillStyle(this.palette.COLOR_DARK, 1);
        }
    };
    return PhaserPaletteButton;
}());
//# sourceMappingURL=PhaserPaletteButton.js.map