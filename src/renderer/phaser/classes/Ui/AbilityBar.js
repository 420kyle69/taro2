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
var AbilityBar = /** @class */ (function (_super) {
    __extends(AbilityBar, _super);
    function AbilityBar(scene) {
        var _this = _super.call(this, scene) || this;
        _this.scene = scene;
        _this.buttons = {};
        _this.buttonSize = 45;
        _this.buttonInterval = 3;
        _this.buttonRadius = 3;
        _this.x = _this.scene.sys.game.canvas.width / 2;
        _this.y = _this.scene.sys.game.canvas.height * 0.5 + 200;
        scene.add.existing(_this);
        return _this;
    }
    AbilityBar.prototype.addButton = function (abilityId, ability, key) {
        var button = new AbilityButton(this.scene, ability.name, key, 'description', ability.iconUrl, Object.values(this.buttons).length * (this.buttonSize + this.buttonInterval), 0, this.buttonSize, this.buttonRadius);
        this.buttons[abilityId] = button;
        this.add(button);
        this.x = this.scene.sys.game.canvas.width / 2 - Object.values(this.buttons).length * (this.buttonSize + this.buttonInterval) / 2;
    };
    AbilityBar.prototype.clear = function () {
        Object.values(this.buttons).forEach(function (button) { return button.destroy(); });
        this.buttons = {};
    };
    return AbilityBar;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=AbilityBar.js.map