class PhaserProjectile extends PhaserAnimatedEntity {

	protected gameObject: Phaser.GameObjects.Sprite & IRenderProps;

	constructor (
		scene: GameScene,
		entity: Projectile
	) {
		super(scene, entity, `projectile/${entity._stats.type}`);

		this.sprite.visible = false;
		this.scene.renderedEntities.push(this.sprite);
		this.gameObject = this.sprite;

		const { x, y } = entity._translate;
		this.gameObject.setPosition(x, y);

		Object.assign(this.evtListeners, {
			'update-texture': entity.on('update-texture', this.updateTexture, this),
		});
	}

	protected updateTexture (data) {
		if (data === 'basic_texture_change') {
			this.sprite.anims.stop();
			this.key = `projectile/${this.entity._stats.type}_` + this.entity._stats.cellSheetChanges;
			this.scene.loadEntity(this.key, this.entity._stats, false);
			this.scene.load.on(`filecomplete-image-${this.key}`, function cnsl() {
				if (this && this.sprite) {
					this.sprite.setTexture(this.key);
					this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
					const bounds = this.entity._bounds2d;
					this.sprite.setDisplaySize(bounds.x, bounds.y);
				}
			}, this);
			this.scene.load.start();
		} 
	}

	protected destroy (): void {
		this.scene.renderedEntities = this.scene.renderedEntities.filter(item => item !== this.sprite);
		super.destroy();
	}
}
