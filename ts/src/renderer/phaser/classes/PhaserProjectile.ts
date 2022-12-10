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
			this.scene.textures.removeKey(`projectile/${this.entity._stats.type}`);
			//this.scene.textures.renameTexture(`projectile/${this.entity._stats.type}`, `projectile/${this.entity._stats.type}`+Math.random().toString());
			this.scene.loadEntity(`projectile/${this.entity._stats.type}`, this.entity._stats, false);
			this.scene.load.on(`filecomplete-image-${this.key}`, function cnsl() {
				if (this && this.sprite) {
					this.sprite.setTexture(`projectile/${this.entity._stats.type}`);
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
