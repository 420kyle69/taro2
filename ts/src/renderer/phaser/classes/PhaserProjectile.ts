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

	protected updateTexture () {
		this.sprite.anims.stop();
		this.key = `projectile/${this.entity._stats.cellSheet.url}`;
		if (!this.scene.textures.exists(`projectile/${this.entity._stats.cellSheet.url}`)) {
			this.scene.loadEntity(`projectile/${this.entity._stats.cellSheet.url}`, this.entity._stats, true);
			this.scene.load.on(`filecomplete-image-${this.key}`, function cnsl() {
				if (this && this.sprite) {
					this.sprite.setTexture(`projectile/${this.entity._stats.cellSheet.url}`);
					this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
					const bounds = this.entity._bounds2d;
					this.sprite.setDisplaySize(bounds.x, bounds.y);
				}
			}, this);
			this.scene.load.start();
		} else {
			this.sprite.setTexture(`projectile/${this.entity._stats.cellSheet.url}`);
			const bounds = this.entity._bounds2d;
			this.sprite.setDisplaySize(bounds.x, bounds.y);
		}
	}

	protected destroy (): void {
		this.scene.renderedEntities = this.scene.renderedEntities.filter(item => item !== this.sprite);
		super.destroy();
	}
}
