class PhaserRegion extends PhaserEntity {

	protected gameObject: Phaser.GameObjects.Graphics & IRenderProps;
	protected entity: Region;

	constructor (
		private scene: GameScene,
		entity: Region
	) {
		super(entity);

		const gameObject = scene.add.graphics();

		this.gameObject = gameObject as Phaser.GameObjects.Graphics & IRenderProps;
		this.gameObject.visible = false;
		scene.renderedEntities.push(this.gameObject);
		// we don't get depth/layer info from taro,
		// so it can go in 'debris' layer for now
		scene.entityLayers[EntityLayer.DEBRIS].add(this.gameObject);

		this.transform();
	}

	protected transform (): void {
		const graphics = this.gameObject;
		const stats = this.entity._stats.default;

		graphics.setPosition(stats.x, stats.y);

		graphics.clear();
		graphics.fillStyle(
			Number(`0x${stats.inside.substring(1)}`),
			(stats.alpha || 40 ) / 100
		);
		graphics.fillRect(
			0,
			0,
			stats.width,
			stats.height
		);
	}

	protected destroy (): void {
		this.scene.renderedEntities = this.scene.renderedEntities.filter(item => item !== this.gameObject);
		super.destroy();
	}
}
