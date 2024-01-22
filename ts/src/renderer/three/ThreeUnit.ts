class ThreeUnit extends Entity {
	// Why does every unit have a label?
	private label = new Label();

	constructor(tex: THREE.Texture) {
		super(tex);

		this.add(this.label);
	}
}
