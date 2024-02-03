var DevButtonSection = /** @class */ (function () {
    function DevButtonSection(devModeTools, name, y, height) {
        this.name = name;
        this.buttons = [];
        this.y = y;
        this.height = height;
        var scene = devModeTools.scene;
        var w = devModeTools.SECTION_WIDTH;
        var h = devModeTools.BUTTON_HEIGHT;
        if (name) {
            // @ts-ignore
            var header = this.header = scene.add.rexRoundRectangle(w / 2, y - h / 3, w, h / 2, 5, devModeTools.COLOR_GRAY);
            devModeTools.toolButtonsContainer.add(header);
            var label = this.label = scene.add.bitmapText(w / 2, y - h / 3, BitmapFontManager.font(scene, 'Verdana', true, false, '#000000'), this.name, 14);
            label.setOrigin(0.5);
            label.letterSpacing = 1.3;
            devModeTools.toolButtonsContainer.add(label);
        }
    }
    DevButtonSection.prototype.addButton = function (button, array) {
        if (array === void 0) { array = this.buttons; }
        button.button.y += this.y;
        if (button.label)
            button.label.y += this.y;
        if (button.image)
            button.image.y += this.y;
        array.push(button);
    };
    return DevButtonSection;
}());
//# sourceMappingURL=DevButtonSection.js.map