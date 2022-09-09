var DeveloperMode = /** @class */ (function () {
    function DeveloperMode() {
        this.active = false;
    }
    DeveloperMode.prototype.enter = function () {
        console.log('enter developer mode');
        this.active = true;
        //ige.renderer.scene.scenes[0].marker.setVisible(true);
    };
    DeveloperMode.prototype.leave = function () {
        console.log('leave developer mode');
        this.active = false;
        //ige.renderer.scene.scenes[0].marker.setVisible(false);
    };
    return DeveloperMode;
}());
//# sourceMappingURL=DeveloperMode.js.map