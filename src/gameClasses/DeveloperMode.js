var DeveloperMode = /** @class */ (function () {
    function DeveloperMode() {
        if (ige.isClient)
            this.active = false;
    }
    DeveloperMode.prototype.enter = function () {
        console.log('client enter developer mode');
        this.active = true;
        this.changeTab('play');
    };
    DeveloperMode.prototype.leave = function () {
        console.log('client leave developer mode');
        this.active = false;
    };
    DeveloperMode.prototype.changeTab = function (tab) {
        if (tab === 'map') {
            ige.client.emit('enterMapTab');
        }
        else {
            ige.client.emit('leaveMapTab');
        }
        if (tab === 'play') {
            ige.client.emit('lockCamera');
        }
        else if (this.activeTab === 'play') {
            ige.client.emit('unlockCamera');
        }
        this.activeTab = tab;
    };
    DeveloperMode.prototype.shouldPreventKeybindings = function () {
        return this.activeTab && this.activeTab !== 'play';
    };
    DeveloperMode.prototype.editTile = function (data, clientId) {
        // only allow developers to modify the tiles
        if (ige.server.developerClientIds.includes(clientId)) {
            ige.game.data.map.wasEdited = true;
            ige.network.send("editTile", data);
            var serverData = _.clone(data);
            var width = ige.game.data.map.width;
            if (ige.game.data.map.layers.length > 4 && serverData.layer >= 2)
                serverData.layer++;
            //save tile change to ige.game.map.data
            ige.game.data.map.layers[serverData.layer].data[serverData.y * width + serverData.x] = serverData.gid;
            if (ige.game.data.map.layers[serverData.layer].name === 'walls') {
                //if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
                ige.physics.destroyWalls();
                var map = ige.scaleMap(_.cloneDeep(ige.game.data.map));
                ige.tiled.loadJson(map, function (layerArray, layersById) {
                    ige.physics.staticsFromMap(layersById.walls);
                });
            }
        }
    };
    DeveloperMode.prototype.editRegion = function (data, clientId) {
        // only allow developers to modify regions
        if (ige.server.developerClientIds.includes(clientId)) {
            if (data.name === '' || data.width <= 0 || data.height <= 0) {
                console.log('empty name, negative or 0 size is not allowed');
            }
            else if (data.name === undefined) { // create new region
                // create new region name (smallest available number)
                var regionNameNumber = 0;
                var newRegionName = 'region' + regionNameNumber;
                do {
                    regionNameNumber++;
                    newRegionName = 'region' + regionNameNumber;
                } while (ige.regionManager.getRegionById(newRegionName));
                data.name = newRegionName;
                data.showModal = true;
                data.userId = ige.game.getPlayerByClientId(clientId)._stats.userId;
                // changed to Region from RegionUi
                var regionData = {
                    dataType: 'region',
                    default: {
                        x: data.x,
                        y: data.y,
                        width: data.width,
                        height: data.height,
                        key: newRegionName
                    },
                    id: newRegionName,
                    value: {
                        x: data.x,
                        y: data.y,
                        width: data.width,
                        height: data.height,
                        key: newRegionName
                    }
                };
                var region = new Region(regionData);
                // create new region in game.data
                ige.regionManager.updateRegionToDatabase(regionData);
            }
            else { // modify existing region
                var region = ige.regionManager.getRegionById(data.name);
                if (region) {
                    if (data.delete) {
                        region.destroy();
                    }
                    else {
                        if (data.name !== data.newName) {
                            if (ige.regionManager.getRegionById(data.newName)) {
                                console.log('This name is unavailable');
                            }
                            else {
                                region._stats.id = data.newName;
                            }
                        }
                        var statsData = [
                            { x: data.x !== region._stats.default.x ? data.x : null },
                            { y: data.y !== region._stats.default.y ? data.y : null },
                            { width: data.width !== region._stats.default.width ? data.width : null },
                            { height: data.height !== region._stats.default.height ? data.height : null }
                        ];
                        statsData = statsData.filter(function (obj) { return obj[Object.keys(obj)[0]] !== null; });
                        region.streamUpdateData(statsData);
                    }
                }
            }
            // broadcast region change to all clients
            ige.network.send("editRegion", data);
        }
    };
    DeveloperMode.prototype.updateClientMap = function (data) {
        console.log('map data was edited', data.mapData.wasEdited);
        if (data.mapData.wasEdited) {
            data.mapData.wasEdited = false;
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
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = DeveloperMode;
}
//# sourceMappingURL=DeveloperMode.js.map