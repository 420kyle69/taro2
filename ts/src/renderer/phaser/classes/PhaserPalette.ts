class PhaserPalette extends Phaser.GameObjects.Container {

	private readonly background: Phaser.GameObjects.Graphics;
	private readonly textures: Phaser.GameObjects.Image;
	private readonly tileset: Phaser.Tilemaps.Tileset;
	texturesLayer: any;
	map: Phaser.Tilemaps.Tilemap;
	camera: Phaser.Cameras.Scene2D.Camera;

	constructor(
		scene: Phaser.Scene,
		tileset: Phaser.Tilemaps.Tileset
	) {
		super(scene);


		console.log('create palette', this);
		this.tileset = tileset;
		//this.setScrollFactor(0,0);
		this.x = -750;
		this.y = 50;

		//  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
		const camera = this.camera = this.scene.cameras.add(700, 100, 550, 400).setScroll(this.x, this.y).setZoom(1).setName('palette');
		camera.setBackgroundColor(0x002244);

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
		//const tiles = map.addTilesetImage('mario-tiles');
		const texturesLayer = this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive()/*.setScrollFactor(0,0)*/.setPosition(this.x, this.y);
		//this.add(texturesLayer);
		scene.add.existing(texturesLayer);

		/*texturesLayer.on('pointerover', () => {
			this.pointerOver;
		});*/

		console.log(texturesLayer);

		const background = this.background = scene.add.graphics();
		this.add(background);
		scene.add.existing(this);

		//this.drawBackground();
		/*this.scene.input.setDraggable(texturesLayer);
		this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
			console.log('drag', dragX, dragY);
			this.camera.scrollX = dragX;
			this.camera.scrollY = dragY;
		});*/
	}

	private drawBackground (): void {
		const background = this.background;

		const width = 570;
		const height = 420;
		background.fillStyle(0x000000, 0.2);
		background.fillRect(
			-10,
			-10,
			width,
			height
		);
	}

	scroll (deltaY: number): void {
		let targetZoom = this.camera.zoom - (deltaY/5000);
		if (targetZoom < 1) targetZoom = 1;
		this.camera.setZoom(targetZoom);
	}
}
