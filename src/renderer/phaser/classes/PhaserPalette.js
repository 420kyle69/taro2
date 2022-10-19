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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var PhaserPalette = /** @class */ (function (_super) {
    __extends(PhaserPalette, _super);
    function PhaserPalette(scene, tileset, rexUI) {
        var _this = _super.call(this, scene) || this;
        console.log('create palette', _this);
        _this.tileset = tileset;
        _this.rexUI = rexUI;
        _this.scene = scene;
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
        // When loading from an array, make sure to specify the tileWidth and tileHeight
        var map = _this.map = _this.scene.make.tilemap({ key: 'palette', data: paletteMap, tileWidth: 16, tileHeight: 16 });
        var texturesLayer = _this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive().setPosition(_this.x, _this.y);
        scene.add.existing(texturesLayer);
        var paletteWidth = _this.scene.sys.game.canvas.width * 0.25;
        var paletteHeight = _this.scene.sys.game.canvas.height * 0.25;
        var camera = _this.camera = _this.scene.cameras.add(_this.scene.sys.game.canvas.width - paletteWidth - 40, _this.scene.sys.game.canvas.height - paletteHeight - 40, paletteWidth, paletteHeight)
            .setBounds(texturesLayer.x - (texturesLayer.width / 2), texturesLayer.y - (texturesLayer.height / 2), texturesLayer.width * 2, texturesLayer.height * 2, true)
            .setZoom(1).setName('palette');
        camera.setBackgroundColor(0xFFFFFF);
        texturesLayer.on('pointermove', function (p) {
            if (!p.isDown)
                return;
            var scrollX = (p.x - p.prevPosition.x) / camera.zoom;
            var scrollY = (p.y - p.prevPosition.y) / camera.zoom;
            camera.scrollX -= scrollX;
            camera.scrollY -= scrollY;
        });
        var COLOR_PRIMARY = 0x0036cc;
        var COLOR_LIGHT = _this.COLOR_LIGHT = 0x6690ff;
        var COLOR_DARK = _this.COLOR_DARK = 0xffffff;
        var scrollBarContainer = _this.scrollBarContainer = new Phaser.GameObjects.Container(scene);
        scene.add.existing(scrollBarContainer);
        scrollBarContainer.x = camera.x;
        scrollBarContainer.y = camera.y;
        var scrollBarBottom = _this.scrollBarBottom = _this.rexUI.add.scrollBar({
            width: _this.camera.width,
            orientation: 'x',
            background: _this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, COLOR_DARK),
            buttons: {
                left: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
                right: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
            },
            slider: {
                thumb: _this.rexUI.add.roundRectangle(0, 0, (_this.camera.width - 60) / 2, 20, 1, COLOR_LIGHT),
            },
            space: {
                left: 1, right: 1, top: 1, bottom: 1
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
                thumb: _this.rexUI.add.roundRectangle(0, 0, 20, (_this.camera.height - 60) / 2, 1, COLOR_LIGHT),
            },
            space: {
                left: 1, right: 1, top: 1, bottom: 1
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
            camera.x = _this.scene.sys.game.canvas.width - paletteWidth - 40;
            scrollBarContainer.x = _this.camera.x;
            layerButtonsContainer.x = _this.camera.x + paletteWidth - 98;
            layerButtonsContainer.y = _this.camera.y - 170;
            toolButtonsContainer.x = _this.camera.x + paletteWidth - 98;
            toolButtonsContainer.y = _this.camera.y - layerButtonsContainer.height - 136;
        });
        new PhaserPaletteButton(_this, '+', null, 0, -34, 30, scrollBarContainer, _this.zoom.bind(_this), -1);
        new PhaserPaletteButton(_this, '-', null, 34, -34, 30, scrollBarContainer, _this.zoom.bind(_this), 1);
        var layerButtonsContainer = _this.layerButtonsContainer = new Phaser.GameObjects.Container(scene);
        scene.add.existing(layerButtonsContainer);
        //this.scrollBarContainer.add(layerButtonsContainer);
        layerButtonsContainer.width = 120;
        layerButtonsContainer.height = 160;
        layerButtonsContainer.x = _this.camera.x + paletteWidth - 98;
        layerButtonsContainer.y = _this.camera.y - 204;
        new PhaserPaletteButton(_this, 'palette', null, 0, 170, 120, layerButtonsContainer, _this.toggle.bind(_this));
        _this.layerButtons = [];
        _this.layerButtons.push(new PhaserPaletteButton(_this, 'floor', null, 0, 102, 120, layerButtonsContainer, _this.switchLayer.bind(_this), 0), new PhaserPaletteButton(_this, 'floor2', null, 0, 68, 120, layerButtonsContainer, _this.switchLayer.bind(_this), 1), new PhaserPaletteButton(_this, 'walls', null, 0, 34, 120, layerButtonsContainer, _this.switchLayer.bind(_this), 2), new PhaserPaletteButton(_this, 'trees', null, 0, 0, 120, layerButtonsContainer, _this.switchLayer.bind(_this), 3));
        _this.layerButtons[0].highlight(true);
        var toolButtonsContainer = _this.toolButtonsContainer = new Phaser.GameObjects.Container(scene);
        scene.add.existing(toolButtonsContainer);
        //this.scrollBarContainer.add(toolButtonsContainer);
        toolButtonsContainer.x = _this.camera.x + paletteWidth - 98;
        toolButtonsContainer.y = _this.camera.y - layerButtonsContainer.height - 136;
        toolButtonsContainer.width = 120;
        toolButtonsContainer.height = 64;
        _this.cursorButton = new PhaserPaletteButton(_this, '.', 'cursor', 0, 0, 58, toolButtonsContainer, _this.disableMarker.bind(_this));
        new PhaserPaletteButton(_this, '_', 'eraser', 62, 0, 58, toolButtonsContainer, _this.emptyTile.bind(_this));
        _this.toolButtons = [];
        _this.toolButtons.push(new PhaserPaletteButton(_this, '1x1', null, 0, 34, 58, toolButtonsContainer, _this.selectSingle.bind(_this)), new PhaserPaletteButton(_this, '2x2', null, 62, 34, 58, toolButtonsContainer, _this.selectArea.bind(_this)));
        _this.toolButtons[0].highlight(true);
        _this.area = { x: 1, y: 1 };
        return _this;
        //this.width = 500;
        //this.height = 500;
        /*this.setInteractive(new Phaser.Geom.Rectangle(scrollBarContainer.x - this.x,scrollBarContainer.y,500,500), Phaser.Geom.Rectangle.Contains);
        console.log(this);
        this.on('pointerover', () => {
            this.pointerover = true;
            console.log('pointerover');
        });

        this.on('pointerout', () => {
            this.pointerover = false;
            console.log('pointerout');
        });*/
    }
    PhaserPalette.prototype.disableMarker = function () {
        if (!this.cursorButton.active) {
            this.cursorButton.highlight(true);
        }
        else {
            this.cursorButton.highlight(false);
        }
    };
    PhaserPalette.prototype.emptyTile = function () {
        var copy = __assign({}, this.scene.selectedTile);
        copy.index = 0;
        this.scene.selectedTile = copy;
        this.scene.selectedTileArea = [[copy, copy], [copy, copy]];
    };
    PhaserPalette.prototype.selectSingle = function () {
        for (var i = 0; i < this.area.x; i++) {
            for (var j = 0; j < this.area.y; j++) {
                if (this.scene.selectedTileArea[i][j])
                    this.scene.selectedTileArea[i][j].tint = 0xffffff;
            }
        }
        this.area = { x: 1, y: 1 };
        this.scene.marker.scale = 1;
        this.scene.paletteMarker.scale = 1;
        this.toolButtons[0].highlight(true);
        this.toolButtons[1].highlight(false);
    };
    PhaserPalette.prototype.selectArea = function () {
        this.scene.selectedTile.tint = 0xffffff;
        this.area = { x: 2, y: 2 };
        this.scene.marker.scale = 2;
        this.scene.paletteMarker.scale = 2;
        this.toolButtons[1].highlight(true);
        this.toolButtons[0].highlight(false);
    };
    PhaserPalette.prototype.toggle = function () {
        if (this.visible)
            this.hide();
        else
            this.show();
    };
    PhaserPalette.prototype.hide = function () {
        this.setVisible(false);
        this.texturesLayer.setVisible(false);
        this.camera.setVisible(false);
        this.scrollBarContainer.setVisible(false);
    };
    PhaserPalette.prototype.show = function () {
        this.setVisible(true);
        this.texturesLayer.setVisible(true);
        this.camera.setVisible(true);
        this.scrollBarContainer.setVisible(true);
    };
    PhaserPalette.prototype.switchLayer = function (value) {
        var scene = this.scene;
        var gameMap = scene.gameScene.tilemap;
        gameMap.currentLayerIndex = value;
        this.layerButtons.forEach(function (button) {
            button.highlight(false);
        });
        this.layerButtons[value].highlight(true);
    };
    PhaserPalette.prototype.zoom = function (deltaY) {
        var targetZoom;
        if (deltaY < 0)
            targetZoom = this.camera.zoom * 1.2;
        else
            targetZoom = this.camera.zoom / 1.2;
        if (targetZoom < 0.5)
            targetZoom = 0.5;
        else if (targetZoom > 20)
            targetZoom = 20;
        this.camera.setZoom(targetZoom);
        this.scrollBarBottom.getElement('slider.thumb').width = (this.camera.width - 60) / (targetZoom * 2);
        this.scrollBarBottom.layout();
        this.scrollBarRight.getElement('slider.thumb').height = (this.camera.height - 60) / (targetZoom * 2);
        this.scrollBarRight.layout();
    };
    return PhaserPalette;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=PhaserPalette.js.map