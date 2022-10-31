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
var PhaserItem = /** @class */ (function (_super) {
    __extends(PhaserItem, _super);
    function PhaserItem(scene, entity) {
        var _this = _super.call(this, scene, entity, "item/".concat(entity._stats.itemTypeId)) || this;
        _this.sprite.visible = false;
        _this.gameObject = _this.sprite;
        var _a = entity._translate, x = _a.x, y = _a.y;
        _this.gameObject.setPosition(x, y);
        Object.assign(_this.evtListeners, {
            // this event is only emitted by height-based-zindex games
            setOwnerUnit: entity.on('setOwnerUnit', _this.setOwnerUnit, _this)
        });
        if (scene.heightRenderer) {
            // don't waste cpu tracking owner of items on renderer
            // unless we have to (hbz)
            // this won't work for *our* units
            if (entity._stats.ownerUnitId !== undefined) {
                _this.setOwnerUnit(entity._stats.ownerUnitId);
            }
            _this.gameObject.spriteHeight2 = _this.sprite.displayHeight / 2;
        }
        _this.scene.renderedEntities.push(_this.sprite);
        return _this;
    }
    PhaserItem.prototype.depth = function (value) {
        var scene = this.gameObject.scene;
        this.gameObject.taroDepth = value;
        if (scene.heightRenderer) {
            scene.heightRenderer.adjustDepth(this.gameObject);
        }
        else {
            this.gameObject.setDepth(value);
        }
    };
    PhaserItem.prototype.setOwnerUnit = function (unitId) {
        this.ownerUnitId = unitId;
        var phaserUnit = unitId ? this.scene.findUnit(unitId) : null;
        this.gameObject.owner = phaserUnit ? phaserUnit : null;
    };
    PhaserItem.prototype.size = function (data) {
        _super.prototype.size.call(this, data);
        if (data.height && this.scene.heightRenderer) {
            this.sprite.spriteHeight2 = this.sprite.displayHeight / 2;
        }
    };
    PhaserItem.prototype.destroy = function () {
        var _this = this;
        this.scene.renderedEntities = this.scene.renderedEntities.filter(function (item) { return item !== _this.sprite; });
        this.ownerUnitId = null;
        _super.prototype.destroy.call(this);
    };
    return PhaserItem;
}(PhaserAnimatedEntity));
//# sourceMappingURL=PhaserItem.js.map