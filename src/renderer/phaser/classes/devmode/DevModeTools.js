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
var DevModeTools = /** @class */ (function (_super) {
    __extends(DevModeTools, _super);
    function DevModeTools(scene) {
        var _this = _super.call(this, scene) || this;
        var palette = _this.palette = new TilePalette(_this.scene, _this.scene.tileset, _this.scene.rexUI);
        _this.tileEditor = new TileEditor(_this.scene.gameScene, _this.scene, _this);
        _this.regionEditor = new RegionEditor(_this.scene.gameScene, _this.scene, _this);
        _this.gameEditorWidgets = [];
        _this.keyBindings();
        _this.COLOR_PRIMARY = palette.COLOR_PRIMARY;
        _this.COLOR_LIGHT = palette.COLOR_LIGHT;
        _this.COLOR_WHITE = palette.COLOR_WHITE;
        _this.COLOR_GRAY = palette.COLOR_GRAY;
        _this.scene.scale.on(Phaser.Scale.Events.RESIZE, function () {
            layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
            layerButtonsContainer.y = palette.camera.y - 170;
            toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
            toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 136;
        });
        new DevToolButton(_this, '+', null, 0, -34, 30, palette.scrollBarContainer, palette.zoom.bind(palette), -1);
        new DevToolButton(_this, '-', null, 34, -34, 30, palette.scrollBarContainer, palette.zoom.bind(palette), 1);
        var layerButtonsContainer = _this.layerButtonsContainer = new Phaser.GameObjects.Container(scene);
        layerButtonsContainer.width = 120;
        layerButtonsContainer.height = 204;
        layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
        layerButtonsContainer.y = palette.camera.y - 204;
        scene.add.existing(layerButtonsContainer);
        _this.paletteButton = new DevToolButton(_this, 'palette', null, 0, 170, 120, layerButtonsContainer, palette.toggle.bind(palette));
        _this.layerButtons = [];
        _this.layerButtons.push(new DevToolButton(_this, 'floor', null, 30, 102, 85, layerButtonsContainer, _this.switchLayer.bind(_this), 0), new DevToolButton(_this, 'floor2', null, 30, 68, 85, layerButtonsContainer, _this.switchLayer.bind(_this), 1), new DevToolButton(_this, 'walls', null, 30, 34, 85, layerButtonsContainer, _this.switchLayer.bind(_this), 2), new DevToolButton(_this, 'trees', null, 30, 0, 85, layerButtonsContainer, _this.switchLayer.bind(_this), 3));
        _this.layerButtons[0].highlight('active');
        _this.layerHideButtons = [];
        _this.layerHideButtons.push(new DevToolButton(_this, '', 'eyeopen', 0, 102, 35, layerButtonsContainer, _this.hideLayer.bind(_this), 0), new DevToolButton(_this, '', 'eyeopen', 0, 68, 35, layerButtonsContainer, _this.hideLayer.bind(_this), 1), new DevToolButton(_this, '', 'eyeopen', 0, 34, 35, layerButtonsContainer, _this.hideLayer.bind(_this), 2), new DevToolButton(_this, '', 'eyeopen', 0, 0, 35, layerButtonsContainer, _this.hideLayer.bind(_this), 3));
        _this.layerHideButtons[0].highlight('active');
        var toolButtonsContainer = _this.toolButtonsContainer = new Phaser.GameObjects.Container(scene);
        toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
        toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 184;
        toolButtonsContainer.width = 120;
        toolButtonsContainer.height = 98;
        scene.add.existing(toolButtonsContainer);
        _this.modeButtons = [];
        _this.modeButtons.push(new DevToolButton(_this, '', 'cursor', 0, 0, 58, toolButtonsContainer, _this.cursor.bind(_this)), new DevToolButton(_this, '', 'region', 62, 0, 58, toolButtonsContainer, _this.drawRegion.bind(_this)), new DevToolButton(_this, '', 'stamp', 0, 34, 58, toolButtonsContainer, _this.brush.bind(_this)), new DevToolButton(_this, '', 'eraser', 62, 34, 58, toolButtonsContainer, _this.emptyTile.bind(_this)));
        _this.cursorButton = _this.modeButtons[0];
        _this.highlightModeButton(0);
        _this.brushButtons = [];
        _this.brushButtons.push(new DevToolButton(_this, '1x1', null, 0, 102, 58, toolButtonsContainer, _this.selectSingle.bind(_this)), new DevToolButton(_this, '2x2', null, 62, 102, 58, toolButtonsContainer, _this.selectArea.bind(_this)));
        _this.brushButtons[0].highlight('active');
        _this.palette.hide();
        _this.layerButtonsContainer.setVisible(false);
        _this.toolButtonsContainer.setVisible(false);
        _this.regionEditor.hideRegions();
        var ctrlKey = _this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL, false);
        _this.scene.input.on('pointermove', function (p) {
            if (ige.developerMode.active && ige.developerMode.activeTab !== 'play' && scene.tileEditor.startDragIn !== 'palette' && (p.rightButtonDown() || (p.isDown && ctrlKey.isDown))) {
                var camera = _this.scene.gameScene.cameras.main;
                var scrollX_1 = (p.x - p.prevPosition.x) / camera.zoom;
                var scrollY_1 = (p.y - p.prevPosition.y) / camera.zoom;
                camera.scrollX -= scrollX_1;
                camera.scrollY -= scrollY_1;
            }
            ;
        });
        return _this;
    }
    DevModeTools.prototype.enterMapTab = function () {
        this.layerButtonsContainer.setVisible(true);
        this.toolButtonsContainer.setVisible(true);
        this.highlightModeButton(0);
        this.tileEditor.activateMarker(false);
        this.palette.show();
        this.regionEditor.showRegions();
    };
    DevModeTools.prototype.leaveMapTab = function () {
        this.regionEditor.cancelDrawRegion();
        this.palette.hide();
        this.layerButtonsContainer.setVisible(false);
        this.toolButtonsContainer.setVisible(false);
        this.regionEditor.hideRegions();
    };
    DevModeTools.prototype.queryWidgets = function () {
        this.gameEditorWidgets = Array.from(document.querySelectorAll('.game-editor-widget'))
            .map(function (widget) { return widget.getBoundingClientRect(); });
    };
    DevModeTools.prototype.keyBindings = function () {
        var _this = this;
        var gameScene = this.scene.gameScene;
        var keyboard = this.scene.input.keyboard;
        var tabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
        tabKey.on('down', function () {
            if (ige.developerMode.active && ige.developerMode.activeTab === 'map') {
                keyboard.disableGlobalCapture();
                if (_this.palette.visible) {
                    _this.palette.hide();
                }
                else {
                    _this.palette.show();
                }
                keyboard.enableGlobalCapture();
            }
        });
        var plusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, false);
        plusKey.on('down', function () {
            if (ige.developerMode.active && ige.developerMode.activeTab === 'map') {
                var zoom = (gameScene.zoomSize / 2.15) / 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        var minusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
        minusKey.on('down', function () {
            if (ige.developerMode.active && ige.developerMode.activeTab === 'map') {
                var zoom = (gameScene.zoomSize / 2.15) * 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
    };
    DevModeTools.prototype.cursor = function () {
        this.highlightModeButton(0);
        this.scene.regionEditor.regionTool = false;
        this.tileEditor.activateMarker(false);
    };
    DevModeTools.prototype.drawRegion = function () {
        this.tileEditor.activateMarker(false);
        this.highlightModeButton(1);
        this.scene.regionEditor.regionTool = true;
    };
    DevModeTools.prototype.brush = function () {
        if (this.modeButtons[3].active) {
            this.tileEditor.selectedTile = this.tileEditor.lastSelectedTile;
            this.tileEditor.selectedTileArea = this.tileEditor.lastSelectedTileArea;
        }
        this.tileEditor.activateMarker(true);
        this.scene.regionEditor.regionTool = false;
        this.highlightModeButton(2);
    };
    DevModeTools.prototype.emptyTile = function () {
        /*if (this.tileEditor.selectedTile) this.tileEditor.selectedTile.tint = 0xffffff;
        for (let i = 0; i < this.tileEditor.area.x; i++) {
            for (let j = 0; j < this.tileEditor.area.y; j++) {
                if (this.tileEditor.selectedTileArea[i][j]) this.tileEditor.selectedTileArea[i][j].tint = 0xffffff;
            }
        }*/
        if (!this.modeButtons[3].active) {
            this.tileEditor.lastSelectedTile = this.tileEditor.selectedTile;
            this.tileEditor.lastSelectedTileArea = this.tileEditor.selectedTileArea;
            var copy = __assign({}, this.tileEditor.selectedTile);
            copy.index = 0;
            this.tileEditor.selectedTile = copy;
            this.tileEditor.selectedTileArea = [[copy, copy], [copy, copy]];
            this.tileEditor.activateMarker(true);
            this.scene.regionEditor.regionTool = false;
            this.highlightModeButton(3);
        }
    };
    DevModeTools.prototype.highlightModeButton = function (n) {
        this.modeButtons.forEach(function (button, index) {
            if (index === n)
                button.highlight('active');
            else
                button.highlight('no');
        });
    };
    DevModeTools.prototype.selectSingle = function () {
        for (var i = 0; i < this.tileEditor.area.x; i++) {
            for (var j = 0; j < this.tileEditor.area.y; j++) {
                if (this.tileEditor.selectedTileArea[i][j])
                    this.tileEditor.selectedTileArea[i][j].tint = 0xffffff;
            }
        }
        this.tileEditor.area = { x: 1, y: 1 };
        this.tileEditor.marker.graphics.scale = 1;
        this.tileEditor.paletteMarker.graphics.scale = 1;
        this.brushButtons[0].highlight('active');
        this.brushButtons[1].highlight('no');
        this.tileEditor.activateMarker(true);
        if (!this.modeButtons[3].active) {
            this.brush();
        }
    };
    DevModeTools.prototype.selectArea = function () {
        if (this.tileEditor.selectedTile)
            this.tileEditor.selectedTile.tint = 0xffffff;
        this.tileEditor.area = { x: 2, y: 2 };
        this.tileEditor.marker.graphics.scale = 2;
        this.tileEditor.paletteMarker.graphics.scale = 2;
        this.brushButtons[1].highlight('active');
        this.brushButtons[0].highlight('no');
        this.tileEditor.activateMarker(true);
        if (!this.modeButtons[3].active) {
            this.brush();
        }
    };
    DevModeTools.prototype.switchLayer = function (value) {
        var scene = this.scene;
        var gameMap = scene.gameScene.tilemap;
        gameMap.currentLayerIndex = value;
        this.layerButtons.forEach(function (button) {
            button.highlight('no');
            button.increaseSize(false);
        });
        this.layerHideButtons.forEach(function (button) {
            button.highlight('no');
            button.increaseSize(false);
        });
        if (this.layerButtons[value] && this.layerHideButtons[value]) {
            this.layerHideButtons[value].image.setTexture('eyeopen');
            this.layerButtons[value].highlight('no');
            this.layerHideButtons[value].highlight('no');
            scene.gameScene.tilemapLayers[value].setVisible(true);
            this.layerButtons[value].highlight('active');
            this.layerButtons[value].increaseSize(true);
            this.layerHideButtons[value].highlight('active');
            this.layerHideButtons[value].increaseSize(true);
        }
    };
    DevModeTools.prototype.hideLayer = function (value) {
        var scene = this.scene;
        if (scene.gameScene.tilemap.currentLayerIndex === value) {
            this.switchLayer(-1);
            this.tileEditor.marker.graphics.setVisible(false);
        }
        var tilemapLayers = scene.gameScene.tilemapLayers;
        if (this.layerHideButtons[value].image.texture.key === 'eyeopen') {
            this.layerHideButtons[value].image.setTexture('eyeclosed');
            this.layerButtons[value].highlight('hidden');
            this.layerHideButtons[value].highlight('hidden');
            tilemapLayers[value].setVisible(false);
        }
        else {
            this.layerHideButtons[value].image.setTexture('eyeopen');
            this.layerButtons[value].hidden = false;
            this.layerButtons[value].highlight('no');
            this.layerHideButtons[value].hidden = false;
            this.layerHideButtons[value].highlight('no');
            tilemapLayers[value].setVisible(true);
        }
    };
    return DevModeTools;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=DevModeTools.js.map