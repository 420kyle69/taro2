var TileMarker = /** @class */ (function () {
    function TileMarker(scene, map, palette, w) {
        this.active = true;
        this.visiblePreview = false;
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
            var data = ige.game.data;
            var tileset = data.map.tilesets[0];
            var key = "tiles/".concat(tileset.name);
            var extrudedKey = "extruded-".concat(key);
            var preview = this.preview = scene.add.image(0, 0, extrudedKey, 0);
            preview.setOrigin(0, 0).setTint(0xabcbff).setAlpha(0.75).setVisible(false);
        }
    }
    return TileMarker;
}());
//# sourceMappingURL=TileMarker.js.map