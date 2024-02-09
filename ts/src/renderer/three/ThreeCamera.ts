class ThreeCamera {
	instance: THREE.Camera;
	target: THREE.Object3D | null = null;
	zoomLevel = 1;

	private orthographicCamera: THREE.OrthographicCamera;
	private perspectiveCamera: THREE.PerspectiveCamera;
	private controls: OrbitControls;

	private orthographicState: { target: THREE.Vector3; position: THREE.Vector3 };
	private perspectiveState: { target: THREE.Vector3; position: THREE.Vector3; zoom: number };

	private isPerspective = false;
	private fovInitial: number;
	private viewportHeightInitial: number;

	constructor(viewportWidth: number, viewportHeight: number, canvas: HTMLCanvasElement) {
		const persCamera = new THREE.PerspectiveCamera(75, viewportWidth / viewportHeight, 0.1, 1000);
		persCamera.position.y = 20;
		this.perspectiveCamera = persCamera;
		this.fovInitial = Math.tan(((Math.PI / 180) * this.perspectiveCamera.fov) / 2);
		this.viewportHeightInitial = viewportHeight;

		const halfWidth = Utils.pixelToWorld(viewportWidth / 2);
		const halfHeight = Utils.pixelToWorld(viewportHeight / 2);
		const orthoCamera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 0.1, 1000);
		orthoCamera.position.y = 20;
		this.orthographicCamera = orthoCamera;

		this.instance = orthoCamera;

		this.controls = new OrbitControls(this.instance, canvas);
		this.controls.enableRotate = false;
		this.controls.enableZoom = false;
		this.controls.mouseButtons = { LEFT: '', MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
		this.controls.update();

		this.orthographicState = {
			target: new THREE.Vector3(),
			position: new THREE.Vector3(),
		};
		this.perspectiveState = {
			target: new THREE.Vector3(),
			position: new THREE.Vector3(),
			zoom: this.controls.zoom,
		};

		window.addEventListener('keypress', (evt) => {
			if (evt.key === '.') {
				this.isPerspective = !this.isPerspective;

				if (this.isPerspective) {
					this.switchToPerspectiveCamera();
				} else {
					this.switchToOrthographicCamera();
				}
			} else if (evt.key === '/') {
				this.controls.enableRotate = !this.controls.enableRotate;
				this.controls.enableZoom = !this.controls.enableZoom;
			}
		});
	}

	update() {
		if (this.controls.enableRotate) {
			this.controls.update();
		}

		if (this.target) {
			const targetWorldPos = new THREE.Vector3();
			this.target.getWorldPosition(targetWorldPos);
			this.setPosition(targetWorldPos);
		}
	}

	resize(width: number, height: number) {
		if (this.instance instanceof THREE.PerspectiveCamera) {
			this.instance.aspect = width / height;
			this.instance.fov = (360 / Math.PI) * Math.atan(this.fovInitial * (height / this.viewportHeightInitial));
			this.instance.updateProjectionMatrix();
		} else if (this.instance instanceof THREE.OrthographicCamera) {
			const halfWidth = Utils.pixelToWorld(width / 2);
			const halfHeight = Utils.pixelToWorld(height / 2);
			this.instance.left = -halfWidth;
			this.instance.right = halfWidth;
			this.instance.top = halfHeight;
			this.instance.bottom = -halfHeight;
			this.instance.zoom = 20;
			this.instance.updateProjectionMatrix();
		}
	}

	zoom(ratio: number) {
		this.zoomLevel = ratio;

		if (this.instance instanceof THREE.PerspectiveCamera) {
			//
		} else if (this.instance instanceof THREE.OrthographicCamera) {
			this.instance.zoom = ratio;
			this.instance.updateProjectionMatrix();
		}
	}

	startFollow(target: THREE.Object3D) {
		this.target = target;
	}

	stopFollow() {
		this.target = null;
	}

	getWorldPoint(p: THREE.Vector2) {
		let target = this.controls.target;
		if (this.target) {
			const targetWorldPos = new THREE.Vector3();
			this.target.getWorldPosition(targetWorldPos);
			target = targetWorldPos;
		}

		// Mouse to world pos code from:
		// https://github.com/WestLangley/three.js/blob/e3cd05d80baf7b1594352a1d7e464c6d188b0080/examples/jsm/controls/OrbitControls.js
		if (this.isPerspective) {
			const pointer = new THREE.Vector3(p.x, p.y, 0.5);
			pointer.unproject(this.instance);
			pointer.sub(this.instance.position).normalize();
			const dist =
				target.clone().sub(this.perspectiveCamera.position).dot(this.perspectiveCamera.up) /
				pointer.dot(this.perspectiveCamera.up);
			return this.instance.position.clone().add(pointer.multiplyScalar(dist));
		} else {
			const pointer = new THREE.Vector3(
				p.x,
				p.y,
				(this.orthographicCamera.near + this.orthographicCamera.far) /
					(this.orthographicCamera.near - this.orthographicCamera.far)
			);
			pointer.unproject(this.orthographicCamera);
			pointer.y -= target.y;
			const v = new THREE.Vector3(0, 0, -1).applyQuaternion(this.orthographicCamera.quaternion);
			const dist = -pointer.dot(this.orthographicCamera.up) / v.dot(this.orthographicCamera.up);
			const result = pointer.clone().add(v.multiplyScalar(dist));
			return result;
		}
	}

	setPosition(target: THREE.Vector3) {
		const oldTarget = this.controls.target.clone();
		const diff = target.clone().sub(oldTarget);
		const t = (taro?.game?.data?.settings?.camera?.trackingDelay || 3) / taro.fps();
		this.controls.target.lerp(this.controls.target.clone().add(diff), t);
		this.orthographicCamera.position.lerp(this.orthographicCamera.position.clone().add(diff), t);
		this.perspectiveCamera.position.lerp(this.perspectiveCamera.position.clone().add(diff), t);
	}

	private switchToOrthographicCamera() {
		this.perspectiveState.target.copy(this.controls.target);
		this.perspectiveState.position.copy(this.controls.object.position);
		this.perspectiveState.zoom = this.controls.object.zoom;

		const distance = this.perspectiveCamera.position.distanceTo(this.controls.target);
		const halfWidth = frustumWidthAtDistance(this.perspectiveCamera, distance) / 2;
		const halfHeight = frustumHeightAtDistance(this.perspectiveCamera, distance) / 2;
		this.orthographicCamera.top = halfHeight;
		this.orthographicCamera.bottom = -halfHeight;
		this.orthographicCamera.left = -halfWidth;
		this.orthographicCamera.right = halfWidth;
		this.orthographicCamera.zoom = 1; // don't touch. makes sure camera seamless transition between pers/ortho when zoomed.
		this.orthographicCamera.lookAt(this.controls.target);
		this.orthographicCamera.updateProjectionMatrix();
		this.instance = this.orthographicCamera;
		this.controls.object = this.orthographicCamera;
		this.instance.lookAt(this.controls.target);

		if (this.orthographicState.target && this.orthographicState.position) {
			this.controls.target.copy(this.orthographicState.target);
			this.controls.object.position.copy(this.orthographicState.position).divideScalar(this.orthographicCamera.zoom);
			this.controls.update();
		}
	}

	private switchToPerspectiveCamera() {
		this.orthographicState.target.copy(this.controls.target);
		this.orthographicState.position.copy(this.controls.object.position);

		this.perspectiveCamera.updateProjectionMatrix();
		this.instance = this.perspectiveCamera;
		this.controls.object = this.perspectiveCamera;
		this.instance.lookAt(this.controls.target);

		if (this.perspectiveState.target && this.perspectiveState.position && this.perspectiveState.zoom) {
			this.controls.target.copy(this.perspectiveState.target);
			this.controls.object.position.copy(this.perspectiveState.position).divideScalar(this.orthographicCamera.zoom);
			this.controls.object.zoom = this.perspectiveState.zoom;
			this.controls.update();
		}
	}
}

function frustumHeightAtDistance(camera: THREE.PerspectiveCamera, distance: number) {
	// Fov formula: http://www.artdecocameras.com/resources/angle-of-view/
	const angle = (camera.fov * Math.PI) / 180; // camera.fov is vertical fov.
	return Math.tan(angle / 2) * distance * 2;
}

function frustumWidthAtDistance(camera: THREE.PerspectiveCamera, distance: number) {
	return frustumHeightAtDistance(camera, distance) * camera.aspect;
}
