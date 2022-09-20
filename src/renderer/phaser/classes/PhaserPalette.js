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
var PhaserPalette = /** @class */ (function (_super) {
    __extends(PhaserPalette, _super);
    function PhaserPalette(scene, tileset, rexUI) {
        var _this = _super.call(this, scene) || this;
        console.log('create palette', _this);
        _this.tileset = tileset;
        _this.rexUI = rexUI;
        _this.x = -1000;
        _this.y = 0;
        // Load a map from a 2D array of tile indices
        var paletteMap = [];
        for (var i = 0; i < tileset.rows; i++) {
            paletteMap.push([]);
        }
        for (var i = 0; i < tileset.total; i++) {
            paletteMap[Math.floor(i / tileset.columns)].push(i);
        }
        console.log('map', paletteMap);
        // When loading from an array, make sure to specify the tileWidth and tileHeight
        var map = _this.map = _this.scene.make.tilemap({ key: 'palette', data: paletteMap, tileWidth: 16, tileHeight: 16 });
        var texturesLayer = _this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive() /*.setScrollFactor(0,0)*/.setPosition(_this.x, _this.y);
        //this.add(texturesLayer);
        scene.add.existing(texturesLayer);
        texturesLayer.on("pointermove", function (p) {
            if (!p.isDown)
                return;
            var scrollX = (p.x - p.prevPosition.x) / camera.zoom;
            var scrollY = (p.y - p.prevPosition.y) / camera.zoom;
            if (camera.scrollX - scrollX > -(camera.width / 2) + this.x && camera.scrollX - scrollX < (camera.width / 2) + this.x) {
                camera.scrollX -= scrollX;
            }
            if (camera.scrollY - scrollY > -(camera.height / 2) + this.y && camera.scrollY - scrollY < (camera.height / 2) + this.y) {
                camera.scrollY -= scrollY;
            }
        });
        var camera = _this.camera = _this.scene.cameras.add(_this.scene.sys.game.canvas.width - texturesLayer.width - 40, 70, texturesLayer.width, texturesLayer.height).setScroll(_this.x, _this.y).setZoom(1).setName('palette');
        camera.setBackgroundColor(0x002244);
        var COLOR_PRIMARY = 0x4e342e;
        var COLOR_LIGHT = 0x7b5e57;
        var COLOR_DARK = _this.COLOR_DARK = 0x260e04;
        var scrollBarContainer = _this.scrollBarContainer = new Phaser.GameObjects.Container(scene);
        scene.add.existing(scrollBarContainer);
        scrollBarContainer.x = _this.camera.x;
        scrollBarContainer.y = _this.camera.y;
        var scrollBarBottom = _this.scrollBarBottom = _this.rexUI.add.scrollBar({
            width: _this.camera.width,
            orientation: 'x',
            background: _this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, COLOR_DARK),
            buttons: {
                left: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
                right: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
            },
            slider: {
                thumb: _this.rexUI.add.roundRectangle(0, 0, (_this.camera.width - 60) / 2, 20, 10, COLOR_LIGHT),
            },
            space: {
                left: 10, right: 10, top: 10, bottom: 10
            }
        });
        scrollBarBottom.value = 0.5;
        _this.scrollBarContainer.add(scrollBarBottom);
        scrollBarBottom.setPosition(0, _this.camera.height).setOrigin(0, 0).setScrollFactor(0, 0).layout();
        var scrollBarRight = _this.scrollBarRight = _this.rexUI.add.scrollBar({
            height: _this.camera.height,
            orientation: 'y',
            background: _this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, COLOR_DARK),
            buttons: {
                left: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
                right: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
            },
            slider: {
                thumb: _this.rexUI.add.roundRectangle(0, 0, 20, (_this.camera.height - 60) / 2, 10, COLOR_LIGHT),
            },
            space: {
                left: 10, right: 10, top: 10, bottom: 10
            }
        });
        scrollBarRight.value = 0.5;
        _this.scrollBarContainer.add(scrollBarRight);
        scrollBarRight.setPosition(_this.camera.width, 0).setOrigin(0, 0).setScrollFactor(0, 0).layout();
        scrollBarContainer.width = camera.width + scrollBarRight.width + 60;
        scrollBarContainer.height = camera.height + scrollBarBottom.height + 60;
        console.log('scrollBarContainer', camera.width, scrollBarRight);
        scrollBarBottom.on('valuechange', function (newValue, oldValue, scrollBar) {
            if (!isNaN(newValue)) {
                newValue -= 0.5;
                camera.scrollX = this.x + (camera.width * newValue);
            }
        }, _this);
        scrollBarRight.on('valuechange', function (newValue, oldValue, scrollBar) {
            if (!isNaN(newValue)) {
                newValue -= 0.5;
                camera.scrollY = this.y + (camera.height * newValue);
            }
        }, _this);
        _this.scene.scale.on(Phaser.Scale.Events.RESIZE, function () {
            camera.x = _this.scene.sys.game.canvas.width - texturesLayer.width - 40;
            scrollBarContainer.x = _this.camera.x;
        });
        _this.addButton('+', 0, _this.zoom.bind(_this), -1);
        _this.addButton('-', 31, _this.zoom.bind(_this), 1);
        _this.addButton('1', texturesLayer.width - 124, _this.switchLayer.bind(_this), 0);
        _this.addButton('2', texturesLayer.width - 93, _this.switchLayer.bind(_this), 1);
        _this.addButton('3', texturesLayer.width - 62, _this.switchLayer.bind(_this), 2);
        _this.addButton('4', texturesLayer.width - 31, _this.switchLayer.bind(_this), 3);
        return _this;
    }
    PhaserPalette.prototype.addButton = function (text, x, func, value) {
        //const text = '+';
        var w = 30;
        var h = 30;
        //const x = 0;
        var y = -h;
        var button = this.scene.add.rectangle(x + w / 2, y + h / 2, w, h, this.COLOR_DARK);
        button.setInteractive();
        this.scrollBarContainer.add(button);
        var label = this.scene.add.text(x + w / 2, y + h / 2, text);
        label.setFontFamily('Verdana');
        label.setFontSize(26);
        label.setOrigin(0.5);
        label.setResolution(4);
        this.scrollBarContainer.add(label);
        button.on('pointerdown', function () {
            func(value);
        });
    };
    PhaserPalette.prototype.switchLayer = function (value) {
        var scene = this.scene;
        var gameMap = scene.gameScene.tilemap;
        gameMap.currentLayerIndex = value;
    };
    PhaserPalette.prototype.zoom = function (/*pointer: any,*/ deltaY) {
        var targetZoom;
        if (deltaY < 0)
            targetZoom = this.camera.zoom * 1.2;
        else
            targetZoom = this.camera.zoom / 1.2;
        if (targetZoom < 1)
            targetZoom = 1;
        else if (targetZoom > 20)
            targetZoom = 20;
        this.camera.setZoom(targetZoom);
        /*const targetPosition = this.camera.getWorldPoint(pointer.x, pointer.y);
        this.camera.setScroll(targetPosition.x, targetPosition.y);*/
        this.scrollBarBottom.getElement('slider.thumb').width = (this.camera.width - 60) / (targetZoom * 2);
        //if (targetZoom === 1) this.scrollBarBottom.value = 0.5;
        //if (deltaY > 0) this.scrollBarBottom.value = 0.5 * ((this.scrollBarBottom.value - 0.5) * (targetZoom - 1));
        this.scrollBarBottom.layout();
        this.scrollBarRight.getElement('slider.thumb').height = (this.camera.height - 60) / (targetZoom * 2);
        //if (targetZoom === 1) this.scrollBarRight.value = 0.5;
        this.scrollBarRight.layout();
    };
    return PhaserPalette;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=PhaserPalette.js.map