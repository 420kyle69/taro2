class PhaserPalette extends Phaser.GameObjects.Container {

	//private readonly background: Phaser.GameObjects.Graphics;
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

	constructor(
		scene: Phaser.Scene,
		tileset: Phaser.Tilemaps.Tileset,
		rexUI?: any
	) {
		super(scene);

		console.log('create palette', this);
		this.tileset = tileset;
		this.rexUI = rexUI;
		//this.setScrollFactor(0,0);
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

		/*texturesLayer.on('pointerover', () => {
			this.pointerOver;
		});*/


		//  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
		const camera = this.camera = this.scene.cameras.add(this.scene.sys.game.canvas.width - texturesLayer.width - 40, 70, texturesLayer.width, texturesLayer.height).setScroll(this.x, this.y).setZoom(1).setName('palette');
		camera.setBackgroundColor(0x002244);

		const COLOR_PRIMARY = 0x4e342e;
		const COLOR_LIGHT = 0x7b5e57;
		const COLOR_DARK = this.COLOR_DARK = 0x260e04;

		const scrollBarContainer = this.scrollBarContainer = new Phaser.GameObjects.Container(scene);
		scene.add.existing(scrollBarContainer);
		scrollBarContainer.x = this.camera.x;
		scrollBarContainer.y = this.camera.y;

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
				//console.log('value', newValue);
				//newValue -= 0.5;
				//const targetValue = newValue * (camera.zoom - 1);
				//scrollBar.value = 0.5 + targetValue;
				//camera.scrollX = this.x /*- (camera.width / 2)*/ + (camera.width * newValue);
			},
			this
		);

		scrollBarRight.on('valuechange',
			function (newValue, oldValue, scrollBar) {
				if (!isNaN(newValue)) {
					newValue -= 0.5;
					camera.scrollY = this.y + (camera.height * newValue);
				}
				//console.log('value', newValue);
				//newValue -= 0.5;
				//const targetValue = newValue * (camera.zoom - 1);
				//scrollBar.value = 0.5 + targetValue;
				//console.log('targetValue', targetValue);
				//camera.scrollY = this.y /*- (camera.height / 2)*/ + (camera.height * newValue);
			},
			this
		);

		this.scene.scale.on(Phaser.Scale.Events.RESIZE, () => {
			camera.x = this.scene.sys.game.canvas.width - texturesLayer.width - 40;
			scrollBarContainer.x = this.camera.x;
		});

		this.addButton('+', 0, this.zoom.bind(this), -1);
		this.addButton('-', 31, this.zoom.bind(this), 1);

		this.addButton('1', texturesLayer.width - 124, this.switchLayer.bind(this), 0);
		this.addButton('2', texturesLayer.width - 93, this.switchLayer.bind(this), 1);
		this.addButton('3', texturesLayer.width - 62, this.switchLayer.bind(this), 2);
		this.addButton('4', texturesLayer.width - 31, this.switchLayer.bind(this), 3);
	}

	addButton (text, x, func, value) {
		//const text = '+';
		const w = 30;
		const h = 30;
		//const x = 0;
		const y = -h;
		const button = this.scene.add.rectangle(x + w/2, y + h/2, w, h, this.COLOR_DARK);
		button.setInteractive();
		this.scrollBarContainer.add(button);
		const label = this.scene.add.text(
			x + w/2, y + h/2, text
		);
		label.setFontFamily('Verdana');
		label.setFontSize(26);
		label.setOrigin(0.5);
		label.setResolution(4);
		this.scrollBarContainer.add(label);
		button.on('pointerdown', () => {
			func(value);
		});
	}

	switchLayer(value) {
		const scene = this.scene as any;
		const gameMap = scene.gameScene.tilemap;
		gameMap.currentLayerIndex = value;
	}

	zoom (/*pointer: any,*/ deltaY: number): void {
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
