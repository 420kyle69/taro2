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
    DeveloperMode.prototype.updateClientMap = function (data) {
        console.log('map data was edited', data.mapData.wasEdited);
        if (data.mapData.wasEdited) {
            ige.game.data.map = data.mapData;
            if (ige.physics) {
                //if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
                ige.physics.destroyWalls();
                var map = ige.scaleMap(_.cloneDeep(ige.game.data.map));
                ige.tiled.loadJson(map, function (layerArray, IgeLayersById) {
                    ige.physics.staticsFromMap(IgeLayersById.walls);
                });
            }
            ige.client.emit('updateMap');
        }
    };
    return DeveloperMode;
}());
//# sourceMappingURL=DeveloperMode.js.map