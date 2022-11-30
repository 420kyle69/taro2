class TilePalette extends Phaser.GameObjects.Container {

	private readonly tileset: Phaser.Tilemaps.Tileset;

	scene: DevModeScene;
	texturesLayer: any;
	map: Phaser.Tilemaps.Tilemap;
	camera: Phaser.Cameras.Scene2D.Camera;
	rexUI: any;

	scrollBarContainer: Phaser.GameObjects.Container;
	scrollBarBottom: any;
	scrollBarRight: any;

	COLOR_DARK: number;
	COLOR_LIGHT: number;
	COLOR_PRIMARY: number;

	paletteWidth: number;
	paletteHeight: number;
	
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

		// Load a map from a 2D array of tile indices
		const paletteMap = [];
		for (let i = 0; i < tileset.rows; i++) {
			paletteMap.push([]);
		}
		for (let i = 0; i < tileset.total; i++) {
			paletteMap[Math.floor(i/tileset.columns)].push(i+1);
		}

		// When loading from an array, make sure to specify the tileWidth and tileHeight
		const map = this.map = this.scene.make.tilemap({ key: 'palette', data: paletteMap, tileWidth: 16, tileHeight: 16 });
		const texturesLayer = this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive();
		this.x = -texturesLayer.width;
		this.y = 0;
		texturesLayer.setPosition(this.x, this.y);
		scene.add.existing(texturesLayer);

		const paletteWidth = this.paletteWidth = this.scene.sys.game.canvas.width * 0.25;
		const paletteHeight = this.paletteHeight = this.scene.sys.game.canvas.height * 0.25;
		const camera = this.camera = this.scene.cameras.add(this.scene.sys.game.canvas.width - paletteWidth - 40,
			this.scene.sys.game.canvas.height - paletteHeight - 40,	paletteWidth, paletteHeight)
			.setBounds(texturesLayer.x - (texturesLayer.width/2), texturesLayer.y - (texturesLayer.height/2),
			texturesLayer.width * 2, texturesLayer.height * 2, true)
			.setZoom(1).setName('palette');

		camera.setBackgroundColor(0x000000);

		texturesLayer.on('pointermove', function (p) {
			const devModeScene = ige.renderer.scene.getScene('DevMode') as DevModeScene;
            devModeScene.regionEditor.cancelDrawRegion();
			if (!p.isDown) return;
			const scrollX = (p.x - p.prevPosition.x) / camera.zoom
			const scrollY = (p.y - p.prevPosition.y) / camera.zoom;
			camera.scrollX -= scrollX;
			camera.scrollY -= scrollY;

			let bottomValue = (camera.scrollX - camera.getBounds().x) / (camera.getBounds().width - camera.width);
			let rightValue = (camera.scrollY - camera.getBounds().y) / (camera.getBounds().height - camera.height);

			if (bottomValue > 1) bottomValue = 1;
			if (rightValue > 1) rightValue = 1;
			if (bottomValue < 0) bottomValue = 0;
			if (rightValue < 0) rightValue = 0;
			
			scrollBarBottom.blocked = true;
			scrollBarRight.blocked = true;
			scrollBarBottom.value = bottomValue;
			scrollBarRight.value = rightValue;
			scrollBarBottom.blocked = false;
			scrollBarRight.blocked = false;
		});

		this.COLOR_PRIMARY = 0x0036cc;
		this.COLOR_LIGHT = 0x6690ff;
		this.COLOR_DARK = 0xffffff;

		const scrollBarContainer = this.scrollBarContainer = new Phaser.GameObjects.Container(scene);
		scene.add.existing(scrollBarContainer);
		scrollBarContainer.x = camera.x;
		scrollBarContainer.y = camera.y;

		const scrollBarBottom = this.scrollBarBottom = this.addScrollBar('x');
		const scrollBarRight = this.scrollBarRight = this.addScrollBar('y');

		scrollBarContainer.width = camera.width + scrollBarRight.width + 60;
		scrollBarContainer.height = camera.height + scrollBarBottom.height + 60;

		this.scene.scale.on(Phaser.Scale.Events.RESIZE, () => {
			camera.x = this.scene.sys.game.canvas.width - paletteWidth - 40;
			scrollBarContainer.x = this.camera.x;
		});

		let pointerover;
		texturesLayer.on('pointerover', (p) => {
			pointerover =  true;
		});
		texturesLayer.on('pointerout', (p) => {
			pointerover =  false;
		});

		this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
			if (ige.developerMode.active && ige.developerMode.activeTab !== 'play') {
				if (this.visible && pointerover) {
					this.zoom(deltaY);
				} else if (deltaY < 0) {
					const zoom = (this.scene.gameScene.zoomSize / 2.15) / 1.1;
					ige.client.emit('zoom', zoom);
				} else if (deltaY > 0) {
					const zoom = (this.scene.gameScene.zoomSize / 2.15) * 1.1;
					ige.client.emit('zoom', zoom);
				}
			}
		})
	}

	toggle(): void {
		if (this.visible) this.hide();
		else this.show()
	}

	hide (): void {
		this.setVisible(false);
		this.texturesLayer.setVisible(false);
		this.camera.setVisible(false);
		this.scrollBarContainer.setVisible(false);
	}

	show (): void {
		this.setVisible(true);
		this.texturesLayer.setVisible(true);
		this.camera.setVisible(true);
		this.scrollBarContainer.setVisible(true);
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

	addScrollBar(orient: string): any {
		let orientSize;
		let length;
		let thumbWidth;
		let thumbHeight;
		let posX = 0;
		let posY = 0;

		if (orient === 'x') {
			orientSize = 'width';
			length = this.camera.width;
			thumbWidth = (length - 60) / 2;
			thumbHeight = 20;
			posY = this.camera.height;
		}
		else if (orient === 'y') {
			orientSize = 'height';
			length = this.camera.height;
			thumbWidth = 20;
			thumbHeight = (length - 60) / 2;
			posX = this.camera.width;
		}
		const scrollBar = this.rexUI.add.scrollBar({
			[orientSize]: length,
			orientation: orient,
			background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, this.COLOR_DARK),
			buttons: {
				left: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, this.COLOR_PRIMARY),
				right: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, this.COLOR_PRIMARY),
			},
			slider: {
				thumb: this.rexUI.add.roundRectangle(0, 0, thumbWidth, thumbHeight, 1, this.COLOR_LIGHT),
			},
			space: {
				left: 1, right: 1, top: 1, bottom: 1
			}
		});
		scrollBar.value = 0.5;
		this.scrollBarContainer.add(scrollBar);
		scrollBar.setPosition(posX, posY).setOrigin(0, 0).setScrollFactor(0,0).layout();

		scrollBar.on('valuechange',
			function (newValue, oldValue, scrollBar) {
				if (!isNaN(newValue) && !scrollBar.blocked) {
					newValue -= 0.5;
					if (orient === 'x') this.camera.scrollX = this.x + (this.camera.width * newValue);
					else if (orient === 'y') this.camera.scrollY = this.y + (this.camera.height * newValue);
				}
			},
			this
		);

		return scrollBar;
	}
}
