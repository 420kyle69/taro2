var DeveloperMode = /** @class */ (function () {
    function DeveloperMode() {
        this.active = false;
        this.changedTiles = [];
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
    /*saveTileChange (data) {
        //ige.developerMode.changedTiles.push(data);
        const width = ige.game.data.map.width;
        if (data.layer >=2) data.layer ++;
        console.log('saving edited tile', data, data.y*width + data.x);
        //save tile change to ige.game.map.data
        ige.game.data.map.layers[data.layer].data[data.y*width + data.x] = data.gid;
        console.log(ige.game.data.map);
    }*/
    DeveloperMode.prototype.updateClientMap = function (data) {
        ige.game.data.map = data.mapData;
        ige.client.emit('updateMap');
        //ige.renderer.scene.getScene('Game').updateMap();
    };
    return DeveloperMode;
}());
//# sourceMappingURL=DeveloperMode.js.map