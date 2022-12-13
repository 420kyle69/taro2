class DevToolButton {
	button: Phaser.GameObjects.Rectangle;
	active: boolean;
	image: Phaser.GameObjects.Image;

	constructor (
		public devModeTools: DevModeTools,
		text: string,
		texture: string | null,
		x: number,
		y: number,
		w: number,
		container: Phaser.GameObjects.Container,
		func: (...args: any[]) => void,
		value?: number
	) {
		//const text = '+';
		//const w = 30;
		const h = 30;
		//const x = 0;
		//const y = -h -1;
		const scene = devModeTools.scene;
		const button = this.button = scene.add.rectangle(x + w/2, y + h/2, w, h, devModeTools.COLOR_DARK);
		button.setInteractive();
		container.add(button);

		if (texture) {
			const image = this.image = scene.add.image(x + w/4 + h * 0.1, y + h * 0.1, texture)
				.setDisplaySize(h * 0.8, h * 0.8)
				.setOrigin(0);
			container.add(image);
		} else {
			const label = scene.add.bitmapText(
				x + w/2, y + h/2,
				BitmapFontManager.font(scene,
					'Verdana', false, false, '#000000'
				),
				text,
				22
			);
			label.setOrigin(0.5);
			label.letterSpacing = 1.3;
		    container.add(label);

			if (scene.renderer.type === Phaser.CANVAS) {
				const rt = scene.add.renderTexture(
					label.x, label.y,
					label.width, label.height
				);
				rt.draw(label, label.width/2, label.height/2);
				rt.setOrigin(0.5);
				container.add(rt);

				label.visible = false;
			}
		}
		button.on('pointerdown', () => {
			if (value || value === 0) func(value);
			else func();
		});
	}

	highlight (active: boolean): void {
		this.active = active;
		this.button.setFillStyle(this.devModeTools[
			active ? 'COLOR_LIGHT' : 'COLOR_DARK'
		], 1);
	}
}
