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
    PaletteScene.prototype.init = function (tileset) {
        console.log('palette scene init');
        /*ige.client.on('enterDevMode', () => {
            if (this.devPalette) {
                this.devPalette.setVisible(true);
            } else {
                this.devPalette = new PhaserPalette(this, tileset);
                const map = this.devPalette.map;
                this.selectedTile = map.getTileAt(2, 3);
                this.marker2 = this.add.graphics();
                this.marker2.lineStyle(2, 0x000000, 1);
                this.marker2.strokeRect(0, 0, map.tileWidth, map.tileHeight);
                this.marker2.setVisible(false);
            }
        });

        ige.client.on('leaveDevMode', () => {
            this.devPalette.setVisible(false);
        });*/
        /*if (this.devPalette) {
            this.devPalette.setVisible(true);
        } else {
            this.devPalette = new PhaserPalette(this, tileset);
        }*/
    };
    /*preload (): void {


    }*/
    PaletteScene.prototype.update = function () {
        if (ige.developerMode.active) {
            var worldPoint = this.cameras.main.getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
            /*this.marker2.clear();
            this.marker2.strokeRect(0, 0, this.devPalette.map.tileWidth, this.devPalette.map.tileHeight);*/
            this.marker2.setVisible(true);
            // Rounds down to nearest tile
            var pointerTileX = this.devPalette.map.worldToTileX(worldPoint.x);
            var pointerTileY = this.devPalette.map.worldToTileY(worldPoint.y);
            console.log(pointerTileX, pointerTileY);
            if (0 < pointerTileX && pointerTileX < 27 && 0 < pointerTileY && pointerTileY < 20) {
                console.log('true', pointerTileX, pointerTileY);
                // Snap to tile coordinates, but in world space
                this.marker2.x = this.devPalette.map.tileToWorldX(pointerTileX);
                this.marker2.y = this.devPalette.map.tileToWorldY(pointerTileY);
                if (this.input.manager.activePointer.rightButtonDown()) {
                    this.selectedTile = this.devPalette.map.getTileAt(pointerTileX, pointerTileY);
                }
            }
            else {
                this.marker2.setVisible(false);
            }
        }
    };
    return PaletteScene;
}(PhaserScene));
//# sourceMappingURL=PaletteScene.js.map