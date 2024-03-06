class ThreeFloatingText {
	node = new THREE.Object3D();
	label: ThreeLabel;

	constructor(x: number, y: number, z: number, text: string, color: string) {
		this.node.position.set(x, y, z);

		// TODO(nick): Dispose label texture properly, should I add destroy flag
		// to nodes and destroy them all in one go?
		// TODO(nick): Improve font crispness / bitmap font
		this.label = new ThreeLabel(text);
		// TODO(nick): Don't hide label by default
		this.label.visible = true;
		// TODO(nick): Make this signature part of label constructor.
		this.label.update(text, color);
		this.node.add(this.label);

		new TWEEN.Tween({ offsetInPixels: 0 })
			.to({ offsetInPixels: 40 }, 2500)
			.onUpdate(({ offsetInPixels }) => this.label.setOffset(new THREE.Vector2(0, offsetInPixels)))
			.onComplete(() => this.node.removeFromParent())
			.start();
	}
}
