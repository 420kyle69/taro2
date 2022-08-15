class DepthRenderComponent {
	constructor (public scene: GameScene) {
		this.scene.depthRenderer = this;
	}

	adjustDepth (
		gameObject: TGameObject
	): void {
		gameObject.setDepth(gameObject.taroDepth + gameObject.y / 1000); // 1000 temp numerator
	}
}