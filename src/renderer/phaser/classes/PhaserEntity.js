/* eslint-disable @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars */
var PhaserEntity = /** @class */ (function () {
    function PhaserEntity(entity) {
        this.entity = entity;
        this.evtListeners = {};
        Object.assign(this.evtListeners, {
            transform: entity.on('transform', this.transform, this),
            scale: entity.on('scale', this.scale, this),
            hide: entity.on('hide', this.hide, this),
            show: entity.on('show', this.show, this),
            layer: entity.on('layer', this.layer, this),
            depth: entity.on('depth', this.depth, this),
            destroy: entity.on('destroy', this.destroy, this)
        });
    }
    PhaserEntity.prototype.transform = function (data) { };
    PhaserEntity.prototype.scale = function (data) { };
    PhaserEntity.prototype.hide = function () {
        this.gameObject.setActive(false)
            .setVisible(false);
    };
    PhaserEntity.prototype.show = function () {
        this.gameObject.setActive(true)
            .setVisible(true);
    };
    PhaserEntity.prototype.layer = function (value) {
        console.log("".concat(this.entity._category, " ").concat(this.entity.id(), " layer: ").concat(this.entity._layer)); // TODO: Remove
        // use index - 1 because taro layers are indexed at 1
        var scene = this.gameObject.scene;
        // default layer if we don't have a phaser layer for the passed value
        try {
            scene.entityLayers[value - 1].add(this.gameObject);
        }
        catch (e) {
            console.warn("invalid layer: ".concat(value - 1, "\nusing default layer: 'walls'"));
            scene.entityLayers[EntityLayer.WALLS].add(this.gameObject);
        }
    };
    PhaserEntity.prototype.depth = function (value) {
        console.log("".concat(this.entity._category, " ").concat(this.entity.id(), " depth: ").concat(this.entity._depth)); // TODO: Remove
        this.gameObject.setDepth(value);
    };
    PhaserEntity.prototype.destroy = function () {
        var _this = this;
        Object.keys(this.evtListeners).forEach(function (key) {
            _this.entity.off(key, _this.evtListeners[key]);
            delete _this.evtListeners[key];
        });
        this.gameObject.destroy();
        this.gameObject = null;
        this.evtListeners = null;
        this.entity = null;
    };
    return PhaserEntity;
}());
//# sourceMappingURL=PhaserEntity.js.map