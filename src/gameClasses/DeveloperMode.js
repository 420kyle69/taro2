var DeveloperMode = /** @class */ (function () {
    function DeveloperMode() {
        this.active = false;
    }
    DeveloperMode.prototype.enter = function () {
        console.log('enter developer mode');
        this.active = true;
        ige.client.emit('enterDevMode');
    };
    DeveloperMode.prototype.leave = function () {
        console.log('leave developer mode');
        this.active = false;
        ige.client.emit('leaveDevMode');
    };
    return DeveloperMode;
}());
//# sourceMappingURL=DeveloperMode.js.map