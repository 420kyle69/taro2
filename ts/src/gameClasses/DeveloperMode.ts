class DeveloperMode {
	active: boolean;
	activeTab: devModeTab;

	constructor() {
		if (taro.isClient) this.active = false;
	}

	enter(): void {
		console.log('client enter developer mode');
		this.active = true;
		this.changeTab('play');
	}

	leave (): void {
		console.log('client leave developer mode');
		this.active = false;
	}

	changeTab(tab: devModeTab) {
		if (tab === 'map') {
			taro.client.emit('enterMapTab');
		} else {
			taro.client.emit('leaveMapTab');
		}
		if (tab === 'play') {
			taro.client.emit('lockCamera');
		} else if (this.activeTab === 'play') {
			taro.client.emit('unlockCamera');
		}
		this.activeTab = tab;
	}

	shouldPreventKeybindings (): boolean {
		return this.activeTab && this.activeTab !== 'play';
	}

	editTile (data: TileData, clientId: string): void {
		// only allow developers to modify the tiles
		if (taro.server.developerClientIds.includes(clientId)) {
			const gameMap = taro.game.data.map;
			gameMap.wasEdited = true;
			taro.network.send('editTile', data);
			const serverData = _.clone(data);
			if (gameMap.layers.length > 4 && serverData.layer >= 2) serverData.layer ++;
			const width = gameMap.width;
			if (data.tool === 'flood') {
				this.floodTiles(
					serverData.layer, 
					gameMap.layers[serverData.layer].data[serverData.y * width + serverData.x],
					serverData.gid,
					serverData.x,
					serverData.y
					);
			} else if (data.tool === 'clear') {
				this.clearLayer(serverData.layer);
			}
			else {
				//save tile change to taro.game.data.map and taro.map.data
				gameMap.layers[serverData.layer].data[serverData.y * width + serverData.x] = serverData.gid;
				taro.map.data.layers[serverData.layer].data[serverData.y * width + serverData.x] = serverData.gid;
			}
			if (gameMap.layers[serverData.layer].name === 'walls') {
				//if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
				taro.physics.destroyWalls();
				let map = taro.scaleMap(_.cloneDeep(gameMap));
				taro.tiled.loadJson(map, function (layerArray, layersById) {
					taro.physics.staticsFromMap(layersById.walls);
				});
			}
		}
	}

	floodTiles (layer: number, oldTile: number, newTile: number, x: number, y: number): void {
		const map = taro.game.data.map;
		const width = map.width;
        if (oldTile === newTile || map.layers[layer].data[y * width + x] !== oldTile) {
            return;
        }
		//save tile change to taro.game.data.map and taro.map.data
		map.layers[layer].data[y * width + x] = newTile;
		taro.map.data.layers[layer].data[y * width + x] = newTile;
			
        if (x > 0) {
            this.floodTiles(layer, oldTile, newTile, x - 1, y);
        }
        if (x < (map.width - 1)) {
            this.floodTiles(layer, oldTile, newTile, x + 1, y);
        }
        if (y > 0) {
            this.floodTiles(layer, oldTile, newTile, x, y - 1);
        }
        if (y < (map.height - 1)) {
            this.floodTiles(layer, oldTile, newTile, x, y + 1);
        }
	}

	clearLayer (layer: number): void {
		const map = taro.game.data.map;
		const width = map.width;
		for (let i = 0; i < map.width; i++) {
			for (let j = 0; j < map.height; j++) {
				if (map.layers[layer].data[j * width + i] !== 0) {
					//save tile change to taro.game.map.data
					map.layers[layer].data[j*width + i] = 0;
				}
			}
		}
	 }

	editRegion (data: RegionData, clientId: string): void {
		// only allow developers to modify regions
		if (taro.server.developerClientIds.includes(clientId)) {
			if (data.name === '' || data.width <= 0 || data.height <= 0) {
				console.log ('empty name, negative or 0 size is not allowed');
			} else if (data.name === undefined) { // create new region
				// create new region name (smallest available number)
				let regionNameNumber = 0;
				let newRegionName = `region${  regionNameNumber}`;
				do {
					regionNameNumber ++;
					newRegionName = `region${  regionNameNumber}`;
				} while (taro.regionManager.getRegionById(newRegionName));

				data.name = newRegionName;
				data.showModal = true;
				data.userId = taro.game.getPlayerByClientId(clientId)._stats.userId;
				// changed to Region from RegionUi
				const regionData = {
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
				const region = new Region(regionData);

				// create new region in game.data
				taro.regionManager.updateRegionToDatabase(regionData);

			} else { // modify existing region
				const region = taro.regionManager.getRegionById(data.name);
				if (region) {
					if (data.delete) {
						region.destroy();
					} else {
						if (data.name !== data.newName) {
							if (taro.regionManager.getRegionById(data.newName)) {
								console.log('This name is unavailable');
							} else {
								region._stats.id = data.newName;
							}
						}
						let statsData = [
							{ x: data.x !== region._stats.default.x ? data.x : null },
							{ y: data.y !== region._stats.default.y ? data.y : null },
							{ width: data.width !== region._stats.default.width ? data.width : null },
							{ height: data.height !== region._stats.default.height ? data.height : null }
						];
						statsData = statsData.filter(obj => obj[Object.keys(obj)[0]] !== null);
						region.streamUpdateData(statsData);
					}
				}
			}
			// broadcast region change to all clients
			taro.network.send('editRegion', data);
		}
	}

    editInitEntity (data, clientId: string): void {
        // only allow developers to modify initial entities
		if (taro.server.developerClientIds.includes(clientId)) {
            console.log('editInitEntity', data);
            // broadcast region change to all clients
			taro.network.send('editInitEntity', data);
        }
    }

	createUnit(data) {
		//const player = taro.game.getPlayerByClientId(clientId);
		let player;
		taro.$$('player').forEach(p => {
			if (p.id() === data.playerId) player = p;
		});
		const unitTypeId = data.typeId;
		const unitTypeData = taro.game.getAsset('unitTypes', unitTypeId);
		const spawnPosition = data.position;
		const facingAngle = data.angle;

		if (player && spawnPosition && unitTypeId && unitTypeData) {
			const unitData = Object.assign(
				unitTypeData,
				{
					type: unitTypeId,
					defaultData: {
						translate: spawnPosition,
						rotate: facingAngle
					}
				}
			);
			const unit = player.createUnit(unitData);
			taro.game.lastCreatedUnitId = unit.id();
		}
	}

	updateUnit(data) {
		// 1. broadcast update to all players
		// 2. force update its dimension/scale/layer/image
		taro.game.data.unitTypes[data.typeId] = data.newData;
		taro.$$('unit').forEach(unit => {
			if (unit._stats.type === data.typeId) {
				for (let i = 0; i < unit._stats.itemIds.length; i++) {
					var itemId = unit._stats.itemIds[i];
					var item = taro.$(itemId);
						if (item) {
							item.remove();
						}
					}
				unit.changeUnitType(data.typeId, {}, false);
				unit.emit('update-texture', 'basic_texture_change');
			}
		});
		if (taro.isServer) {
			taro.network.send('updateUnit', data);
		}
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
		const itemData = taro.game.getAsset('itemTypes', itemTypeId);
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
			item.script.trigger("entityCreated");
		}
	}

	updateItem(data) {
		// 1. broadcast update to all players
		// 2. force update its dimension/scale/layer/image
		// 3. we may need to re-mount the item on unit
		taro.game.data.itemTypes[data.typeId] = data.newData;
		taro.$$('item').forEach(item => {
			if (item._stats.itemTypeId === data.typeId) {
				item.changeItemType(data.typeId, {}, false);
				item.emit('update-texture', 'basic_texture_change');
			}
		});
		if (taro.isServer) {
			taro.network.send('updateItem', data);
		}
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
		taro.game.data.projectileTypes[data.typeId] = data.newData;
		taro.$$('projectile').forEach(projectile => {
			if (projectile._stats.type === data.typeId) {
				projectile.changeProjectileType(data.typeId, {}, false);
				projectile.emit('update-texture', 'basic_texture_change');
			}
		});
		if (taro.isServer) {
			taro.network.send('updateProjectile', data);
		}
	}

	deleteProjectile(data) {
		taro.$$('projectile').forEach(projectile => {
			if (projectile._stats.type === data.typeId) {
				projectile.destroy();
			}
		});
	}


	editEntity (data: EditEntityData, clientId: string) {
		if (taro.isClient) {
			taro.network.send('editEntity', data);
		} else {
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
					
						case 'delete':
							//this.deleteUnit(data);
							break;
					}
				} else if (data.entityType === 'item') {
					switch (data.action) {
						case 'create':
							//this.createItem(data);
							break;
					
						case 'update':
							this.updateItem(data);
							break;
					
						case 'delete':
							//this.deleteItem(data);
							break;
					}
				} else if (data.entityType === 'projectile') {
					switch (data.action) {
						case 'create':
							//this.createProjectile(data);
							break;
					
						case 'update':
							this.updateProjectile(data);
							break;
					
						case 'delete':
							//this.deleteProjectile(data);
							break;
					}
				}
			}
		}
	}
 
	updateClientMap (data: { mapData: MapData }): void {
		//console.log ('map data was edited', data.mapData.wasEdited);
		if (data.mapData.wasEdited) {
			data.mapData.wasEdited = false;
			data.mapData.haveUnsavedChanges = true;
			taro.game.data.map = data.mapData;
			if (taro.physics) {
				//if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
				taro.physics.destroyWalls();
				let map = taro.scaleMap(_.cloneDeep(taro.game.data.map));
				taro.tiled.loadJson(map, function (layerArray, TaroLayersById) {
					taro.physics.staticsFromMap(TaroLayersById.walls);
				});
			}
			taro.client.emit('updateMap');
		}
	}
}

interface TileData {
	gid: number,
	layer: number,
	x: number,
	y: number,
	tool?: string
}

interface RegionData {
	userId?: string,
	name: string,
	newName?: string,
	x?: number,
	y?: number,
	width?: number,
	height?: number,
	delete?: boolean,
	showModal?: boolean
}

interface EditEntityData {
	entityType: string, 
	typeId: string,
	action: string,
	newData?: any, //EntityStats,
	playerId?: string, 
	position?: {x: number, y: number}, 
	angle?: number,
}

type devModeTab = 'play' | 'map' | 'entities' | 'moderate' | 'debug';

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = DeveloperMode;
}
