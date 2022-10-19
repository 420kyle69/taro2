class PhaserPalette extends Phaser.GameObjects.Container {

	private readonly textures: Phaser.GameObjects.Image;
	private readonly tileset: Phaser.Tilemaps.Tileset;

	scene: DevModeScene;
	texturesLayer: any;
	map: Phaser.Tilemaps.Tilemap;
	camera: Phaser.Cameras.Scene2D.Camera;
	rexUI: any;

	scrollBarContainer: Phaser.GameObjects.Container;
	scrollBarBottom: any;
	scrollBarRight: any;

	layerButtonsContainer: Phaser.GameObjects.Container;
	layerButtons: PhaserPaletteButton[];
	toolButtonsContainer: Phaser.GameObjects.Container;
	toolButtons: PhaserPaletteButton[];

	pointerover: any;

	COLOR_DARK: number;
	COLOR_LIGHT: number;
	area: { x: number, y: number };
	
	constructor(
		scene: DevModeScene,
		tileset: Phaser.Tilemaps.Tileset,
		rexUI?: any
	) {
		super(scene);

		console.log('create palette', this);
		this.tileset = tileset;
		this.rexUI = rexUI;
		this.scene = scene;

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

		// When loading from an array, make sure to specify the tileWidth and tileHeight
		const map = this.map = this.scene.make.tilemap({ key: 'palette', data: paletteMap, tileWidth: 16, tileHeight: 16 });
		const texturesLayer = this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive().setPosition(this.x, this.y);
		
		scene.add.existing(texturesLayer);

		const paletteWidth = this.scene.sys.game.canvas.width * 0.25;
		const paletteHeight = this.scene.sys.game.canvas.height * 0.25;
		const camera = this.camera = this.scene.cameras.add(this.scene.sys.game.canvas.width - paletteWidth - 40,
			this.scene.sys.game.canvas.height - paletteHeight - 40,	paletteWidth, paletteHeight)
			.setBounds(texturesLayer.x - (texturesLayer.width/2), texturesLayer.y - (texturesLayer.height/2),
			texturesLayer.width * 2, texturesLayer.height * 2, true)
			.setZoom(1).setName('palette');

		camera.setBackgroundColor(0xFFFFFF);

		texturesLayer.on('pointermove', function (p) {
			if (!p.isDown) return;
			const scrollX = (p.x - p.prevPosition.x) / camera.zoom
			const scrollY = (p.y - p.prevPosition.y) / camera.zoom;
			camera.scrollX -= scrollX;
			camera.scrollY -= scrollY;
		  });

		const COLOR_PRIMARY = 0x0036cc;
		const COLOR_LIGHT = this.COLOR_LIGHT = 0x6690ff;
		const COLOR_DARK = this.COLOR_DARK = 0xffffff;

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
				thumb: this.rexUI.add.roundRectangle(0, 0, (this.camera.width - 60) / 2, 20, 1, COLOR_LIGHT),
			},
			space: {
				left: 1, right: 1, top: 1, bottom: 1
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
				thumb: this.rexUI.add.roundRectangle(0, 0, 20, (this.camera.height - 60) / 2, 1, COLOR_LIGHT),
			},
			space: {
				left: 1, right: 1, top: 1, bottom: 1
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
			camera.x = this.scene.sys.game.canvas.width - paletteWidth - 40;
			scrollBarContainer.x = this.camera.x;
			layerButtonsContainer.x = this.camera.x + paletteWidth - 98;
			toolButtonsContainer.x = this.camera.x + 93;
		});

		new PhaserPaletteButton (this, '+', null, 0, -31, 30, scrollBarContainer, this.zoom.bind(this), -1);
		new PhaserPaletteButton (this, '-', null, 31, -31, 30, scrollBarContainer, this.zoom.bind(this), 1);

		const layerButtonsContainer = this.layerButtonsContainer = new Phaser.GameObjects.Container(scene);
		scene.add.existing(layerButtonsContainer);
		//this.scrollBarContainer.add(layerButtonsContainer);
		layerButtonsContainer.x = this.camera.x + paletteWidth - 98;
		layerButtonsContainer.y = this.camera.y;
		layerButtonsContainer.width = 120;
		layerButtonsContainer.height = 160;

		new PhaserPaletteButton (this, 'tiles', null, 0, -31, 120, layerButtonsContainer, this.toggle.bind(this));

		this.layerButtons = [];
		this.layerButtons.push (
			new PhaserPaletteButton (this, 'floor', null, 0, -93, 120, layerButtonsContainer, this.switchLayer.bind(this), 0),
			new PhaserPaletteButton (this, 'floor2', null, 0, -124, 120, layerButtonsContainer, this.switchLayer.bind(this), 1),
			new PhaserPaletteButton (this, 'walls', null, 0, -155, 120, layerButtonsContainer, this.switchLayer.bind(this), 2),
			new PhaserPaletteButton (this, 'trees', null, 0, -186, 120, layerButtonsContainer, this.switchLayer.bind(this), 3)
		)
		this.layerButtons[0].highlight(true);

		const toolButtonsContainer = this.toolButtonsContainer = new Phaser.GameObjects.Container(scene);
		scene.add.existing(toolButtonsContainer);
		//this.scrollBarContainer.add(toolButtonsContainer);
		toolButtonsContainer.x = this.camera.x + 93;
		toolButtonsContainer.y = this.camera.y;
		toolButtonsContainer.width = 310;
		toolButtonsContainer.height = 50;

		new PhaserPaletteButton (this, '_', 'eraser', 0, -31, 30, toolButtonsContainer, this.emptyTile.bind(this));

		this.toolButtons = [];
		this.toolButtons.push (
			new PhaserPaletteButton (this, '.', null, 62, -31, 30, toolButtonsContainer, this.selectSingle.bind(this)),
			new PhaserPaletteButton (this, '[]', null, 93, -31, 30, toolButtonsContainer, this.selectArea.bind(this))
		)
		this.toolButtons[0].highlight(true);

		this.area = {x: 1, y: 1};

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

	emptyTile() {
		var copy = { ...this.scene.selectedTile };
		copy.index = 0;
		this.scene.selectedTile = copy as any;
		this.scene.selectedTileArea = [[copy, copy],[copy, copy]] as any;
	}

	selectSingle() {
		for (let i = 0; i < this.area.x; i++) {
			for (let j = 0; j < this.area.y; j++) {
				if (this.scene.selectedTileArea[i][j]) this.scene.selectedTileArea[i][j].tint = 0xffffff;
			}
		}
		this.area = {x: 1, y: 1};
		this.scene.marker.scale = 1;
		this.scene.paletteMarker.scale = 1;
		this.toolButtons[0].highlight(true);
		this.toolButtons[1].highlight(false);
	}

	selectArea() {
		this.scene.selectedTile.tint = 0xffffff;
		this.area = {x: 2, y: 2};
		this.scene.marker.scale = 2;
		this.scene.paletteMarker.scale = 2;
		this.toolButtons[1].highlight(true);
		this.toolButtons[0].highlight(false);
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

	switchLayer(value) {
		const scene = this.scene as any;
		const gameMap = scene.gameScene.tilemap;
		gameMap.currentLayerIndex = value;
		this.layerButtons.forEach(button => {
			button.highlight(false);
		});
		this.layerButtons[value].highlight(true);
		
	}

	zoom (deltaY: number): void {
		let targetZoom;
		if (deltaY < 0) targetZoom = this.camera.zoom * 1.2;
		else targetZoom = this.camera.zoom / 1.2;
		if (targetZoom < 0.5) targetZoom = 0.5;
		else if (targetZoom > 20) targetZoom = 20;
		this.camera.setZoom(targetZoom);

		this.scrollBarBottom.getElement('slider.thumb').width = (this.camera.width - 60) / (targetZoom * 2);
		this.scrollBarBottom.layout();

		this.scrollBarRight.getElement('slider.thumb').height = (this.camera.height - 60) / (targetZoom * 2);
		this.scrollBarRight.layout();
	}
}
