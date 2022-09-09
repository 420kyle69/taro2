class DeveloperMode {
	active: boolean;

	constructor() {
		this.active = false;
	}

	enter() {
		console.log('enter developer mode');
		this.active = true;
		//ige.renderer.scene.scenes[0].marker.setVisible(true);
	}

	leave () {
		console.log('leave developer mode');
		this.active = false;
		//ige.renderer.scene.scenes[0].marker.setVisible(false);
	}
}
