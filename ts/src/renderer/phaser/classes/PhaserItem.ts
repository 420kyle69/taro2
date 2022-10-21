class PhaserItem extends PhaserAnimatedEntity {

	public gameObject: Phaser.GameObjects.Sprite & IRenderProps;
	public entity: IgeEntity;

	ownerUnitId: string;

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

		Object.assign(this.evtListeners, {
			setOwnerUnit: entity.on('setOwnerUnit', this.setOwnerUnit, this)
		});

		this.scene.renderedEntities.push(this.sprite);
	}

	protected setOwnerUnit (unitId: string): void {
		this.ownerUnitId = unitId;

		const phaserUnit = unitId ? this.scene.findUnit(unitId) : null;

		this.gameObject.owner = phaserUnit ? phaserUnit : null;
	}

	protected destroy (): void {
		this.scene.renderedEntities = this.scene.renderedEntities.filter(item => item !== this.sprite);
		this.ownerUnitId = null;
		super.destroy();
	}
}
