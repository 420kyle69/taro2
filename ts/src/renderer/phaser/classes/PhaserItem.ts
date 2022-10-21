class PhaserItem extends PhaserAnimatedEntity {

	public gameObject: Phaser.GameObjects.Sprite & IRenderProps;
	public entity: IgeEntity;

	constructor (
		scene: GameScene,
		entity: Item
	) {
		super(scene, entity, `item/${entity._stats.itemTypeId}`);

		this.sprite.visible = false;

		this.gameObject = this.sprite;
		this.gameObject.owner = null;

		const { x, y } = entity._translate;
		this.gameObject.setPosition(x, y);
		this.gameObject.spriteHeight2 = this.sprite.displayHeight / 2;

		this.scene.itemsList.push(this);
		this.scene.renderedEntities.push(this.sprite);
	}

	protected destroy (): void {
		this.scene.renderedEntities = this.scene.renderedEntities.filter(item => item !== this.sprite);
		this.scene.itemsList = this.scene.itemsList.filter(item => item.entity.id() !== this.entity.id());
		super.destroy();
	}
}
