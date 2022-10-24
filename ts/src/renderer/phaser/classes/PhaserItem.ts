class PhaserItem extends PhaserAnimatedEntity {

	public gameObject: Phaser.GameObjects.Sprite & IRenderProps;
	public entity: IgeEntity;

	ownerUnitId?: string;

	constructor (
		scene: GameScene,
		entity: Item
	) {
		super(scene, entity, `item/${entity._stats.itemTypeId}`);

		this.sprite.visible = false;

		this.gameObject = this.sprite;

		const { x, y } = entity._translate;
		this.gameObject.setPosition(x, y);


		Object.assign(this.evtListeners, {
			// this event is only emitted by height-based-zindex games
			setOwnerUnit: entity.on('setOwnerUnit', this.setOwnerUnit, this)
		});

		if (ige.game.data.heightBasedZIndex) {
			// don't waste cpu tracking owner of items on renderer
			// unless we have to (hbz)
			this.gameObject.owner = null;
			this.gameObject.spriteHeight2 = this.sprite.displayHeight / 2;
		}

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
