class DeveloperMode {
	active: boolean;
	activeTab: devModeTab;

	constructor() {
		if (ige.isClient) this.active = false;
		console.log('create deve mode', this)
	}

	enter(): void {
		console.log('client enter developer mode');
		this.active = true;
		this.changeTab('map');
		//ige.client.emit('enterDevMode');
	}

	leave (): void {
		console.log('client leave developer mode');
		this.active = false;
		ige.client.emit('leaveDevMode');
	}

	changeTab(tab: devModeTab) {
		this.activeTab = tab;
		if (tab === 'map') {
			ige.client.emit('enterMapTab');
		} else {
			ige.client.emit('leaveMapTab');
		}
	}

	shouldPreventKeybindings (): boolean {
		return this.activeTab !== 'play';
	}

	editTile (data: TileData, clientId: string): void {
		// only allow developers to modify the tiles
		if (ige.server.developerClientIds.includes(clientId)) {
			ige.game.data.map.wasEdited = true;
			ige.network.send("editTile", data);

			const serverData = _.clone(data);
			const width = ige.game.data.map.width;
			if (ige.game.data.map.layers.length > 4 && serverData.layer >= 2) serverData.layer ++;
			//save tile change to ige.game.map.data
			ige.game.data.map.layers[serverData.layer].data[serverData.y * width + serverData.x] = serverData.gid;
			if (ige.game.data.map.layers[serverData.layer].name === 'walls') {
				//if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
				ige.physics.destroyWalls();
				let map = ige.scaleMap(_.cloneDeep(ige.game.data.map));
				ige.tiled.loadJson(map, function (layerArray, layersById) {
					ige.physics.staticsFromMap(layersById.walls);
				})
			}
		}
	}

	editRegion (data: RegionData, clientId: string): void {
		// only allow developers to modify regions
		if (ige.server.developerClientIds.includes(clientId)) {  
			if (data.name === '' || data.width <= 0 || data.height <= 0) {
				console.log ('empty name, negative or 0 size is not allowed');
			} else if (data.name === undefined) { // create new region
				// create new region name (smallest available number)
				let regionNameNumber = 0;
				let newRegionName = 'region' + regionNameNumber
				do {
					regionNameNumber ++;
					newRegionName = 'region' + regionNameNumber;
				} while (ige.regionManager.getRegionById(newRegionName));

				data.name = newRegionName;
				data.showModal = true;
				data.userId = ige.game.getPlayerByClientId(clientId)._stats.userId;
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
				}
				const region = new Region(regionData);

				// create new region in game.data
				ige.regionManager.updateRegionToDatabase(regionData);

			} else { // modify existing region
				const region = ige.regionManager.getRegionById(data.name);
				if (region) {
					if (data.delete) {
						region.destroy();
					} else {
						if (data.name !== data.newName) {
							if (ige.regionManager.getRegionById(data.newName)) {
								console.log('This name is unavailable');
							} 
							else {
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
			ige.network.send("editRegion", data);
		}
	}
 
	updateClientMap (data: { mapData: MapData }): void {
		console.log ('map data was edited', data.mapData.wasEdited)
		if (data.mapData.wasEdited) {
			data.mapData.wasEdited = false;
			ige.game.data.map = data.mapData;
			if (ige.physics) {
				//if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
				ige.physics.destroyWalls();
				let map = ige.scaleMap(_.cloneDeep(ige.game.data.map));
				ige.tiled.loadJson(map, function (layerArray, IgeLayersById) {
					ige.physics.staticsFromMap(IgeLayersById.walls);
				})
			}
			ige.client.emit('updateMap');
		}
	}
}

interface TileData {
	gid: number,
	layer: number,
	x: number,
	y: number
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

type devModeTab = 'play' | 'map' | 'entities' | 'moderate' | 'debug';

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = DeveloperMode;
}
