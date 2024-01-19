/**
 * recursively set object parameters
 * @param oldObject
 * @param newObject
 */
function setObject(oldObject, newObject) {
    Object.keys(newObject).map((k) => {
        if (!oldObject[k]) {
            oldObject[k] = {};
        }
        if (typeof newObject[k] === 'object') {
            setObject(oldObject[k], newObject[k]);
        }
        else {
            oldObject[k] = newObject[k];
        }
    });
}
/**
 * merge the oldData with newData using template
 * @param oldData
 * @param newData
 * @param template
 */
function merge(oldData, newData, template) {
    Object.entries(template).map(([k, v]) => {
        if (!v.calc && typeof v === 'object') {
            if (!oldData[k]) {
                oldData[k] = {};
            }
            merge(oldData[k], newData[k], template[k]);
            return;
        }
        if (!oldData[k] && v.calc !== 'init') {
            switch (typeof newData[k]) {
                case 'string': {
                    oldData[k] = '';
                    break;
                }
                case 'number': {
                    oldData[k] = 0;
                    break;
                }
                case 'object': {
                    oldData[k] = Array.isArray(newData[k]) ? [] : {};
                    break;
                }
            }
        }
        if (typeof v.calc === 'function') {
            v.calc(oldData, newData, oldData[k]);
        }
        else {
            switch (v.calc) {
                case 'init': {
                    if (oldData[k] === undefined) {
                        oldData[k] = newData[k];
                    }
                    break;
                }
                case 'set': {
                    oldData[k] = newData[k];
                    break;
                }
                case 'smartSet': {
                    if (typeof newData[k] === 'object') {
                        setObject(oldData[k], newData[k]);
                    }
                    else {
                        oldData[k] = newData[k];
                    }
                    break;
                }
                case 'sum': {
                    switch (v.method) {
                        case 'direct': {
                            oldData[k] += newData[k];
                            break;
                        }
                        case 'array': {
                            // console.log('oldData', oldData[k], k)
                            newData[k].map((v) => {
                                if (!oldData[k].includes(v)) {
                                    oldData[k].push(v);
                                }
                            });
                        }
                    }
                    break;
                }
                case 'div': {
                    oldData[k] /= newData[k];
                    break;
                }
                case 'sub': {
                    oldData[k] -= newData[k];
                    break;
                }
                case 'mul': {
                    oldData[k] *= newData[k];
                    break;
                }
            }
        }
        return oldData;
    });
}
const mergedTemplate = {
    edit: {
        size: { calc: 'set', method: 'direct' },
        selectedTiles: {
            calc: (oldData, newData, nowData) => {
                var _a;
                // console.log(oldData, newData, nowData);
                const newLayer = newData.layer[0];
                if (!((_a = oldData.layer) === null || _a === void 0 ? void 0 : _a.includes(newLayer))) {
                    nowData.push(...newData.selectedTiles);
                }
                else {
                    const idx = oldData.layer.findIndex((v) => v === newLayer);
                    setObject(nowData[idx], newData.selectedTiles[0]);
                }
            }, method: 'direct'
        },
        shape: { calc: 'set', method: 'direct' },
        layer: { calc: 'sum', method: 'array' },
        x: { calc: 'init', method: 'direct' },
        y: { calc: 'init', method: 'direct' },
    }
};
function debounce(func, timeout, mergedTemplate) {
    let timer;
    let mergedData = [{}];
    return function (...args) {
        clearTimeout(timer);
        if (mergedTemplate) {
            args.map((v, idx) => {
                merge(mergedData[0], v, mergedTemplate);
            });
        }
        else {
            if (Array.isArray(args)) {
                mergedData = args;
            }
            else {
                mergedData[0] = args;
            }
        }
        timer = setTimeout(() => {
            func(...mergedData);
            mergedData = [{}];
        }, timeout);
    };
}
function mergeSetWasEdited(gameMap) {
    gameMap.wasEdited = true;
}
function mergeEditTileActions(data) {
    taro.network.send('editTile', data);
}
const debounceSetWasEdited = debounce(mergeSetWasEdited, 0);
const debounceEditTileSend = debounce(mergeEditTileActions, 0, mergedTemplate);
function recalcWallsPhysics(gameMap, forPathFinding) {
    taro.physics.destroyWalls();
    let map = taro.scaleMap(rfdc()(gameMap));
    taro.tiled.loadJson(map, function (layerArray, layersById) {
        taro.physics.staticsFromMap(layersById.walls);
    });
    if (forPathFinding) {
        taro.map.updateWallMapData(); // for A* pathfinding
    }
}
const debounceRecalcPhysics = debounce(recalcWallsPhysics, 0);
class DeveloperMode {
    constructor() {
        if (taro.isClient)
            this.active = false;
    }
    addInitEntities() {
        // add id for actions creating entities in initialize script
        this.initEntities = [];
        Object.values(taro.game.data.scripts).forEach((script) => {
            var _a, _b;
            if (((_b = (_a = script.triggers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.type) === 'gameStart') {
                Object.values(script.actions).forEach((action) => {
                    var _a, _b, _c;
                    if (!action.disabled && ((_a = action.position) === null || _a === void 0 ? void 0 : _a.function) === 'xyCoordinate'
                        && !isNaN((_b = action.position) === null || _b === void 0 ? void 0 : _b.x) && !isNaN((_c = action.position) === null || _c === void 0 ? void 0 : _c.y)
                        && !isNaN(action.width) && !isNaN(action.height) && !isNaN(action.angle)) {
                        if ((action.type === 'createEntityForPlayerAtPositionWithDimensions'
                            || action.type === 'createEntityAtPositionWithDimensions'
                            || action.type === 'createUnitForPlayerAtPosition')
                            && !isNaN(action.width) && !isNaN(action.height) && !isNaN(action.angle)) {
                            if (action.actionId)
                                this.initEntities.push(action);
                        }
                        else if ((action.type === 'createUnitAtPosition'
                            || action.type === 'createProjectileAtPosition')
                            && !isNaN(action.angle)) {
                            if (action.actionId)
                                this.initEntities.push(action);
                        }
                        else if (action.type === 'spawnItem' || action.type === 'createItemWithMaxQuantityAtPosition') {
                            if (action.actionId)
                                this.initEntities.push(action);
                        }
                    }
                });
            }
        });
    }
    requestInitEntities() {
        if (this.initEntities) {
            taro.network.send('updateClientInitEntities', this.initEntities);
        }
    }
    enter() {
        console.log('client enter developer mode');
        this.active = true;
        this.changeTab('play');
    }
    leave() {
        console.log('client leave developer mode');
        this.active = false;
    }
    changeTab(tab) {
        if (tab === 'map') {
            taro.client.emit('enterMapTab');
        }
        else {
            taro.client.emit('leaveMapTab');
        }
        if (tab === 'play') {
            taro.client.emit('lockCamera');
        }
        else if (this.activeTab === 'play') {
            taro.client.emit('unlockCamera');
        }
        this.activeTab = tab;
    }
    shouldPreventKeybindings() {
        return this.activeTab && this.activeTab !== 'play';
    }
    editTile(data, clientId) {
        var _a;
        // only allow developers to modify the tiles
        if (taro.server.developerClientIds.includes(clientId) || clientId === 'server') {
            if (JSON.stringify(data) === '{}') {
                throw 'receive: {}';
            }
            const gameMap = taro.game.data.map;
            const { dataType, dataValue } = Object.entries(data).map(([k, dataValue]) => {
                const dataType = k;
                return { dataType, dataValue };
            })[0];
            const serverData = rfdc()(dataValue);
            if (dataType === 'edit' && !serverData.noMerge) {
                debounceSetWasEdited(gameMap);
                if (data.edit.size !== 'fitContent') {
                    taro.network.send('editTile', data);
                }
                else {
                    debounceEditTileSend(data);
                }
            }
            else {
                gameMap.wasEdited = true;
                taro.network.send('editTile', data);
            }
            if (gameMap.layers.length > 4 && serverData.layer >= 2)
                serverData.layer++;
            const width = gameMap.width;
            switch (dataType) {
                case 'fill': {
                    const nowValue = serverData;
                    const oldTile = gameMap.layers[nowValue.layer].data[nowValue.y * width + nowValue.x];
                    this.floodTiles(nowValue.layer, oldTile, nowValue.gid, nowValue.x, nowValue.y, nowValue.limits);
                    break;
                }
                case 'edit': {
                    //save tile change to taro.game.data.map and taro.map.data
                    const nowValue = serverData;
                    nowValue.selectedTiles.map((v, idx) => {
                        this.putTiles(nowValue.x, nowValue.y, v, nowValue.size, nowValue.shape, nowValue.layer);
                    });
                    break;
                }
                case 'clear': {
                    const nowValue = serverData;
                    this.clearLayer(nowValue.layer);
                }
            }
            if (((_a = gameMap.layers[serverData.layer]) === null || _a === void 0 ? void 0 : _a.name) === 'walls') {
                //if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
                if (serverData.noMerge) {
                    recalcWallsPhysics(gameMap, true);
                }
                else {
                    debounceRecalcPhysics(gameMap, true);
                }
            }
        }
    }
    /**
     * put tiles
     * @param tileX pointerTileX
     * @param tileY pointerTileY
     * @param selectedTiles selectedTiles
     * @param brushSize brush's size
     * @param layer map's layer
     */
    putTiles(tileX, tileY, selectedTiles, brushSize, shape, layer) {
        const map = taro.game.data.map;
        const width = map.width;
        const calcData = this.calcSample(selectedTiles, brushSize, shape);
        const sample = calcData.sample;
        let size = brushSize === 'fitContent' ? { x: calcData.xLength, y: calcData.yLength } : brushSize;
        tileX = brushSize === 'fitContent' ? calcData.minX : tileX;
        tileY = brushSize === 'fitContent' ? calcData.minY : tileY;
        if (map.layers[layer]) {
            for (let x = 0; x < size.x; x++) {
                for (let y = 0; y < size.y; y++) {
                    if (sample[x] && sample[x][y] !== undefined && this.pointerInsideMap(x + tileX, y + tileY, map)) {
                        let index = sample[x][y];
                        if (index === -1)
                            index = 0;
                        map.layers[layer].data[x + tileX + (y + tileY) * width] = index;
                        taro.map.data.layers[layer].data[x + tileX + (y + tileY) * width] = index;
                    }
                }
            }
        }
    }
    pointerInsideMap(pointerX, pointerY, map) {
        return (0 <= pointerX && pointerX < map.width
            && 0 <= pointerY && pointerY < map.height);
    }
    /**
     * calc the sample to print
     * @param selectedTileArea selectedTiles
     * @param size brush's size
     * @returns sample to print
     */
    calcSample(selectedTileArea, size, shape) {
        const xArray = Object.keys(selectedTileArea);
        const yArray = Object.values(selectedTileArea).map((object) => Object.keys(object)).flat().sort((a, b) => parseInt(a) - parseInt(b));
        const minX = parseInt(xArray[0]);
        const minY = parseInt(yArray[0]);
        const maxX = parseInt(xArray[xArray.length - 1]);
        const maxY = parseInt(yArray[yArray.length - 1]);
        // console.log(selectedTileArea, minX, maxX, minY, maxY);
        const xLength = maxX - minX + 1;
        const yLength = maxY - minY + 1;
        if (size === 'fitContent') {
            size = {
                x: xLength,
                y: yLength
            };
        }
        let tempSample = {};
        switch (shape) {
            case 'rectangle': {
                tempSample = TileShape.calcRect(minX, xLength, minY, yLength, selectedTileArea, size);
                break;
            }
            case 'diamond': {
                tempSample = TileShape.calcDiamond(minX, xLength, minY, yLength, selectedTileArea, size);
                break;
            }
            case 'circle': {
                tempSample = TileShape.calcCircle(minX, xLength, minY, yLength, selectedTileArea, size);
                break;
            }
        }
        return { sample: tempSample, xLength, yLength, minX, minY };
    }
    floodTiles(layer, oldTile, newTile, x, y, limits) {
        var _a, _b, _c, _d, _e, _f;
        const map = taro.game.data.map;
        const width = map.width;
        const openQueue = [{ x, y }];
        const closedQueue = {};
        while (openQueue.length !== 0) {
            const nowPos = openQueue[0];
            openQueue.shift();
            if ((_a = closedQueue[nowPos.x]) === null || _a === void 0 ? void 0 : _a[nowPos.y]) {
                continue;
            }
            if (!closedQueue[nowPos.x]) {
                closedQueue[nowPos.x] = {};
            }
            closedQueue[nowPos.x][nowPos.y] = 1;
            if (oldTile === newTile
                || map.layers[layer].data[nowPos.y * width + nowPos.x] !== oldTile
                || ((_b = limits === null || limits === void 0 ? void 0 : limits[nowPos.x]) === null || _b === void 0 ? void 0 : _b[nowPos.y])) {
                continue;
            }
            //save tile change to taro.game.data.map and taro.map.data
            if (newTile === -1) {
                newTile = 0;
            }
            map.layers[layer].data[nowPos.y * width + nowPos.x] = newTile;
            taro.map.data.layers[layer].data[nowPos.y * width + nowPos.x] = newTile;
            if (nowPos.x > 0 && !((_c = closedQueue[nowPos.x - 1]) === null || _c === void 0 ? void 0 : _c[nowPos.y])) {
                openQueue.push({ x: nowPos.x - 1, y: nowPos.y });
            }
            if (nowPos.x < (map.width - 1) && !((_d = closedQueue[nowPos.x + 1]) === null || _d === void 0 ? void 0 : _d[nowPos.y])) {
                openQueue.push({ x: nowPos.x + 1, y: nowPos.y });
            }
            if (nowPos.y > 0 && !((_e = closedQueue[nowPos.x]) === null || _e === void 0 ? void 0 : _e[nowPos.y - 1])) {
                openQueue.push({ x: nowPos.x, y: nowPos.y - 1 });
            }
            if (nowPos.y < (map.height - 1) && !((_f = closedQueue[nowPos.x]) === null || _f === void 0 ? void 0 : _f[nowPos.y + 1])) {
                openQueue.push({ x: nowPos.x, y: nowPos.y + 1 });
            }
        }
    }
    clearLayer(layer) {
        const map = taro.game.data.map;
        const width = map.width;
        for (let i = 0; i < map.width; i++) {
            for (let j = 0; j < map.height; j++) {
                if (map.layers[layer].data[j * width + i] !== 0) {
                    //save tile change to taro.game.map.data
                    map.layers[layer].data[j * width + i] = 0;
                }
            }
        }
    }
    editRegion(data, clientId) {
        // only allow developers to modify regions
        if (taro.server.developerClientIds.includes(clientId)) {
            if (data.name === '' || data.width <= 0 || data.height <= 0) {
                console.log('empty name, negative or 0 size is not allowed');
            }
            else if (data.name === undefined || (data.create && !taro.regionManager.getRegionById(data.name))) { // create new region
                if (!data.name) {
                    // create new region name (smallest available number)
                    let regionNameNumber = 0;
                    let newRegionName = `region${regionNameNumber}`;
                    do {
                        regionNameNumber++;
                        newRegionName = `region${regionNameNumber}`;
                    } while (taro.regionManager.getRegionById(newRegionName));
                    data.name = newRegionName;
                    data.showModal = true;
                }
                data.userId = taro.game.getPlayerByClientId(clientId)._stats.userId;
                // changed to Region from RegionUi
                const regionData = {
                    dataType: 'region',
                    default: {
                        x: data.x,
                        y: data.y,
                        width: data.width,
                        height: data.height,
                        key: data.name,
                        alpha: data.alpha,
                        inside: data.inside
                    },
                    id: data.name,
                    value: {
                        x: data.x,
                        y: data.y,
                        width: data.width,
                        height: data.height,
                        key: data.name,
                        alpha: data.alpha,
                        inside: data.inside
                    }
                };
                const region = new Region(regionData);
                // create new region in game.data
                taro.regionManager.updateRegionToDatabase(regionData);
            }
            else { // modify existing region
                const region = taro.regionManager.getRegionById(data.name);
                if (region) {
                    if (data.delete) {
                        region.destroy();
                    }
                    else {
                        if (data.name !== data.newKey) {
                            if (taro.regionManager.getRegionById(data.newKey)) {
                                console.log('This name is unavailable');
                            }
                            else {
                                region._stats.id = data.newKey;
                            }
                        }
                        let statsData = [
                            { x: data.x !== region._stats.default.x ? data.x : null },
                            { y: data.y !== region._stats.default.y ? data.y : null },
                            { width: data.width !== region._stats.default.width ? data.width : null },
                            { height: data.height !== region._stats.default.height ? data.height : null },
                            { alpha: data.alpha !== region._stats.default.alpha ? data.alpha : null },
                            { inside: data.inside !== region._stats.default.inside ? data.inside : null }
                        ];
                        statsData = statsData.filter(obj => obj[Object.keys(obj)[0]] !== null);
                        if (data.inside === '')
                            statsData.push({ inside: '' });
                        region.streamUpdateData(statsData);
                    }
                }
            }
            // broadcast region change to all clients
            taro.network.send('editRegion', data);
        }
    }
    editVariable(data, clientId) {
        // only allow developers to modify initial entities
        if (taro.server.developerClientIds.includes(clientId)) {
            Object.entries(data).forEach(([key, variable]) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                if (variable.dataType === 'region') {
                    const regionData = { name: key };
                    if (variable.newKey)
                        regionData.newKey = variable.newKey;
                    if (!isNaN((_a = variable.value) === null || _a === void 0 ? void 0 : _a.x))
                        regionData.x = variable.value.x;
                    if (!isNaN((_b = variable.value) === null || _b === void 0 ? void 0 : _b.y))
                        regionData.y = variable.value.y;
                    if (!isNaN((_c = variable.value) === null || _c === void 0 ? void 0 : _c.width))
                        regionData.width = variable.value.width;
                    if (!isNaN((_d = variable.value) === null || _d === void 0 ? void 0 : _d.height))
                        regionData.height = variable.value.height;
                    if (((_e = variable.value) === null || _e === void 0 ? void 0 : _e.inside) || ((_f = variable.value) === null || _f === void 0 ? void 0 : _f.inside) === '')
                        regionData.inside = variable.value.inside;
                    if ((_g = variable.value) === null || _g === void 0 ? void 0 : _g.alpha)
                        regionData.alpha = variable.value.alpha;
                    if ((_h = variable.value) === null || _h === void 0 ? void 0 : _h.create)
                        regionData.create = variable.value.create;
                    if (variable.delete)
                        regionData.delete = variable.delete;
                    this.editRegion(regionData, clientId);
                }
                else {
                    //editing existing variable
                    if (taro.game.data.variables[key]) {
                        //deleting variable
                        if (variable.delete) {
                            delete taro.game.data.variables[key];
                            //renaming variable
                        }
                        else if (variable.newKey) {
                            taro.game.data.variables[variable.newKey] = taro.game.data.variables[key];
                            delete taro.game.data.variables[key];
                            //editing variable
                        }
                        else {
                            taro.game.data.variables[key].value = variable.value;
                        }
                        //creating new variable
                    }
                    else {
                        taro.game.data.variables[key] = {
                            dataType: variable.dataType,
                            value: variable.value
                        };
                    }
                }
            });
            // broadcast region change to all clients
            taro.network.send('editVariable', data);
        }
    }
    editInitEntity(data, clientId) {
        // only allow developers to modify initial entities
        if (taro.server.developerClientIds.includes(clientId)) {
            // broadcast init entity change to all clients
            taro.network.send('editInitEntity', data);
            if (!this.initEntities) {
                this.addInitEntities();
            }
            let found = false;
            this.initEntities.forEach((action) => {
                if (action.actionId === data.actionId) {
                    found = true;
                    if (data.wasEdited)
                        action.wasEdited = true;
                    if (data.position && !isNaN(data.position.x) && !isNaN(data.position.y) &&
                        action.position && !isNaN(action.position.x) && !isNaN(action.position.y)) {
                        action.position = data.position;
                    }
                    if (!isNaN(data.angle) && !isNaN(action.angle)) {
                        action.angle = data.angle;
                    }
                    if (!isNaN(data.width) && !isNaN(action.width)) {
                        action.width = data.width;
                    }
                    if (!isNaN(data.height) && !isNaN(action.height)) {
                        action.height = data.height;
                    }
                    if (data.wasDeleted) {
                        action.wasDeleted = true;
                    }
                }
            });
            if (!found) {
                this.initEntities.push(data);
            }
        }
    }
    editGlobalScripts(data, clientId) {
        // only allow developers to modify global scripts
        if (taro.server.developerClientIds.includes(clientId)) {
            taro.network.send('editGlobalScripts', data);
            taro.script.load(data, true);
            taro.script.scriptCache = {};
        }
    }
    createUnit(data) {
        //const player = taro.game.getPlayerByClientId(clientId);
        let player;
        taro.$$('player').forEach(p => {
            if (p.id() === data.playerId)
                player = p;
        });
        const unitTypeId = data.typeId;
        const unitTypeData = taro.game.cloneAsset('unitTypes', unitTypeId);
        const spawnPosition = data.position;
        const facingAngle = data.angle;
        if (player && spawnPosition && unitTypeId && unitTypeData) {
            const unitData = Object.assign(unitTypeData, {
                type: unitTypeId,
                defaultData: {
                    translate: spawnPosition,
                    rotate: facingAngle
                }
            });
            const unit = player.createUnit(unitData);
            taro.game.lastCreatedUnitId = unit.id();
        }
    }
    updateUnit(data) {
        // 1. broadcast update to all players
        // 2. force update its dimension/scale/layer/image
        if (taro.game.data.unitTypes[data.typeId]) {
            if (data.newData.scripts) {
                taro.game.data.unitTypes[data.typeId].scripts = rfdc()(data.newData.scripts);
            }
            else {
                const oldScripts = rfdc()(taro.game.data.unitTypes[data.typeId].scripts);
                taro.game.data.unitTypes[data.typeId] = rfdc()(data.newData);
                taro.game.data.unitTypes[data.typeId].scripts = oldScripts;
            }
        }
        else {
            taro.game.data.unitTypes[data.typeId] = rfdc()(data.newData);
        }
        taro.$$('unit').forEach(unit => {
            if (unit._stats.type === data.typeId) {
                unit.changeUnitType(data.typeId, {}, false);
                unit.emit('update-texture', 'basic_texture_change');
                if (data.shouldReset)
                    unit.resetUnitType();
            }
        });
        if (taro.isServer) {
            taro.network.send('updateUnit', data);
        }
    }
    resetUnit(data) {
        taro.$$('unit').forEach(unit => {
            if (unit._stats.type === data.typeId) {
                unit.resetUnitType();
            }
        });
    }
    deleteUnit(data) {
        taro.$$('unit').forEach(unit => {
            if (unit._stats.type === data.typeId) {
                unit.destroy();
            }
        });
    }
    createItem(data) {
        const itemTypeId = data.typeId;
        const itemData = taro.game.cloneAsset('itemTypes', itemTypeId);
        const position = data.position;
        const facingAngle = data.angle;
        let quantity = itemData.maxQuantity;
        if (quantity == -1) {
            quantity = null;
        }
        if (itemData) {
            itemData.itemTypeId = itemTypeId;
            itemData.isHidden = false;
            itemData.stateId = 'dropped';
            itemData.spawnPosition = position;
            itemData.quantity = quantity;
            itemData.defaultData = {
                translate: position,
                rotate: facingAngle
            };
            var item = new Item(itemData);
            taro.game.lastCreatedUnitId = item._id;
            item.script.trigger('entityCreated');
        }
    }
    updateItem(data) {
        // 1. broadcast update to all players
        // 2. force update its dimension/scale/layer/image
        // 3. we may need to re-mount the item on unit
        if (taro.game.data.itemTypes[data.typeId]) {
            if (data.newData.scripts) {
                taro.game.data.itemTypes[data.typeId].scripts = rfdc()(data.newData.scripts);
            }
            else {
                const oldScripts = rfdc()(taro.game.data.itemTypes[data.typeId].scripts);
                taro.game.data.itemTypes[data.typeId] = rfdc()(data.newData);
                taro.game.data.itemTypes[data.typeId].scripts = oldScripts;
            }
        }
        else {
            taro.game.data.itemTypes[data.typeId] = rfdc()(data.newData);
        }
        taro.$$('item').forEach(item => {
            if (item._stats.itemTypeId === data.typeId) {
                item.changeItemType(data.typeId, {}, false);
                item.emit('update-texture', 'basic_texture_change');
                if (data.shouldReset)
                    item.resetItemType();
            }
        });
        if (taro.isServer) {
            taro.network.send('updateItem', data);
        }
    }
    resetItem(data) {
        taro.$$('item').forEach(item => {
            if (item._stats.itemTypeId === data.typeId) {
                item.resetItemType();
            }
        });
    }
    deleteItem(data) {
        taro.$$('item').forEach(item => {
            if (item._stats.type === data.typeId) {
                item.destroy();
            }
        });
    }
    createProjectile(data) {
    }
    updateProjectile(data) {
        // 1. broadcast update to all players
        // 2. force update its dimension/scale/layer/image
        if (taro.game.data.projectileTypes[data.typeId]) {
            if (data.newData.scripts) {
                taro.game.data.projectileTypes[data.typeId].scripts = rfdc()(data.newData.scripts);
            }
            else {
                const oldScripts = rfdc()(taro.game.data.projectileTypes[data.typeId].scripts);
                taro.game.data.projectileTypes[data.typeId] = rfdc()(data.newData);
                taro.game.data.projectileTypes[data.typeId].scripts = oldScripts;
            }
        }
        else {
            taro.game.data.projectileTypes[data.typeId] = rfdc()(data.newData);
        }
        taro.$$('projectile').forEach(projectile => {
            if (projectile._stats.type === data.typeId) {
                projectile.changeProjectileType(data.typeId, {}, false);
                projectile.emit('update-texture', 'basic_texture_change');
                if (data.shouldReset)
                    projectile.resetProjectileType();
            }
        });
        if (taro.isServer) {
            taro.network.send('updateProjectile', data);
        }
    }
    resetProjectile(data) {
        taro.$$('projectile').forEach(projectile => {
            if (projectile._stats.type === data.typeId) {
                projectile.resetProjectileType();
            }
        });
    }
    deleteProjectile(data) {
        taro.$$('projectile').forEach(projectile => {
            if (projectile._stats.type === data.typeId) {
                projectile.destroy();
            }
        });
    }
    updateShop(data) {
        if (data.typeId && data.newData) {
            if (!taro.game.data.shops) {
                taro.game.data.shops = {};
            }
            taro.game.data.shops[data.typeId] = data.newData;
        }
        if (taro.isServer) {
            taro.network.send('updateShop', data);
        }
    }
    editEntity(data, clientId) {
        if (taro.isClient) {
            taro.network.send('editEntity', data);
        }
        else {
            // only allow developers to modify entities
            if (taro.server.developerClientIds.includes(clientId)) {
                if (data.entityType === 'unit') {
                    switch (data.action) {
                        case 'create':
                            //this.createUnit(data);
                            break;
                        case 'update':
                            this.updateUnit(data);
                            break;
                        case 'reset':
                            this.resetUnit(data);
                            break;
                        case 'delete':
                            //this.deleteUnit(data);
                            break;
                    }
                }
                else if (data.entityType === 'item') {
                    switch (data.action) {
                        case 'create':
                            //this.createItem(data);
                            break;
                        case 'update':
                            this.updateItem(data);
                            break;
                        case 'reset':
                            this.resetItem(data);
                            break;
                        case 'delete':
                            //this.deleteItem(data);
                            break;
                    }
                }
                else if (data.entityType === 'projectile') {
                    switch (data.action) {
                        case 'create':
                            //this.createProjectile(data);
                            break;
                        case 'update':
                            this.updateProjectile(data);
                            break;
                        case 'reset':
                            this.resetProjectile(data);
                            break;
                        case 'delete':
                            //this.deleteProjectile(data);
                            break;
                    }
                }
                else if (data.entityType === 'shop') {
                    switch (data.action) {
                        case 'update':
                            this.updateShop(data);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }
    updateClientMap(data) {
        // console.log('map data was edited', data.mapData.wasEdited);
        if (data.mapData.wasEdited) {
            data.mapData.wasEdited = false;
            data.mapData.haveUnsavedChanges = true;
            taro.game.data.map = data.mapData;
            if (taro.physics) {
                //if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
                taro.physics.destroyWalls();
                let map = taro.scaleMap(rfdc()(taro.game.data.map));
                taro.tiled.loadJson(map, function (layerArray, TaroLayersById) {
                    taro.physics.staticsFromMap(TaroLayersById.walls);
                });
            }
            taro.client.emit('updateMap');
        }
    }
    updateClientInitEntities(initEntities) {
        this.initEntities = initEntities;
        taro.client.emit('updateInitEntities');
    }
}
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = DeveloperMode;
}
//# sourceMappingURL=DeveloperMode.js.map