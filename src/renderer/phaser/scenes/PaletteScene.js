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
var PaletteScene = /** @class */ (function (_super) {
    __extends(PaletteScene, _super);
    function PaletteScene() {
        return _super.call(this, { key: 'Palette' }) || this;
    }
    PaletteScene.prototype.init = function () {
        var _this = this;
        console.log('palette scene init');
        this.gameScene = ige.renderer.scene.getScene('Game');
        ige.client.on('enterDevMode', function () {
            if (_this.devPalette) {
                _this.devPalette.setVisible(true);
                _this.devPalette.texturesLayer.setVisible(true);
                _this.devPalette.camera.setVisible(true);
                _this.devPalette.scrollBarContainer.setVisible(true);
            }
            else {
                console.log(_this.tileset);
                _this.devPalette = new PhaserPalette(_this, _this.tileset, _this.rexUI);
                _this.gameScene.devPalette = _this.devPalette;
                var map = _this.devPalette.map;
                _this.gameScene.selectedTile = map.getTileAt(2, 3);
                _this.marker2 = _this.add.graphics();
                _this.marker2.lineStyle(2, 0x000000, 1);
                _this.marker2.strokeRect(0, 0, map.tileWidth, map.tileHeight);
                _this.marker2.setVisible(false);
            }
        });
        ige.client.on('leaveDevMode', function () {
            _this.devPalette.setVisible(false);
            _this.devPalette.texturesLayer.setVisible(false);
            _this.devPalette.camera.setVisible(false);
            _this.devPalette.scrollBarContainer.setVisible(false);
        });
        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            if (_this.devPalette && _this.devPalette.visible) {
                _this.devPalette.zoom(pointer, deltaY);
            }
        });
    };
    PaletteScene.prototype.preload = function () {
        /*const data = ige.game.data;

        data.map.tilesets.forEach((tileset) => {
            const key = `tiles/${tileset.name}`;
            this.load.once(`filecomplete-image-${key}`, () => {
                const texture = this.textures.get(key);
                const canvas = this.mainScene.extrude(tileset,
                    texture.getSourceImage() as HTMLImageElement
                );
                if (canvas) {
                    this.textures.remove(texture);
                    this.textures.addCanvas(`extruded-${key}`, canvas);
                }
            });
            this.load.image(key, this.patchAssetUrl(tileset.image));
        });*/
        this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 
        //'src/renderer/phaser/rexuiplugin.min.js',
        'rexUI', 'rexUI');
    };
    PaletteScene.prototype.create = function () {
        var _this = this;
        var data = ige.game.data;
        var map = this.tilemap = this.make.tilemap({ key: 'map' });
        data.map.tilesets.forEach(function (tileset) {
            var key = "tiles/".concat(tileset.name);
            var extrudedKey = "extruded-".concat(key);
            //if (this.textures.exists(extrudedKey)) {
            _this.tileset = map.addTilesetImage(tileset.name, extrudedKey, tileset.tilewidth, tileset.tileheight, (tileset.margin || 0) + 1, (tileset.spacing || 0) + 2);
            console.log(_this.tileset);
            /*} else {
                this.tileset = map.addTilesetImage(tileset.name, key);
            }*/
        });
    };
    PaletteScene.prototype.update = function () {
        if (ige.developerMode.active) {
            var worldPoint2 = this.cameras.getCamera('palette').getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
            this.marker2.clear();
            this.marker2.strokeRect(0, 0, this.devPalette.map.tileWidth * this.devPalette.texturesLayer.scaleX, this.devPalette.map.tileHeight * this.devPalette.texturesLayer.scaleY);
            this.marker2.setVisible(true);
            // Rounds down to nearest tile
            var pointerTileX2 = this.devPalette.map.worldToTileX(worldPoint2.x);
            var pointerTileY2 = this.devPalette.map.worldToTileY(worldPoint2.y);
            if (0 <= pointerTileX2
                && pointerTileX2 < 27
                && 0 <= pointerTileY2
                && pointerTileY2 < 20
                && this.input.activePointer.x > this.devPalette.scrollBarContainer.x
                && this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
                && this.input.activePointer.y > this.devPalette.scrollBarContainer.y
                && this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height) {
                //this.marker.setVisible(false);
                // Snap to tile coordinates, but in world space
                this.marker2.x = this.devPalette.map.tileToWorldX(pointerTileX2);
                this.marker2.y = this.devPalette.map.tileToWorldY(pointerTileY2);
                if (this.input.manager.activePointer.rightButtonDown()) {
                    this.gameScene.selectedTile = this.devPalette.map.getTileAt(pointerTileX2, pointerTileY2);
                }
            }
            else if (!(this.input.activePointer.x > this.devPalette.scrollBarContainer.x
                && this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
                && this.input.activePointer.y > this.devPalette.scrollBarContainer.y
                && this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height)) {
                this.marker2.setVisible(false);
            }
        }
    };
    return PaletteScene;
}(PhaserScene));
//# sourceMappingURL=PaletteScene.js.map