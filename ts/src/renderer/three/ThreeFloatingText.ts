class ThreeFloatingText {
	node = new THREE.Object3D();
	label: ThreeLabel;

	constructor(x: number, y: number, z: number, text: string, color: string) {
		this.node.position.set(x, y, z);

		// TODO(nick): Dispose label texture properly, should I add destroy flag
		// to nodes and destroy them all in one go?
		// TODO(nick): Improve font crispness / bitmap font
		this.label = new ThreeLabel(text, color);
		// TODO(nick): Don't hide label by default
		this.label.visible = true;
		this.node.add(this.label);

		new TWEEN.Tween({ offsetInPixels: 0, opacity: 1 })
			.to({ offsetInPixels: 40, opacity: 0.5 }, 2500)
			.onUpdate(({ offsetInPixels, opacity }) => {
				this.label.setOffset(new THREE.Vector2(0, offsetInPixels));
				this.label.setOpacity(opacity);
			})
			.onComplete(() => this.node.removeFromParent())
			.start();
	}
}
