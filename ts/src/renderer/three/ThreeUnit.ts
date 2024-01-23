class ThreeUnit extends Entity {
	// Why does every unit have a label?
	private label = new Label();
	private attributeBar = new ThreeAttributeBar();

	constructor(tex: THREE.Texture) {
		super(tex);

		this.label.setOffset(new THREE.Vector2(0, 0.75 * 64), new THREE.Vector2(0.5, 0));
		this.add(this.label);

		this.attributeBar.setOffset(new THREE.Vector2(0, -0.75 * 64), new THREE.Vector2(0.5, 1));
		this.add(this.attributeBar);
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
