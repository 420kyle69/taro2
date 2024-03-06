class ThreeFloatingText {
	node: ThreeLabel;

	constructor(x: number, y: number, z: number, text: string, color: string) {
		// TODO(nick): Dispose label texture properly, should I add destroy flag
		// to nodes and destroy them all in one go?
		this.node = new ThreeLabel(text, color, true);
		this.node.position.set(x, y, z);

		new TWEEN.Tween({ offsetInPixels: 0, opacity: 1 })
			.to({ offsetInPixels: 40, opacity: 0.5 }, 2500)
			.onUpdate(({ offsetInPixels, opacity }) => {
				this.node.setOffset(new THREE.Vector2(0, offsetInPixels));
				this.node.setOpacity(opacity);
			})
			.onComplete(() => this.node.destroy())
			.start();
	}
}
