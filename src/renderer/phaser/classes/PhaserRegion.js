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
var PhaserRegion = /** @class */ (function (_super) {
    __extends(PhaserRegion, _super);
    function PhaserRegion(scene, entity) {
        var _this = _super.call(this, entity) || this;
        _this.scene = scene;
        var stats = _this.entity._stats.default;
        var gameObject = scene.add.container();
        var graphics = scene.add.graphics();
        _this.graphics = graphics;
        gameObject.add(graphics);
        gameObject.setSize(stats.width, stats.height);
        gameObject.setPosition(stats.x + stats.width / 2, stats.y + stats.height / 2);
        gameObject.setInteractive();
        gameObject.on('pointerdown', function (p) {
            if (ige.developerMode.active && ige.developerMode.activeTab !== 'play' && _this.devModeScene.devModeTools.cursorButton.active && p.leftButtonDown()) {
                _this.scene.input.setTopOnly(true);
                _this.devModeScene.regionEditor.addClickedList({ name: _this.entity._stats.id, x: stats.x, y: stats.y, width: stats.width, height: stats.height });
            }
        });
        gameObject.on('pointerup', function (p) {
            if (ige.developerMode.active && ige.developerMode.activeTab !== 'play' && _this.devModeScene.devModeTools.cursorButton.active && p.leftButtonReleased()) {
                _this.scene.input.setTopOnly(false);
                _this.devModeScene.regionEditor.showClickedList();
            }
        });
        _this.gameObject = gameObject;
        scene.renderedEntities.push(_this.gameObject);
        scene.entityLayers[EntityLayer.TREES].add(_this.gameObject);
        _this.name = _this.entity._stats.id;
        if (!stats.inside) {
            _this.devModeOnly = true;
        }
        var devModeScene = _this.devModeScene = ige.renderer.scene.getScene('DevMode');
        devModeScene.regions.push(_this);
        if (_this.devModeOnly && !ige.developerMode.active && ige.developerMode.activeTab !== 'play') {
            _this.hide();
        }
        _this.updateLabel();
        _this.transform();
        return _this;
    }
    PhaserRegion.prototype.getLabel = function () {
        if (!this.label) {
            var scene = this.scene;
            var label = this.label = scene.add.bitmapText(0, 0, BitmapFontManager.font(scene, 'Verdana', false, ige.game.data.settings
                .addStrokeToNameAndAttributes !== false, '#FFFFFF'), 'cccccc', 16);
            label.letterSpacing = 1.3;
            label.visible = false;
            // needs to be created with the correct scale of the client
            label.setScale(1.3);
            label.setOrigin(0);
            this.gameObject.add(label);
        }
        return this.label;
    };
    PhaserRegion.prototype.updateLabel = function () {
        var label = this.getLabel();
        label.visible = true;
        label.setText(BitmapFontManager.sanitize(label.fontData, this.name || ''));
        var stats = this.entity._stats.default;
        label.setPosition(5 - stats.width / 2, 5 - stats.height / 2);
    };
    PhaserRegion.prototype.transform = function () {
        var gameObject = this.gameObject;
        var graphics = this.graphics;
        var label = this.label;
        var stats = this.entity._stats.default;
        gameObject.setSize(stats.width, stats.height);
        gameObject.setPosition(stats.x + stats.width / 2, stats.y + stats.height / 2);
        graphics.setPosition(-stats.width / 2, -stats.height / 2);
        label.setPosition(5 - stats.width / 2, 5 - stats.height / 2);
        graphics.clear();
        if (this.devModeOnly) {
            graphics.lineStyle(2, 0x11fa05, 
            // between 0 and 1 or we default
            (stats.alpha && stats.alpha >= 0 && stats.alpha <= 1) ? stats.alpha : 1);
            graphics.strokeRect(0, 0, stats.width, stats.height);
        }
        else {
            graphics.fillStyle(Number("0x".concat(stats.inside.substring(1))), 
            // between 0 and 1 or we default
            (stats.alpha && stats.alpha >= 0 && stats.alpha <= 1) ? stats.alpha : 0.4);
            graphics.fillRect(0, 0, stats.width, stats.height);
        }
    };
    PhaserRegion.prototype.destroy = function () {
        var _this = this;
        this.devModeScene.regions = this.devModeScene.regions.filter(function (item) { return item !== _this; });
        this.scene.renderedEntities = this.scene.renderedEntities.filter(function (item) { return item !== _this.gameObject; });
        _super.prototype.destroy.call(this);
    };
    return PhaserRegion;
}(PhaserEntity));
//# sourceMappingURL=PhaserRegion.js.map