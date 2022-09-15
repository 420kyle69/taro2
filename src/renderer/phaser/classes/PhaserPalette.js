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
    function PhaserPalette(scene, tileset) {
        var _this = _super.call(this, scene) || this;
        console.log('create palette', _this);
        _this.tileset = tileset;
        //this.setScrollFactor(0,0);
        _this.x = -750;
        _this.y = 50;
        //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
        var camera = _this.camera = _this.scene.cameras.add(700, 100, 550, 400).setScroll(_this.x, _this.y).setZoom(1).setName('palette');
        camera.setBackgroundColor(0x002244);
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
        //const tiles = map.addTilesetImage('mario-tiles');
        var texturesLayer = _this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive() /*.setScrollFactor(0,0)*/.setPosition(_this.x, _this.y);
        //this.add(texturesLayer);
        scene.add.existing(texturesLayer);
        /*texturesLayer.on('pointerover', () => {
            this.pointerOver;
        });*/
        console.log(texturesLayer);
        var background = _this.background = scene.add.graphics();
        _this.add(background);
        scene.add.existing(_this);
        return _this;
        //this.drawBackground();
        /*this.scene.input.setDraggable(texturesLayer);
        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            console.log('drag', dragX, dragY);
            this.camera.scrollX = dragX;
            this.camera.scrollY = dragY;
        });*/
    }
    PhaserPalette.prototype.drawBackground = function () {
        var background = this.background;
        var width = 570;
        var height = 420;
        background.fillStyle(0x000000, 0.2);
        background.fillRect(-10, -10, width, height);
    };
    PhaserPalette.prototype.scroll = function (deltaY) {
        var targetZoom = this.camera.zoom - (deltaY / 5000);
        if (targetZoom < 1)
            targetZoom = 1;
        this.camera.setZoom(targetZoom);
    };
    return PhaserPalette;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=PhaserPalette.js.map