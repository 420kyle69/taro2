class HeightRenderComponent {
	constructor (
			public scene: GameScene,
			public mapHeight: number
	) {
		this.scene.heightRenderer = this;
		console.log('Height Render Component');
	}

	adjustDepth (
		gameObject: TGameObject
	): void {
		const yPos = !gameObject.owner ?
			gameObject.y :
			gameObject.owner.gameObject.y;

		let depth = gameObject.taroDepth + yPos / this.mapHeight;

		depth = Number(depth.toFixed(3));

		gameObject.setDepth(depth);
	}
}