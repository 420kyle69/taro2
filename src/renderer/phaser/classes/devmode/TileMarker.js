var TileMarker = /** @class */ (function () {
    function TileMarker(scene, devModeScene, map, palette, w) {
        this.scene = scene;
        this.devModeScene = devModeScene;
        this.map = map;
        this.palette = palette;
        this.active = true;
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(w, 0x000000, 1);
        if (ige.game.data.defaultData.dontResize) {
            this.graphics.strokeRect(0, 0, map.tileWidth, map.tileHeight);
        }
        else {
            this.graphics.strokeRect(0, 0, 64, 64);
        }
        this.graphics.setVisible(false);
        if (!palette) {
            this.preview = scene.add.container();
            this.images = [[], []];
        }
    }
    TileMarker.prototype.addImage = function (x, y) {
        var map = this.map;
        var data = ige.game.data;
        var tileset = data.map.tilesets[0];
        var key = "tiles/".concat(tileset.name);
        var extrudedKey = "extruded-".concat(key);
        var width = 64;
        var height = 64;
        if (ige.game.data.defaultData.dontResize) {
            width = map.tileWidth;
            height = map.tileHeight;
        }
        var image = this.scene.add.image(x * width, y * height, extrudedKey, 0);
        image.setOrigin(0, 0).setTint(0xabcbff).setAlpha(0).setVisible(false);
        image.setDisplaySize(width, height);
        this.preview.add(image);
        return image;
    };
    TileMarker.prototype.changePreview = function () {
        var _a = this.devModeScene.tileEditor.area, x = _a.x, y = _a.y;
        this.graphics.scale = x;
        if (!this.palette) {
            this.hideImages();
            if (x === 2 && y === 2) {
                var previewTarget = this.devModeScene.tileEditor.selectedTileArea;
                for (var i = 0; i < x; i++) {
                    for (var j = 0; j < y; j++) {
                        if (previewTarget[i][j] && previewTarget[i][j].index !== 0) {
                            if (!this.images[i][j]) {
                                this.images[i][j] = this.addImage(i, j);
                            }
                            this.images[i][j].setTexture('extruded-tiles/tilesheet_complete', previewTarget[i][j].index - 1).setAlpha(0.75);
                        }
                        else if (this.images[i][j])
                            this.images[i][j].setAlpha(0);
                    }
                }
            }
            else if (x === 1 && y === 1) {
                var previewTarget = this.devModeScene.tileEditor.selectedTile;
                if (previewTarget && previewTarget.index !== 0) {
                    if (!this.images[0][0]) {
                        this.images[0][0] = this.addImage(0, 0);
                    }
                    this.images[0][0].setTexture('extruded-tiles/tilesheet_complete', previewTarget.index - 1).setAlpha(0.75);
                }
                else if (this.images[0][0])
                    this.images[0][0].setAlpha(0);
            }
        }
    };
    TileMarker.prototype.hideImages = function () {
        for (var i = 0; i < this.images.length; i++) {
            for (var j = 0; j < this.images[0].length; j++) {
                if (this.images[i] && this.images[i][j])
                    this.images[i][j].setAlpha(0);
            }
        }
    };
    TileMarker.prototype.showPreview = function (value) {
        var devModeScene = ige.renderer.scene.getScene('DevMode');
        var area = devModeScene.tileEditor.area;
        for (var i = 0; i < area.x; i++) {
            for (var j = 0; j < area.y; j++) {
                if (this.images[i] && this.images[i][j])
                    this.images[i][j].setVisible(value);
            }
        }
    };
    return TileMarker;
}());
//# sourceMappingURL=TileMarker.js.map