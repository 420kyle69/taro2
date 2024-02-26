/*class DevButtonSection {
	name: string;
    container: Phaser.GameObjects.Container;
	header: Phaser.GameObjects.Rectangle;
	label: Phaser.GameObjects.BitmapText;
    buttons: DevToolButton[];
	y: number;
	height: number;

	constructor(
		devModeTools: DevModeTools,
		name: string,
		y: number,
		height: number
	) {
		this.name = name;
		this.buttons = [];
		this.y = y;
		this.height = height;
		const scene = devModeTools.scene;
		const w = devModeTools.SECTION_WIDTH;
		const h = devModeTools.BUTTON_HEIGHT;
		if (name) {
			// @ts-ignore
			const header = this.header = scene.add.rexRoundRectangle(w/2, y - h/3, w, h/2, 5, devModeTools.COLOR_GRAY);
			devModeTools.toolButtonsContainer.add(header);

			const label = this.label = scene.add.bitmapText(
				w/2, y - h/3,
				BitmapFontManager.font(scene,
					'Verdana', true, false, '#000000'
				),
				this.name,
				16
			);
			label.scale = 0.8;
			label.setOrigin(0.5);
			label.letterSpacing = 1.3;
			devModeTools.toolButtonsContainer.add(label);
		}
    }

	addButton(button: DevToolButton, array: DevToolButton[] = this.buttons) {
		button.button.y += this.y;
		if (button.label) button.label.y += this.y;
		if (button.image) button.image.y += this.y;
		array.push(button);
	}

}*/
