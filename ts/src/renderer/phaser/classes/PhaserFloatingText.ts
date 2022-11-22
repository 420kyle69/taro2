class PhaserFloatingText extends Phaser.GameObjects.BitmapText {

	// TODO object pool

	constructor (
		scene: Phaser.Scene,
		data: {
			text: string,
			x: number,
			y: number,
			color: string
		},
	) {
		super(scene,
			data.x, data.y,
			BitmapFontManager.font(scene,
				'Verdana', true,
				ige.game.data.settings
					.addStrokeToNameAndAttributes !== false,
				data.color || '#FFFFFF'
			)
		);
		this.setText(BitmapFontManager.sanitize(
			this.fontData, data.text
		));
		this.setOrigin(0.5);
		this.setFontSize(16);
		this.letterSpacing = 1.3;

		scene.add.existing(this);
		scene.tweens.add({
			targets: this,
			alpha: 0.5,
			duration: 2500,
			y: this.y - 40,
			onComplete: () => {
				this.destroy(); // TODO object pool
			}
		});
	}
}
