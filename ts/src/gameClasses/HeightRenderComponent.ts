class HeightRenderComponent {
	constructor (
			public scene: GameScene,
			private mapHeight: number
	) {
		this.scene.heightRenderer = this;
		console.log('Height Render Component');
	}

	adjustDepth (
		gameObject: TGameObject
	): void {
		gameObject.setDepth(gameObject.taroDepth + gameObject.y / this.mapHeight);
	}
}