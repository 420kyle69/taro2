/// <reference types="@types/google.analytics" />
var ThreeRenderer = /** @class */ (function () {
    function ThreeRenderer() {
        var _this = this;
        this.units = [];
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        document.querySelector("#game-div").appendChild(this.canvas);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.backgroundColor = "gray";
        taro.client.rendererLoaded.resolve();
        taro.client.on("create-unit", function (unit) {
            unit.on("transform", function (data) {
                unit._translate.x = data.x;
                unit._translate.y = data.y;
            }, _this);
            _this.units.push(unit);
            _this;
        });
        requestAnimationFrame(this.render.bind(this));
        this.setupInputListeners();
    }
    ThreeRenderer.prototype.setupInputListeners = function () {
        // Ask the input component to set up any listeners it has
        taro.input.setupListeners(this.canvas);
    };
    ThreeRenderer.prototype.getViewportBounds = function () {
        // return this.scene.getScene('Game').cameras.main.worldView;
        return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    };
    ThreeRenderer.prototype.getCameraWidth = function () {
        // return this.scene.getScene('Game').cameras.main.displayWidth;
        return window.innerWidth;
    };
    ThreeRenderer.prototype.getCameraHeight = function () {
        // return this.scene.getScene('Game').cameras.main.displayHeight;
        return window.innerHeight;
    };
    ThreeRenderer.prototype.render = function () {
        requestAnimationFrame(this.render.bind(this));
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        if (this.units.length > 0) {
            for (var _i = 0, _a = this.units; _i < _a.length; _i++) {
                var u = _a[_i];
                this.ctx.beginPath();
                this.ctx.arc(u._translate.x, u._translate.y, 50, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
        }
        taro.client.emit("tick");
    };
    return ThreeRenderer;
}());
//# sourceMappingURL=ThreeRenderer.js.map