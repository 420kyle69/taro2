class DeveloperMode {
	active: boolean;

	constructor() {
		this.active = false;
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
