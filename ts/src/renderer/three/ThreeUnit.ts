class ThreeUnit extends Entity {
	// Why does every unit have a label?
	private label = new Label();

	constructor(tex: THREE.Texture) {
		super(tex);

		this.label.setScale(0.5);
		this.label.setOffset(new THREE.Vector3(0, this.mesh.scale.y / 2, 0));
		this.add(this.label);
	}

	updateLabel(data: { text?: string; bold?: boolean; color?: string }) {
		this.label.update(data.text, data.color, data.bold);
	}

	showLabel() {
		this.label.visible = true;
	}

	hideLabel() {
		this.label.visible = false;
	}
}
