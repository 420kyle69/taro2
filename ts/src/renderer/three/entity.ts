class Entity extends THREE.Group {
	private mesh: THREE.Mesh;

	constructor(tex: THREE.Texture) {
		super();

		this.scale.set(tex.image.width / 64, 1, tex.image.height / 64);

		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
		this.mesh = new THREE.Mesh(geometry, material);
		this.add(this.mesh);
	}
}
