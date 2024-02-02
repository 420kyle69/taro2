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
		//scene: DevModeScene,
		devModeTools: DevModeTools,
		name: string,
	) {
		this.name = name;
		this.buttons = [];
		const scene = devModeTools.scene;
		const container = this.container = new Phaser.GameObjects.Container(scene);
		scene.add.existing(container);
		// @ts-ignore
		const header = this.header = scene.add.rexRoundRectangle(devModeTools.SECTION_WIDTH/2, -devModeTools.BUTTON_HEIGHT/2, devModeTools.SECTION_WIDTH, devModeTools.BUTTON_HEIGHT/2, 5, devModeTools.COLOR_GRAY);
		container.add(header);

		const label = this.label = scene.add.bitmapText(
			devModeTools.SECTION_WIDTH/2, -devModeTools.BUTTON_HEIGHT/2,
			BitmapFontManager.font(scene,
				'Verdana', true, false, '#000000'
			),
			this.name,
			14
		);
		label.setOrigin(0.5);
		label.letterSpacing = 1.3;
		//label.setVisible(defaultVisible);
		container.add(label);

		console.log('header position', header.x, header.y);
    }

	addButton(button: DevToolButton) {
		this.buttons.push(button);
		console.log('button position', button.button.x, button.button.y);
	}

}
