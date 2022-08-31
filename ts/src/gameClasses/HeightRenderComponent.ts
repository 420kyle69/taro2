class HeightRenderComponent {
	constructor (
			public scene: GameScene,
			public mapHeight: number
	) {
		this.scene.heightRenderer = this;
	}

	adjustDepth (
		gameObject: TGameObject & Phaser.GameObjects.Components.Size
	): void {
		const castGameObject = !gameObject.owner ? gameObject : gameObject.owner.gameObject;

		const yPos = castGameObject.y;
		const halfHeight = castGameObject.displayHeight / 2;

		let depth = gameObject.taroDepth + (yPos + halfHeight) / this.mapHeight;

		depth = Number(depth.toFixed(3));

		gameObject.setDepth(depth);
	}
}