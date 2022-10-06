class PhaserRay {
	private line: Phaser.GameObjects.Line;
	private sprite: Phaser.GameObjects.Sprite;

	constructor (
		scene: GameScene,
		start: {
			x: number,
			y: number
		},
		end: {
			x: number,
			y: number
		},
		color: any,
		type: any,
	) {

		// const v1 = new Phaser.Math.Vector2(start.x, start.y);
		// const v2 = new Phaser.Math.Vector2(end.x, end.y);

		// const realEnd = v2.subtract(v1);
		// this.line = scene.add.line(
		// 	start.x, start.y,
		// 	start.x, start.y,
		// 	realEnd.x, realEnd.y,
		// 	color,
		// );

		this.sprite = scene.add.sprite(start.x, start.y, `projectile/${type}`);

		scene.tweens.add({
			targets: this.sprite,
			duration: 125, // this should be a function of the magnitude of distance between start and end
			props: {
				x: end.x,
				y: end.y
			},
			onComplete: () => {
				this.sprite.destroy();
				this.sprite = null;
			}
		});

		// this.line.setOrigin(0,0);
		// console.log(this.line);
	}
}