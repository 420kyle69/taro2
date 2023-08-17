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
var UIScene = /** @class */ (function (_super) {
    __extends(UIScene, _super);
    function UIScene() {
        return _super.call(this, { key: 'UI', active: true }) || this;
    }
    UIScene.prototype.init = function () {
    };
    UIScene.prototype.create = function () {
        //  Our Text object to display the Score
        var info = this.add.text(100, 100, 'Score: 0');
        //  Grab a reference to the Game Scene
        /*const ourGame = this.scene.get('GameScene');

        //  Listen for events from it
        ourGame.events.on('addScore', function ()
        {

            this.score += 10;

            info.setText(`Score: ${this.score}`);

        }, this);*/
    };
    UIScene.prototype.preload = function () {
    };
    UIScene.prototype.update = function () {
    };
    return UIScene;
}(PhaserScene));
//# sourceMappingURL=UIScene.js.map