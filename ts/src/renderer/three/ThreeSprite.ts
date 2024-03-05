class ThreeSprite extends THREE.Group {
	sprite: THREE.Mesh;
	billboard = false;
	scaleUnflipped = new THREE.Vector2();

	private layer = 3;
	private depth = 1;

	private flipX = 1;
	private flipY = 1;

	constructor(tex: THREE.Texture) {
		super();

		const geometry = new THREE.PlaneGeometry(1, 1);
		geometry.rotateX(-Math.PI / 2);
		const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
		this.sprite = new THREE.Mesh(geometry, material);
		this.add(this.sprite);

		// Too much coupling?
		const renderer = ThreeRenderer.getInstance();
		renderer.camera.onChange(() => {
			if (this.billboard) {
				this.rotation.setFromRotationMatrix(renderer.camera.instance.matrix);
				this.rotateX(Math.PI * 0.5);
			}
		});
	}

	setBillboard(billboard: boolean, camera: ThreeCamera) {
		this.billboard = billboard;

		if (this.billboard) {
			this.rotation.setFromRotationMatrix(camera.instance.matrix);
			this.rotateX(Math.PI * 0.5);
		}
	}

	setScale(sx: number, sy: number) {
		this.scaleUnflipped.set(sx, sy);
		this.sprite.scale.set(this.scaleUnflipped.x * this.flipX, 1, this.scaleUnflipped.y * this.flipY);
	}

	setRotationY(rad: number) {
		this.sprite.rotation.y = rad;
	}

	setLayer(layer: number) {
		this.layer = layer;
		this.calcRenderOrder();
	}

	setDepth(depth: number) {
		this.depth = depth;
		this.calcRenderOrder();
	}

	setTexture(tex: THREE.Texture) {
		(this.sprite.material as THREE.MeshBasicMaterial).map = tex;
	}

	setFlip(x: boolean, y: boolean) {
		this.flipX = x ? -1 : 1;
		this.flipY = y ? -1 : 1;
		this.setScale(this.scaleUnflipped.x, this.scaleUnflipped.y);
	}

	private calcRenderOrder() {
		this.sprite.renderOrder = this.layer * 100 + this.depth;
	}
}
