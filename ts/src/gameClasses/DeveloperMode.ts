class DeveloperMode {
	active: boolean;
	changedTiles: {gid: number, layer: number, x: number, y: number}[];

	constructor() {
		this.active = false;
		this.changedTiles = [];
	}

	enter() {
		console.log('enter developer mode');
		this.active = true;
		ige.client.emit('enterDevMode');
	}

	leave () {
		console.log('leave developer mode');
		this.active = false;
		ige.client.emit('leaveDevMode');
	}

	/*saveTileChange (data) {
		//ige.developerMode.changedTiles.push(data);
		const width = ige.game.data.map.width;
		if (data.layer >=2) data.layer ++;
		console.log('saving edited tile', data, data.y*width + data.x);
		//save tile change to ige.game.map.data
		ige.game.data.map.layers[data.layer].data[data.y*width + data.x] = data.gid;
		console.log(ige.game.data.map);
	}*/

	updateClientMap (data) {
		if (data.mapData.wasEdited) {
			console.log('updated data', data)
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
