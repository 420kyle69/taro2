class DevButtonSection {
	name: string;
    container: Phaser.GameObjects.Container;
	header: Phaser.GameObjects.Rectangle;
	label: Phaser.GameObjects.BitmapText;
    buttons: DevToolButton[];

	/*button: Phaser.GameObjects.Rectangle;
	active: boolean;
	hidden: boolean;
	isHover = false;
	image: Phaser.GameObjects.Image;
	label: Phaser.GameObjects.BitmapText;
	timer: number | NodeJS.Timeout;
	hoverChildren?: DevToolButton[];*/
	constructor(
		devModeTools: DevModeTools,
		name: string,
	) {
		this.name = name;
		this.buttons = [];
		const scene = devModeTools.scene;
		const container = this.container = new Phaser.GameObjects.Container(scene);
		scene.add.existing(container);
		const w = devModeTools.SECTION_WIDTH;
		const h = devModeTools.BUTTON_HEIGHT;
		// @ts-ignore
		const header = this.header = scene.add.rexRoundRectangle(w/2, -h/3, w, h/2, 5, devModeTools.COLOR_GRAY);
		container.add(header);

		const label = this.label = scene.add.bitmapText(
			w/2, -h/3,
			BitmapFontManager.font(scene,
				'Verdana', true, false, '#000000'
			),
			this.name,
			14
		);
		label.setOrigin(0.5);
		label.letterSpacing = 1.3;
		container.add(label);
    }

	addButton(button: DevToolButton) {
		this.buttons.push(button);
	}

}
