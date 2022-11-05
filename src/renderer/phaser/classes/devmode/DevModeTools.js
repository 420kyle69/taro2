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
    function DevModeTools(scene, palette) {
        var _this = _super.call(this, scene) || this;
        _this.palette = palette;
        _this.COLOR_PRIMARY = palette.COLOR_PRIMARY;
        _this.COLOR_LIGHT = palette.COLOR_LIGHT;
        _this.COLOR_DARK = palette.COLOR_DARK;
        _this.scene.scale.on(Phaser.Scale.Events.RESIZE, function () {
            layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
            layerButtonsContainer.y = palette.camera.y - 170;
            toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
            toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 136;
        });
        new DevToolButton(_this, '+', null, 0, -34, 30, palette.scrollBarContainer, palette.zoom.bind(_this), -1);
        new DevToolButton(_this, '-', null, 34, -34, 30, palette.scrollBarContainer, palette.zoom.bind(_this), 1);
        var layerButtonsContainer = _this.layerButtonsContainer = new Phaser.GameObjects.Container(scene);
        layerButtonsContainer.width = 120;
        layerButtonsContainer.height = 204;
        layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
        layerButtonsContainer.y = palette.camera.y - 204;
        scene.add.existing(layerButtonsContainer);
        new DevToolButton(_this, 'palette', null, 0, 170, 120, layerButtonsContainer, palette.toggle.bind(_this));
        _this.layerButtons = [];
        _this.layerButtons.push(new DevToolButton(_this, 'floor', null, 0, 102, 120, layerButtonsContainer, _this.switchLayer.bind(_this), 0), new DevToolButton(_this, 'floor2', null, 0, 68, 120, layerButtonsContainer, _this.switchLayer.bind(_this), 1), new DevToolButton(_this, 'walls', null, 0, 34, 120, layerButtonsContainer, _this.switchLayer.bind(_this), 2), new DevToolButton(_this, 'trees', null, 0, 0, 120, layerButtonsContainer, _this.switchLayer.bind(_this), 3));
        _this.layerButtons[0].highlight(true);
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
        _this.brushButtons[0].highlight(true);
        return _this;
    }
    DevModeTools.prototype.cursor = function () {
        this.highlightModeButton(0);
        this.scene.regionTool = false;
        this.scene.activateMarker(false);
    };
    DevModeTools.prototype.drawRegion = function () {
        this.scene.activateMarker(false);
        this.highlightModeButton(1);
        this.scene.regionTool = true;
    };
    DevModeTools.prototype.brush = function () {
        this.scene.selectedTile = null;
        this.scene.selectedTileArea = [[null, null], [null, null]];
        this.scene.activateMarker(true);
        this.scene.regionTool = false;
        this.highlightModeButton(2);
    };
    DevModeTools.prototype.emptyTile = function () {
        var copy = __assign({}, this.scene.selectedTile);
        copy.index = 0;
        this.scene.selectedTile = copy;
        this.scene.selectedTileArea = [[copy, copy], [copy, copy]];
        this.scene.activateMarker(true);
        this.scene.regionTool = false;
        this.highlightModeButton(3);
    };
    DevModeTools.prototype.highlightModeButton = function (n) {
        this.modeButtons.forEach(function (button, index) {
            if (index === n)
                button.highlight(true);
            else
                button.highlight(false);
        });
    };
    DevModeTools.prototype.selectSingle = function () {
        for (var i = 0; i < this.palette.area.x; i++) {
            for (var j = 0; j < this.palette.area.y; j++) {
                if (this.scene.selectedTileArea[i][j])
                    this.scene.selectedTileArea[i][j].tint = 0xffffff;
            }
        }
        this.palette.area = { x: 1, y: 1 };
        this.scene.marker.graphics.scale = 1;
        this.scene.paletteMarker.graphics.scale = 1;
        this.brushButtons[0].highlight(true);
        this.brushButtons[1].highlight(false);
        this.scene.activateMarker(true);
    };
    DevModeTools.prototype.selectArea = function () {
        if (this.scene.selectedTile)
            this.scene.selectedTile.tint = 0xffffff;
        this.palette.area = { x: 2, y: 2 };
        this.scene.marker.graphics.scale = 2;
        this.scene.paletteMarker.graphics.scale = 2;
        this.brushButtons[1].highlight(true);
        this.brushButtons[0].highlight(false);
        this.scene.activateMarker(true);
    };
    DevModeTools.prototype.switchLayer = function (value) {
        var scene = this.scene;
        var gameMap = scene.gameScene.tilemap;
        gameMap.currentLayerIndex = value;
        this.layerButtons.forEach(function (button) {
            button.highlight(false);
        });
        this.layerButtons[value].highlight(true);
    };
    return DevModeTools;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=DevModeTools.js.map