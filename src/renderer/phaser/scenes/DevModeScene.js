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
        return _super.call(this, { key: 'DevMode' }) || this;
    }
    DevModeScene.prototype.init = function () {
        var _this = this;
        this.input.setTopOnly(true);
        this.gameScene = ige.renderer.scene.getScene('Game');
        this.regions = [];
        //const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
        ige.client.on('enterDevMode', function () {
            _this.enterDevMode();
        });
        ige.client.on('leaveDevMode', function () {
            _this.leaveDevMode();
        });
        var tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
        tabKey.on('down', function () {
            if (shouldPreventKeybindings()) {
                _this.input.keyboard.disableGlobalCapture();
            }
            else {
                _this.input.keyboard.enableGlobalCapture();
                if (ige.developerMode.active) {
                    if (_this.tilePalette.visible) {
                        _this.tilePalette.hide();
                    }
                    else {
                        _this.tilePalette.show();
                    }
                }
            }
        });
        var shouldPreventKeybindings = function () {
            if (!$('#game-editor').is(':visible')) {
                return false;
            }
            var activeElement = document.activeElement;
            var inputs = ['input', 'select', 'textarea'];
            if (activeElement && inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1) {
                return true;
            }
            return false;
        };
        var plusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, false);
        plusKey.on('down', function () {
            if (ige.developerMode.active && !shouldPreventKeybindings()) {
                var zoom = (_this.gameScene.zoomSize / 2.15) / 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        var minusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
        minusKey.on('down', function () {
            if (ige.developerMode.active && !shouldPreventKeybindings()) {
                var zoom = (_this.gameScene.zoomSize / 2.15) * 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        ige.client.on('editTile', function (data) {
            _this.tileEditor.edit(data);
        });
        ige.client.on('editRegion', function (data) {
            _this.regionEditor.edit(data);
        });
        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            if (_this.tilePalette && _this.tilePalette.visible) {
                _this.tilePalette.zoom(deltaY);
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
        this.load.image('cursor', 'https://cache.modd.io/asset/spriteImage/1666276041347_cursor.png');
        this.load.image('region', 'https://cache.modd.io/asset/spriteImage/1666882309997_region.png');
        this.load.image('stamp', 'https://cache.modd.io/asset/spriteImage/1666724706664_stamp.png');
        this.load.image('eraser', 'https://cache.modd.io/asset/spriteImage/1666276083246_erasergap.png');
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
            /*} else {
                this.tileset = map.addTilesetImage(tileset.name, key);
            }*/
        });
        var gameMap = this.gameScene.tilemap;
        console.log('game map', gameMap);
        gameMap.currentLayerIndex = 0;
    };
    DevModeScene.prototype.enterDevMode = function () {
        this.defaultZoom = (this.gameScene.zoomSize / 2.15);
        if (!this.tilePalette) {
            this.devModeTools = new DevModeTools(this);
            this.tileEditor = this.devModeTools.tileEditor;
            this.tilePalette = this.devModeTools.palette;
            this.regionEditor = this.devModeTools.regionEditor;
        }
        this.devModeTools.enterDevMode();
        /*this.devModeTools.layerButtonsContainer.setVisible(true);
        this.devModeTools.toolButtonsContainer.setVisible(true);
        this.devModeTools.highlightModeButton(0);
        this.tileEditor.activateMarker(false);
        this.tilePalette.show();
        this.regionEditor.showRegions();*/
    };
    DevModeScene.prototype.leaveDevMode = function () {
        this.devModeTools.leaveDevMode();
        /*this.regionEditor.cancelDrawRegion();
        this.tilePalette.hide();
        this.devModeTools.layerButtonsContainer.setVisible(false);
        this.devModeTools.toolButtonsContainer.setVisible(false);
        this.regionEditor.hideRegions();
        ige.client.emit('zoom', this.defaultZoom);*/
    };
    DevModeScene.prototype.pointerInsideMap = function (pointerX, pointerY, map) {
        return (0 <= pointerX && pointerX < map.width
            && 0 <= pointerY && pointerY < map.height);
    };
    DevModeScene.prototype.pointerInsidePalette = function () {
        return (this.input.activePointer.x > this.tilePalette.scrollBarContainer.x
            && this.input.activePointer.x < this.tilePalette.scrollBarContainer.x + this.tilePalette.scrollBarContainer.width
            && this.input.activePointer.y > this.tilePalette.scrollBarContainer.y - 30
            && this.input.activePointer.y < this.tilePalette.scrollBarContainer.y + this.tilePalette.scrollBarContainer.height);
    };
    DevModeScene.prototype.pointerInsideButtons = function () {
        return ((this.input.activePointer.x > this.devModeTools.layerButtonsContainer.x
            && this.input.activePointer.x < this.devModeTools.layerButtonsContainer.x + this.devModeTools.layerButtonsContainer.width
            && this.input.activePointer.y > this.devModeTools.layerButtonsContainer.y
            && this.input.activePointer.y < this.devModeTools.layerButtonsContainer.y + this.devModeTools.layerButtonsContainer.height)
            || (this.input.activePointer.x > this.devModeTools.toolButtonsContainer.x
                && this.input.activePointer.x < this.devModeTools.toolButtonsContainer.x + this.devModeTools.toolButtonsContainer.width
                && this.input.activePointer.y > this.devModeTools.toolButtonsContainer.y
                && this.input.activePointer.y < this.devModeTools.toolButtonsContainer.y + this.devModeTools.toolButtonsContainer.height));
    };
    DevModeScene.prototype.update = function () {
        if (this.tileEditor)
            this.tileEditor.update();
    };
    return DevModeScene;
}(PhaserScene));
//# sourceMappingURL=DevModeScene.js.map