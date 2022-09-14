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

		//  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
		/*const camera = this.camera = this.scene.cameras.add(200, 10, 200, 200).setZoom(0.2).setName('mini');
		camera.setBackgroundColor(0x002244);*/

		console.log('create palette', this);
		this.tileset = tileset;
		this.setScrollFactor(0,0);
		this.x = 750;
		this.y = 50;

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
		const texturesLayer = this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive().setScrollFactor(0,0).setPosition(this.x, this.y);
		//this.add(texturesLayer);
		scene.add.existing(texturesLayer);

		/*texturesLayer.on('pointerover', () => {
			this.pointerOver;
		});*/

		console.log(texturesLayer);

		const background = this.background = scene.add.graphics();
		this.add(background);
		scene.add.existing(this);

		this.drawBackground();

		/*const textures = this.textures = this.scene.add.image(10, 10, tileset.image).setOrigin(0, 0).setInteractive();//.setScale(0.5);
		this.add(textures);
		console.log(textures);

		const cropWidth = 550;
		const cropHeight = 400;

		const cropped = textures.setCrop(0, 0, cropWidth, cropHeight);
		//textures.setPosition(textures.x -150,textures.y -150);

		console.log('cropped frame', cropped.frame);

		/*this.textures.on('wheel', (pointer, deltaX, deltaY) => {
			this.scroll(deltaY);
			console.log('scroll', deltaX, deltaY);
		});*/

		//this.setSize(textures.width, textures.height);

		//container.setInteractive();

		//this.scene.input.setDraggable(textures);
		this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
			console.log('drag', dragX, dragY);
			//textures.setCrop(dragX, dragY, cropWidth, cropHeight);
			//gameObject.x = dragX;
			//gameObject.y = dragY;

		});
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
		const targetScale = this.texturesLayer.scale - (deltaY/1000);
		this.texturesLayer.setScale(targetScale);

		/*const cropWidth = 550;
		const cropHeight = 400;
		this.textures.setCrop(0, 0, cropWidth / targetScale, cropHeight / targetScale);*/
	}

	  /*
	  getRenderTexture(tiles: number[][]) {
		const sourceTexture = this.tileset;
		//const tileWidth = sourceTexture.tileWidth;
		//const tileHeight = sourceTexture.tileHeight;
		const { tileWidth, tileHeight } = sourceTexture;

		const tileIds = tiles;
		const rt = this.scene.make.renderTexture(
		  {
				width: tileIds[0].length * tileWidth,
				height: tileIds.length * tileHeight,
				x: 0,
				y: 0,
		  },
		  false
		);
		for (let y = 0; y < tileIds.length; y++) {
		  // loop X
		  for (let x = 0; x < tileIds[y].length; x++) {
				const tileId = tileIds[y][x];
				const coordinate = (sourceTexture.getTileTextureCoordinates(tileId) || {
			  x: 0,
			  y: 0,
				}) as { x: number; y: number };
				const ft = sourceTexture.image.get().clone();
				const newRT = this.scene.make.renderTexture(
			  {
						width: ft.width,
						height: ft.height,
			  },
			  false
				);
				newRT.draw(ft);
				newRT.setCrop(coordinate.x, coordinate.y, tileWidth, tileHeight)
				rt.draw(
			  newRT,
			  -coordinate.x + x * tileWidth,
			  -coordinate.y + y * tileHeight
				);
		  }
		}
		return rt.texture;
	  }*/
}

/*
class PhaserPalette extends Phaser.GameObjects.Container {

	private readonly background: Phaser.GameObjects.Graphics;
	private readonly textures: Phaser.GameObjects.Image;
	private readonly tileset: Phaser.Tilemaps.Tileset;

	constructor(
		scene: Phaser.Scene,
		tileset: Phaser.Tilemaps.Tileset
	) {
		super(scene);

		console.log('create palette', this);
		this.tileset = tileset;
		this.setScrollFactor(0,0);
		this.x = 850;
		this.y = 50;

		const background = this.background = scene.add.graphics();
		this.add(background);
		scene.add.existing(this);

		this.drawBackground();

		const textures = this.textures = this.scene.add.image(10, 10, tileset.image).setOrigin(0, 0).setInteractive();//.setScale(0.5);
		this.add(textures);
		console.log(textures);

		const cropWidth = 550;
		const cropHeight = 400;

		const cropped = textures.setCrop(0, 0, cropWidth, cropHeight);
		//textures.setPosition(textures.x -150,textures.y -150);

		console.log('cropped frame', cropped.frame);

		/*this.textures.on('wheel', (pointer, deltaX, deltaY) => {
			this.scroll(deltaY);
			console.log('scroll', deltaX, deltaY);
		});*/

		//this.setSize(textures.width, textures.height);

		//container.setInteractive();

		/*this.scene.input.setDraggable(textures);
		this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
			console.log('drag', dragX, dragY);
			//textures.setCrop(dragX, dragY, cropWidth, cropHeight);
			//gameObject.x = dragX;
			//gameObject.y = dragY;

		});
	}

	private drawBackground (): void {
		const background = this.background;

		const width = 570;
		const height = 420;
		background.fillStyle(0x000000, 1);
		background.fillRect(
			0,
			0,
			width,
			height
		);
	}

	scroll (deltaY: number): void {
		const targetScale = this.textures.scale - (deltaY/1000);
		this.textures.setScale(targetScale);

		const cropWidth = 550;
		const cropHeight = 400;
		this.textures.setCrop(0, 0, cropWidth / targetScale, cropHeight / targetScale);
	}*/

	  /*
	  getRenderTexture(tiles: number[][]) {
		const sourceTexture = this.tileset;
		//const tileWidth = sourceTexture.tileWidth;
		//const tileHeight = sourceTexture.tileHeight;
		const { tileWidth, tileHeight } = sourceTexture;

		const tileIds = tiles;
		const rt = this.scene.make.renderTexture(
		  {
				width: tileIds[0].length * tileWidth,
				height: tileIds.length * tileHeight,
				x: 0,
				y: 0,
		  },
		  false
		);
		for (let y = 0; y < tileIds.length; y++) {
		  // loop X
		  for (let x = 0; x < tileIds[y].length; x++) {
				const tileId = tileIds[y][x];
				const coordinate = (sourceTexture.getTileTextureCoordinates(tileId) || {
			  x: 0,
			  y: 0,
				}) as { x: number; y: number };
				const ft = sourceTexture.image.get().clone();
				const newRT = this.scene.make.renderTexture(
			  {
						width: ft.width,
						height: ft.height,
			  },
			  false
				);
				newRT.draw(ft);
				newRT.setCrop(coordinate.x, coordinate.y, tileWidth, tileHeight)
				rt.draw(
			  newRT,
			  -coordinate.x + x * tileWidth,
			  -coordinate.y + y * tileHeight
				);
		  }
		}
		return rt.texture;
	  }*/
//}

