class HeightRenderComponent {
	constructor (
			public scene: GameScene,
			public mapHeight: number
	) {
		this.scene.heightRenderer = this;
	}

	adjustDepth (
		gameObject: TGameObject
	): void {

		const castGameObject = !gameObject.owner ? gameObject : gameObject.owner.gameObject;

		const yPos = castGameObject.y;
		const halfHeight = castGameObject.spriteHeight2;

		let depth = gameObject.taroDepth + (yPos + halfHeight) / this.mapHeight;

		depth = Number(depth.toFixed(3));
		console.log(gameObject, depth);
		gameObject.setDepth(depth);
	}
}