class ThreeSprite extends THREE.Group {
	sprite: THREE.Mesh;

	private layer = 3; // Create enum
	private depth = 1;

	constructor(tex: THREE.Texture) {
		super();

		const geometry = new THREE.PlaneGeometry(1, 1);
		geometry.rotateX(-Math.PI / 2);
		const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
		this.sprite = new THREE.Mesh(geometry, material);
		this.add(this.sprite);
	}

	setScale(sx: number, sy: number) {
		this.sprite.scale.set(sx, 1, sy);
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

	private calcRenderOrder() {
		this.sprite.renderOrder = this.layer * 100 + this.depth;
	}
}
