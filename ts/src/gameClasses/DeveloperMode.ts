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
}
