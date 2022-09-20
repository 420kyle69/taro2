class DeveloperMode {
	active: boolean;
	changedTiles: {gid: number, x: number, y: number}[];

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
}
