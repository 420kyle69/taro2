class PhaserPalette extends Phaser.GameObjects.Container {

	private readonly textures: Phaser.GameObjects.Image;
	private readonly tileset: Phaser.Tilemaps.Tileset;
	texturesLayer: any;
	map: Phaser.Tilemaps.Tilemap;
	camera: Phaser.Cameras.Scene2D.Camera;
	rexUI: any;
	scrollBarContainer: Phaser.GameObjects.Container;
	scrollBarBottom: any;
	scrollBarRight: any;
	COLOR_DARK: number;
	layerButtonsContainer: Phaser.GameObjects.Container;
	pointerover: any;

	constructor(
		scene: Phaser.Scene,
		tileset: Phaser.Tilemaps.Tileset,
		rexUI?: any
	) {
		super(scene);

		console.log('create palette', this);
		this.tileset = tileset;
		this.rexUI = rexUI;

		this.x = -1000;
		this.y = 0;

		// Load a map from a 2D array of tile indices
		const paletteMap = [];
		for (let i = 0; i < tileset.rows; i++) {
			paletteMap.push([]);
		}
		for (let i = 0; i < tileset.total; i++) {
			paletteMap[Math.floor(i/tileset.columns)].push(i);
		}

		console.log('map', paletteMap);

		// When loading from an array, make sure to specify the tileWidth and tileHeight
		const map = this.map = this.scene.make.tilemap({ key: 'palette', data: paletteMap, tileWidth: 16, tileHeight: 16 });
		const texturesLayer = this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive()/*.setScrollFactor(0,0)*/.setPosition(this.x, this.y);
		//this.add(texturesLayer);
		scene.add.existing(texturesLayer);

		texturesLayer.on('pointermove', function (p) {
			if (!p.isDown) return;
			const scrollX = (p.x - p.prevPosition.x) / camera.zoom
			const scrollY = (p.y - p.prevPosition.y) / camera.zoom;
			if (camera.scrollX - scrollX > -(camera.width/2) + this.x && camera.scrollX - scrollX < (camera.width/2) + this.x) {
				camera.scrollX -= scrollX;
			}
			if (camera.scrollY - scrollY > -(camera.height/2) + this.y && camera.scrollY - scrollY < (camera.height/2) + this.y) {
				camera.scrollY -= scrollY;
			}
		  });

		const camera = this.camera = this.scene.cameras.add(this.scene.sys.game.canvas.width - texturesLayer.width - 40, 180, texturesLayer.width, texturesLayer.height).setScroll(this.x, this.y).setZoom(1).setName('palette');
		camera.setBackgroundColor(0x002244);

		const COLOR_PRIMARY = 0x4e342e;
		const COLOR_LIGHT = 0x7b5e57;
		const COLOR_DARK = this.COLOR_DARK = 0x260e04;

		const scrollBarContainer = this.scrollBarContainer = new Phaser.GameObjects.Container(scene);
		scene.add.existing(scrollBarContainer);
		scrollBarContainer.x = camera.x;
		scrollBarContainer.y = camera.y;

		const scrollBarBottom = this.scrollBarBottom = this.rexUI.add.scrollBar({
			width: this.camera.width,
			orientation: 'x',
			background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, COLOR_DARK),
			buttons: {
				left: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
				right: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
			},
			slider: {
				thumb: this.rexUI.add.roundRectangle(0, 0, (this.camera.width - 60) / 2, 20, 10, COLOR_LIGHT),
			},
			space: {
				left: 10, right: 10, top: 10, bottom: 10
			}
		});
		scrollBarBottom.value = 0.5;
		this.scrollBarContainer.add(scrollBarBottom);
		scrollBarBottom.setPosition(0, this.camera.height).setOrigin(0, 0).setScrollFactor(0,0).layout();

		const scrollBarRight = this.scrollBarRight = this.rexUI.add.scrollBar({
			height: this.camera.height,
			orientation: 'y',
			background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, COLOR_DARK),
			buttons: {
				left: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
				right: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
			},
			slider: {
				thumb: this.rexUI.add.roundRectangle(0, 0, 20, (this.camera.height - 60) / 2, 10, COLOR_LIGHT),
			},
			space: {
				left: 10, right: 10, top: 10, bottom: 10
			}
		});
		scrollBarRight.value = 0.5;
		this.scrollBarContainer.add(scrollBarRight);
		scrollBarRight.setPosition(this.camera.width, 0).setOrigin(0, 0).setScrollFactor(0,0).layout();

		scrollBarContainer.width = camera.width + scrollBarRight.width +60;
		scrollBarContainer.height = camera.height + scrollBarBottom.height +60;

		console.log('scrollBarContainer', camera.width, scrollBarRight)

		scrollBarBottom.on('valuechange',
			function (newValue, oldValue, scrollBar) {
				if (!isNaN(newValue)) {
					newValue -= 0.5;
					camera.scrollX = this.x + (camera.width * newValue);
				}
			},
			this
		);

		scrollBarRight.on('valuechange',
			function (newValue, oldValue, scrollBar) {
				if (!isNaN(newValue)) {
					newValue -= 0.5;
					camera.scrollY = this.y + (camera.height * newValue);
				}
			},
			this
		);

		this.scene.scale.on(Phaser.Scale.Events.RESIZE, () => {
			camera.x = this.scene.sys.game.canvas.width - texturesLayer.width - 40;
			scrollBarContainer.x = this.camera.x;
			layerButtonsContainer.x = this.camera.x + texturesLayer.width - 124;
		});

		this.addButton('+', 0, -31, 30, scrollBarContainer, this.zoom.bind(this), -1);
		this.addButton('-', 31, -31, 30, scrollBarContainer, this.zoom.bind(this), 1);

		const layerButtonsContainer = this.layerButtonsContainer = new Phaser.GameObjects.Container(scene);
		scene.add.existing(layerButtonsContainer);
		//this.scrollBarContainer.add(layerButtonsContainer);
		layerButtonsContainer.x = this.camera.x + texturesLayer.width - 93;
		layerButtonsContainer.y = this.camera.y;

		this.addButton('floor', 0, -155, 120, layerButtonsContainer, this.switchLayer.bind(this), 0);
		this.addButton('floor2', 0, -124, 120, layerButtonsContainer, this.switchLayer.bind(this), 1);
		this.addButton('walls', 0, -93, 120, layerButtonsContainer, this.switchLayer.bind(this), 2);
		this.addButton('trees', 0, -62, 120, layerButtonsContainer, this.switchLayer.bind(this), 3);
		this.addButton('tiles', 0, -31, 120, layerButtonsContainer, this.toggle.bind(this));

		//this.width = 500;
		//this.height = 500;
		/*this.setInteractive(new Phaser.Geom.Rectangle(scrollBarContainer.x - this.x,scrollBarContainer.y,500,500), Phaser.Geom.Rectangle.Contains);
		console.log(this);
		this.on('pointerover', () => {
			this.pointerover = true;
			console.log('pointerover');
		});

		this.on('pointerout', () => {
			this.pointerover = false;
			console.log('pointerout');
		});*/
	}

	toggle() {
		if (this.visible) this.hide();
		else this.show()
	}

	hide () {
		this.setVisible(false);
		this.texturesLayer.setVisible(false);
		this.camera.setVisible(false);
		this.scrollBarContainer.setVisible(false);
	}

	show () {
		this.setVisible(true);
		this.texturesLayer.setVisible(true);
		this.camera.setVisible(true);
		this.scrollBarContainer.setVisible(true);
	}

	addButton (text, x, y, w, container, func, value?) {
		//const text = '+';
		//const w = 30;
		const h = 30;
		//const x = 0;
		//const y = -h -1;
		const button = this.scene.add.rectangle(x + w/2, y + h/2, w, h, this.COLOR_DARK);
		button.setInteractive();
		container.add(button);
		const label = this.scene.add.text(
			x + w/2, y + h/2, text
		);
		label.setFontFamily('Verdana');
		label.setFontSize(26);
		label.setOrigin(0.5);
		label.setResolution(4);
		container.add(label);
		button.on('pointerdown', () => {
			if (value || value === 0) func(value);
			else func();
		});
	}

	switchLayer(value) {
		const scene = this.scene as any;
		const gameMap = scene.gameScene.tilemap;
		//console.log('switch layer from', gameMap.currentLayerIndex, 'to', value);
		gameMap.currentLayerIndex = value;
	}

	zoom (deltaY: number): void {
		let targetZoom;
		if (deltaY < 0) targetZoom = this.camera.zoom * 1.2;
		else targetZoom = this.camera.zoom / 1.2;
		if (targetZoom < 1) targetZoom = 1;
		else if (targetZoom > 20) targetZoom = 20;
		this.camera.setZoom(targetZoom);
		/*const targetPosition = this.camera.getWorldPoint(pointer.x, pointer.y);
		this.camera.setScroll(targetPosition.x, targetPosition.y);*/


		this.scrollBarBottom.getElement('slider.thumb').width = (this.camera.width - 60) / (targetZoom * 2);
		//if (targetZoom === 1) this.scrollBarBottom.value = 0.5;
		//if (deltaY > 0) this.scrollBarBottom.value = 0.5 * ((this.scrollBarBottom.value - 0.5) * (targetZoom - 1));
		this.scrollBarBottom.layout();

		this.scrollBarRight.getElement('slider.thumb').height = (this.camera.height - 60) / (targetZoom * 2);
		//if (targetZoom === 1) this.scrollBarRight.value = 0.5;
		this.scrollBarRight.layout();
	}
}
