class ThreeUnit extends Entity {
	// Why does every unit have a label?
	private label = new Label();
	private attributeBars = new THREE.Group();

	constructor(tex: THREE.Texture) {
		super(tex);

		this.label.setOffset(new THREE.Vector2(0, 0.75 * 64), new THREE.Vector2(0.5, 0));
		this.add(this.label);

		this.add(this.attributeBars);
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

	renderAttributes(data) {
		this.attributeBars.remove(...this.attributeBars.children);

		data.attrs.forEach((attributeData) => {
			const bar = new ThreeAttributeBar();
			bar.update(attributeData);
			const yOffset = (attributeData.index - 1) * bar.height * 1.1;
			bar.setOffset(new THREE.Vector2(0, -0.75 * 64 - yOffset), new THREE.Vector2(0.5, 1));
			this.attributeBars.add(bar);
		});
	}
}
