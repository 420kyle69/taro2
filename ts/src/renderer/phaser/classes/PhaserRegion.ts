class PhaserRegion extends PhaserEntity {

	public name: string;
	public label: Phaser.GameObjects.Text;
	private graphics: Phaser.GameObjects.Graphics
	public gameObject: Phaser.GameObjects.Container & IRenderProps;
	public devModeOnly: boolean;
	private devModeScene: DevModeScene;

	constructor (
		private scene: GameScene,
		entity: Region
	) {
		super(entity);

		const stats = this.entity._stats.default;

		const gameObject = scene.add.container();

		const graphics = scene.add.graphics();
		this.graphics = graphics as Phaser.GameObjects.Graphics & IRenderProps;
		gameObject.add(graphics);
		gameObject.setSize(stats.width, stats.height);
		gameObject.setPosition(stats.x + stats.width/2, stats.y + stats.height/2);
		gameObject.setInteractive();
		gameObject.on('pointerdown', () => {
			if (ige.developerMode.active && this.devModeScene.regionTool && this.scene.input.manager.activePointer.rightButtonDown()) {
				ige.addNewRegion && ige.addNewRegion({name: this.entity._stats.id, x: stats.x, y: stats.y, width: stats.width, height: stats.height});
			}
		});

		this.gameObject = gameObject as Phaser.GameObjects.Container & IRenderProps;
		scene.renderedEntities.push(this.gameObject);
		// we don't get depth/layer info from taro,
		// so it can go in 'debris' layer for now
		scene.entityLayers[EntityLayer.DEBRIS].add(this.gameObject);

		this.name = this.entity._stats.id

		if (!stats.inside) {
			this.devModeOnly = true;
		}

		const devModeScene = this.devModeScene = ige.renderer.scene.getScene('DevMode') as DevModeScene;
		devModeScene.regions.push(this);

		if (this.devModeOnly && !ige.developerMode.active) {
			this.hide();
		}

		this.updateLabel();
		this.transform();
	}

	private getLabel (): Phaser.GameObjects.Text {
		if (!this.label) {
			const label = this.label = this.scene.add.text(0, 0, 'cccccc');
			label.visible = false;

			// needs to be created with the correct scale of the client
			this.label.setScale(1 / this.scene.cameras.main.zoom);
			label.setOrigin(0);

			this.gameObject.add(label);
		}
		return this.label;
	}

	public updateLabel (): void {
		const label = this.getLabel();
		label.visible = true;

		label.setFontFamily('Verdana');
		label.setFontSize(16);
		label.setFontStyle('normal');
		label.setFill('#fff');

		const strokeThickness = ige.game.data.settings
			.addStrokeToNameAndAttributes !== false ? 4 : 0;
		label.setStroke('#000', strokeThickness);
		label.setText(this.name || '');

		const stats = this.entity._stats.default;
		label.setPosition(5 - stats.width/2, 5 - stats.height/2);
	}

	protected transform (): void {
		const graphics = this.graphics;
		const label = this.label;
		const stats = this.entity._stats.default;

		this.gameObject.setPosition(stats.x + stats.width/2, stats.y + stats.height/2);
		graphics.setPosition(-stats.width/2, -stats.height/2);
		label.setPosition(5 - stats.width/2, 5 - stats.height/2);

		graphics.clear();
		
		if (this.devModeOnly) {
			graphics.lineStyle(
				2,
				0x11fa05,
				// between 0 and 1 or we default
				(stats.alpha && stats.alpha >= 0 && stats.alpha <= 1) ? stats.alpha : 1
			);
			graphics.strokeRect(
				0,
				0,
				stats.width,
				stats.height
			);
		} else {
			graphics.fillStyle(
				Number(`0x${stats.inside.substring(1)}`),
				// between 0 and 1 or we default
				(stats.alpha && stats.alpha >= 0 && stats.alpha <= 1) ? stats.alpha : 0.4
			);
			graphics.fillRect(
			0,
			0,
			stats.width,
			stats.height
		)};
	}

	protected destroy (): void {
		this.devModeScene.regions = this.devModeScene.regions.filter(item => item !== this);
		this.scene.renderedEntities = this.scene.renderedEntities.filter(item => item !== this.gameObject);
		super.destroy();
	}
}
