class ThreeCamera {
	instance: THREE.Camera;
	topDown = true;

	private controls: OrbitControls;

	constructor(
		private viewportWidth: number,
		private viewportHeight: number,
		canvas: HTMLCanvasElement
	) {
		const width = viewportWidth;
		const height = viewportHeight;

		const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
		// const persCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		// persCamera.position.y = 20;
		camera.position.y = 20;
		this.instance = camera;

		this.controls = new OrbitControls(camera, canvas);
		this.controls.enableDamping = true;
		this.controls.enableRotate = false;

		window.addEventListener('keypress', (evt) => {
			if (evt.key === 'c') {
				this.topDown = !this.topDown;

				if (this.topDown) {
					this.controls.enableRotate = false;
				} else {
					this.controls.enableRotate = true;
				}
			}
		});
	}

	update() {
		if (this.controls.enableDamping) {
			this.controls.update();
		}
	}

	resize() {
		if (this.instance instanceof THREE.PerspectiveCamera) {
			this.instance.aspect = this.viewportWidth / this.viewportHeight;
			this.instance.updateProjectionMatrix();
		} else if (this.instance instanceof THREE.OrthographicCamera) {
			this.instance.left = this.viewportWidth / -2;
			this.instance.right = this.viewportWidth / 2;
			this.instance.top = this.viewportHeight / 2;
			this.instance.bottom = this.viewportHeight / -2;
			this.instance.updateProjectionMatrix();
		}
	}

	setPosition2D(x: number, z: number) {
		if (this.topDown) {
			this.instance.position.set(x, this.instance.position.y, z);
			this.controls.target.set(x, this.controls.target.y, z);
		}
	}
}
