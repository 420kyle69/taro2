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
        var _this = this;
        this.abilityIconsContainer = new Phaser.GameObjects.Container(this, 64, 64);
        taro.client.on('ability-icons', function (abilities) {
            _this.generateAbilityIcons(abilities);
        });
        this.add.existing(this.abilityIconsContainer);
    };
    UiScene.prototype.create = function () {
        return;
    };
    UiScene.prototype.preload = function () {
        var abilities = taro.game.data.abilities;
        for (var abilityId in abilities) {
            this.load.image("ability/".concat(abilityId), this.patchAssetUrl(abilities[abilityId].iconUrl));
        }
    };
    UiScene.prototype.update = function () {
        return;
    };
    UiScene.prototype.generateAbilityIcons = function (abilities) {
        console.log(abilities);
        var x = 0;
        var y = 0;
        var spacer = 16;
        for (var abilityId in abilities) {
            this.abilityIconsContainer.add(new PhaserAbilityIcon(this, x, y, "ability/".concat(abilityId), abilityId));
            x += spacer;
        }
    };
    return UiScene;
}(PhaserScene));
var PhaserAbilityIcon = /** @class */ (function (_super) {
    __extends(PhaserAbilityIcon, _super);
    function PhaserAbilityIcon(scene, x, y, texture, abilityId) {
        var _this = _super.call(this, scene, x, y, texture) || this;
        _this.abilityId = abilityId;
        _this.setVisible(true);
        return _this;
    }
    return PhaserAbilityIcon;
}(Phaser.GameObjects.Sprite));
//# sourceMappingURL=UiScene.js.map