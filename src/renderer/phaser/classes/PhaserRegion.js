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
        gameObject.on('pointerdown', function () {
            if (ige.developerMode.active && _this.devModeScene.regionTool && _this.scene.input.manager.activePointer.rightButtonDown()) {
                ige.addNewRegion && ige.addNewRegion({ name: _this.entity._stats.id, x: stats.x, y: stats.y, width: stats.width, height: stats.height });
            }
        });
        _this.gameObject = gameObject;
        scene.renderedEntities.push(_this.gameObject);
        // we don't get depth/layer info from taro,
        // so it can go in 'debris' layer for now
        scene.entityLayers[EntityLayer.DEBRIS].add(_this.gameObject);
        _this.name = _this.entity._stats.id;
        if (!stats.inside) {
            _this.devModeOnly = true;
        }
        var devModeScene = _this.devModeScene = ige.renderer.scene.getScene('DevMode');
        devModeScene.regions.push(_this);
        if (_this.devModeOnly && !ige.developerMode.active) {
            _this.hide();
        }
        _this.updateLabel();
        _this.transform();
        return _this;
    }
    PhaserRegion.prototype.getLabel = function () {
        if (!this.label) {
            var label = this.label = this.scene.add.text(0, 0, 'cccccc');
            label.visible = false;
            // needs to be created with the correct scale of the client
            this.label.setScale(1 / this.scene.cameras.main.zoom);
            label.setOrigin(0);
            this.gameObject.add(label);
        }
        return this.label;
    };
    PhaserRegion.prototype.updateLabel = function () {
        var label = this.getLabel();
        label.visible = true;
        label.setFontFamily('Verdana');
        label.setFontSize(16);
        label.setFontStyle('normal');
        label.setFill('#fff');
        var strokeThickness = ige.game.data.settings
            .addStrokeToNameAndAttributes !== false ? 4 : 0;
        label.setStroke('#000', strokeThickness);
        label.setText(this.name || '');
        var stats = this.entity._stats.default;
        label.setPosition(5 - stats.width / 2, 5 - stats.height / 2);
    };
    PhaserRegion.prototype.transform = function () {
        var graphics = this.graphics;
        var label = this.label;
        var stats = this.entity._stats.default;
        this.gameObject.setPosition(stats.x + stats.width / 2, stats.y + stats.height / 2);
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
        ;
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