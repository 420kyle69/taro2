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
var UiScene = /** @class */ (function (_super) {
    __extends(UiScene, _super);
    function UiScene() {
        return _super.call(this, { key: 'UI', active: true }) || this;
    }
    UiScene.prototype.init = function () {
        return;
    };
    UiScene.prototype.create = function () {
        this.tooltip = new DevTooltip(this);
        var abilityBar = new AbilityBar(this);
        taro.client.on('create-ability-bar', function (data) {
            var keybindings = data.keybindings;
            var abilities = data.abilities;
            abilityBar.clear();
            Object.entries(abilities).forEach(function (_a) {
                var abilityId = _a[0], ability = _a[1];
                var key;
                Object.entries(keybindings).forEach(function (_a) {
                    var _b, _c;
                    var keybindingKey = _a[0], keybinding = _a[1];
                    if (((_b = keybinding.keyDown) === null || _b === void 0 ? void 0 : _b.abilityId) === abilityId || ((_c = keybinding.keyUp) === null || _c === void 0 ? void 0 : _c.abilityId) === abilityId) {
                        key = keybindingKey;
                    }
                });
                abilityBar.addButton(abilityId, ability, key);
            });
        });
        taro.client.on('start-casting', function (abilityId) {
            abilityBar.buttons[abilityId].activate(true);
        });
        taro.client.on('stop-casting', function (abilityId) {
            abilityBar.buttons[abilityId].activate(false);
        });
    };
    UiScene.prototype.preload = function () {
        var _this = this;
        this.load.plugin('rexroundrectangleplugin', '/assets/js/rexroundrectangleplugin.min.js', true);
        Object.values(taro.game.data.abilities).forEach(function (ability) {
            _this.load.image(ability.iconUrl, ability.iconUrl);
        });
        Object.values(taro.game.data.unitTypes).forEach(function (unitType) {
            if (unitType.controls.unitAbilities) {
                Object.values(unitType.controls.unitAbilities).forEach(function (ability) {
                    _this.load.image(ability.iconUrl, ability.iconUrl);
                });
            }
        });
    };
    UiScene.prototype.update = function () {
        return;
    };
    return UiScene;
}(PhaserScene));
//# sourceMappingURL=UiScene.js.map