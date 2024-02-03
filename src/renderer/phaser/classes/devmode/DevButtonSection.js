var DevButtonSection = /** @class */ (function () {
    /*button: Phaser.GameObjects.Rectangle;
    active: boolean;
    hidden: boolean;
    isHover = false;
    image: Phaser.GameObjects.Image;
    label: Phaser.GameObjects.BitmapText;
    timer: number | NodeJS.Timeout;
    hoverChildren?: DevToolButton[];*/
    function DevButtonSection(devModeTools, name) {
        this.name = name;
        this.buttons = [];
        var scene = devModeTools.scene;
        var container = this.container = new Phaser.GameObjects.Container(scene);
        scene.add.existing(container);
        var w = devModeTools.SECTION_WIDTH;
        var h = devModeTools.BUTTON_HEIGHT;
        // @ts-ignore
        var header = this.header = scene.add.rexRoundRectangle(w / 2, -h / 3, w, h / 2, 5, devModeTools.COLOR_GRAY);
        container.add(header);
        var label = this.label = scene.add.bitmapText(w / 2, -h / 3, BitmapFontManager.font(scene, 'Verdana', true, false, '#000000'), this.name, 14);
        label.setOrigin(0.5);
        label.letterSpacing = 1.3;
        container.add(label);
    }
    DevButtonSection.prototype.addButton = function (button) {
        this.buttons.push(button);
    };
    return DevButtonSection;
}());
//# sourceMappingURL=DevButtonSection.js.map