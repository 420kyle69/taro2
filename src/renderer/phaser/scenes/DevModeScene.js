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
var DevModeScene = /** @class */ (function (_super) {
    __extends(DevModeScene, _super);
    function DevModeScene() {
        return _super.call(this, { key: 'Palette' }) || this;
    }
    DevModeScene.prototype.init = function () {
        var _this = this;
        console.log('palette scene init');
        this.input.setTopOnly(true);
        this.gameScene = ige.renderer.scene.getScene('Game');
        //const map = this.devPalette.map;
        var map = this.gameScene.tilemap;
        this.selectedTile = map.getTileAt(2, 3);
        ige.client.on('enterDevMode', function () {
            _this.defaultZoom = (_this.gameScene.zoomSize / 2.15);
            if (!_this.devPalette) {
                _this.devPalette = new PhaserPalette(_this, _this.tileset, _this.rexUI);
                _this.paletteMarker = _this.add.graphics();
                _this.paletteMarker.lineStyle(2, 0x000000, 1);
                _this.paletteMarker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
                _this.paletteMarker.setVisible(false);
                _this.devPalette.hide();
                _this.devPalette.layerButtonsContainer.setVisible(true);
            }
            else
                _this.devPalette.layerButtonsContainer.setVisible(true);
        });
        ige.client.on('leaveDevMode', function () {
            _this.devPalette.hide();
            _this.devPalette.layerButtonsContainer.setVisible(false);
            ige.client.emit('zoom', _this.defaultZoom);
        });
        var tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
        tabKey.on('down', function () {
            if (ige.developerMode.active) {
                if (_this.devPalette.visible) {
                    _this.devPalette.hide();
                }
                else {
                    _this.devPalette.show();
                }
            }
        });
        var plusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, true);
        plusKey.on('down', function () {
            if (ige.developerMode.active) {
                var zoom = (_this.gameScene.zoomSize / 2.15) / 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        var minusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, true);
        minusKey.on('down', function () {
            if (ige.developerMode.active) {
                var zoom = (_this.gameScene.zoomSize / 2.15) * 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        ige.client.on('editTile', function (data) {
            map.putTileAt(data.gid, data.x, data.y, false, data.layer);
            ige.developerMode.changedTiles.push(data);
        });
        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            if (_this.devPalette && _this.devPalette.visible) {
                _this.devPalette.zoom(deltaY);
            }
        });
    };
    DevModeScene.prototype.preload = function () {
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
    DevModeScene.prototype.create = function () {
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
        var gameMap = this.gameScene.tilemap;
        gameMap.currentLayerIndex = 0;
        this.selectedTile = gameMap.getTileAt(2, 3);
        this.marker = this.gameScene.add.graphics();
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.strokeRect(0, 0, gameMap.tileWidth, gameMap.tileHeight);
        this.marker.setVisible(false);
    };
    DevModeScene.prototype.update = function () {
        if (ige.developerMode.active) {
            var map = this.gameScene.tilemap;
            var worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
            var palettePoint = this.cameras.getCamera('palette').getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
            this.paletteMarker.clear();
            this.paletteMarker.strokeRect(0, 0, this.devPalette.map.tileWidth * this.devPalette.texturesLayer.scaleX, this.devPalette.map.tileHeight * this.devPalette.texturesLayer.scaleY);
            this.paletteMarker.setVisible(true);
            // Rounds down to nearest tile
            var palettePointerTileX = this.devPalette.map.worldToTileX(palettePoint.x);
            var palettePointerTileY = this.devPalette.map.worldToTileY(palettePoint.y);
            if (this.devPalette.visible
                && 0 <= palettePointerTileX
                && palettePointerTileX < 27
                && 0 <= palettePointerTileY
                && palettePointerTileY < 20
                && this.input.activePointer.x > this.devPalette.scrollBarContainer.x
                && this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
                && this.input.activePointer.y > this.devPalette.scrollBarContainer.y - 30
                && this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height) {
                this.marker.setVisible(false);
                // Snap to tile coordinates, but in world space
                this.paletteMarker.x = this.devPalette.map.tileToWorldX(palettePointerTileX);
                this.paletteMarker.y = this.devPalette.map.tileToWorldY(palettePointerTileY);
                if (this.input.manager.activePointer.isDown) {
                    this.selectedTile.tint = 0xffffff;
                    this.selectedTile = this.devPalette.map.getTileAt(palettePointerTileX, palettePointerTileY, true);
                    this.selectedTile.tint = 0x87cfff;
                }
            }
            else if (!(this.input.activePointer.x > this.devPalette.scrollBarContainer.x
                && this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
                && this.input.activePointer.y > this.devPalette.scrollBarContainer.y - 30
                && this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height)
                || !this.devPalette.visible) {
                this.paletteMarker.setVisible(false);
                this.marker.setVisible(true);
                // Rounds down to nearest tile
                var pointerTileX = map.worldToTileX(worldPoint.x);
                var pointerTileY = map.worldToTileY(worldPoint.y);
                // Snap to tile coordinates, but in world space
                this.marker.x = map.tileToWorldX(pointerTileX);
                this.marker.y = map.tileToWorldY(pointerTileY);
                if (this.input.manager.activePointer.rightButtonDown()) {
                    if (map.getTileAt(pointerTileX, pointerTileY, true) !== null) {
                        this.selectedTile.tint = 0xffffff;
                        this.selectedTile = map.getTileAt(pointerTileX, pointerTileY, true);
                    }
                }
                if (this.input.manager.activePointer.leftButtonDown()
                    && (pointerTileX >= 0 && pointerTileY >= 0
                        && pointerTileX < map.width
                        && pointerTileY < map.height)
                    && this.selectedTile.index !== (map.getTileAt(pointerTileX, pointerTileY, true)).index) {
                    map.putTileAt(this.selectedTile, pointerTileX, pointerTileY);
                    map.getTileAt(pointerTileX, pointerTileY, true).tint = 0xffffff;
                    console.log('place tile', this.selectedTile.index);
                    ige.network.send('editTile', { gid: this.selectedTile.index, layer: map.currentLayerIndex, x: pointerTileX, y: pointerTileY });
                }
            }
        }
        else
            this.marker.setVisible(false);
    };
    return DevModeScene;
}(PhaserScene));
//# sourceMappingURL=DevModeScene.js.map