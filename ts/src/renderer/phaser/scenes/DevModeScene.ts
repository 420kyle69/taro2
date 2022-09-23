class DevModeScene extends PhaserScene {

	devPalette: PhaserPalette;
	tilemap: Phaser.Tilemaps.Tilemap;
	selectedTile: Phaser.Tilemaps.Tile;
	paletteMarker: any;
	rexUI: any;
	gameScene: any;
	tileset: Phaser.Tilemaps.Tileset;
	marker: Phaser.GameObjects.Graphics;
	defaultZoom: number;

	constructor() {
		super({ key: 'Palette' });
	}

	init (): void {
		console.log('palette scene init');
		this.gameScene = ige.renderer.scene.getScene('Game');
		//const map = this.devPalette.map;
		const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
		this.selectedTile = map.getTileAt(2, 3);

		ige.client.on('enterDevMode', () => {
			this.defaultZoom = (this.gameScene.zoomSize / 2.15)
			if (!this.devPalette) {
				this.devPalette = new PhaserPalette(this, this.tileset, this.rexUI);
		 		this.paletteMarker = this.add.graphics();
				this.paletteMarker.lineStyle(2, 0x000000, 1);
				this.paletteMarker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
				this.paletteMarker.setVisible(false);
				this.devPalette.hide();
				this.devPalette.layerButtonsContainer.setVisible(true);
			}
			else this.devPalette.layerButtonsContainer.setVisible(true);
		});

		ige.client.on('leaveDevMode', () => {
			this.devPalette.hide();
			this.devPalette.layerButtonsContainer.setVisible(false);
			ige.client.emit('zoom', this.defaultZoom);
		});

		const tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
		tabKey.on('down', () => {
			if(ige.developerMode.active) {
				if (this.devPalette.visible) {
					this.devPalette.hide();
				}
				else {
					this.devPalette.show()
				}
			}
		});
		const plusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, true);
		plusKey.on('down', () => {
			if(ige.developerMode.active) {
				const zoom = (this.gameScene.zoomSize / 2.15) / 1.1;
				ige.client.emit('zoom', zoom);
			}
		});
		const minusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, true);
		minusKey.on('down', () => {
			if(ige.developerMode.active) {
				const zoom =(this.gameScene.zoomSize / 2.15) * 1.1;
				ige.client.emit('zoom', zoom);
			}
		});

		ige.client.on('editTile', (data: {
			gid: number,
			x: number,
			y: number
		}) => {
			map.putTileAt(data.gid, data.x, data.y);
			ige.developerMode.changedTiles.push(data);
		});

		this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
			if (this.devPalette && this.devPalette.visible) {
				this.devPalette.zoom(deltaY);
			}
		})
	}

	preload (): void {
		/*const data = ige.game.data;

		data.map.tilesets.forEach((tileset) => {
			const key = `tiles/${tileset.name}`;
			this.load.once(`filecomplete-image-${key}`, () => {
				const texture = this.textures.get(key);
				const canvas = this.mainScene.extrude(tileset,
					texture.getSourceImage() as HTMLImageElement
				);
				if (canvas) {
					this.textures.remove(texture);
					this.textures.addCanvas(`extruded-${key}`, canvas);
				}
			});
			this.load.image(key, this.patchAssetUrl(tileset.image));
		});*/

		this.load.scenePlugin(
			'rexuiplugin',
			'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
			//'src/renderer/phaser/rexuiplugin.min.js',
			'rexUI',
			'rexUI'
		  );
	}

	create(): void {
		const data = ige.game.data;
		const map = this.tilemap = this.make.tilemap({ key: 'map' });
		
		data.map.tilesets.forEach((tileset) => {
			const key = `tiles/${tileset.name}`;
			const extrudedKey = `extruded-${key}`;
			//if (this.textures.exists(extrudedKey)) {
				this.tileset = map.addTilesetImage(tileset.name, extrudedKey,
					tileset.tilewidth, tileset.tileheight,
					(tileset.margin || 0) + 1,
					(tileset.spacing || 0) + 2
				);
				console.log(this.tileset);
			/*} else {
				this.tileset = map.addTilesetImage(tileset.name, key);
			}*/
		});

		const gameMap = this.gameScene.tilemap;
		gameMap.currentLayerIndex = 0;
		this.selectedTile = gameMap.getTileAt(2, 3);
		this.marker = this.gameScene.add.graphics();
		this.marker.lineStyle(2, 0x000000, 1);
		this.marker.strokeRect(0, 0, gameMap.tileWidth, gameMap.tileHeight);
		this.marker.setVisible(false);
	}

	update (): void {
		if(ige.developerMode.active) {
			const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
			const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
			const palettePoint = this.cameras.getCamera('palette').getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
			this.paletteMarker.clear();
			this.paletteMarker.strokeRect(0, 0, this.devPalette.map.tileWidth * this.devPalette.texturesLayer.scaleX, this.devPalette.map.tileHeight * this.devPalette.texturesLayer.scaleY);
			this.paletteMarker.setVisible(true);
			// Rounds down to nearest tile
			const palettePointerTileX = this.devPalette.map.worldToTileX(palettePoint.x);
			const palettePointerTileY = this.devPalette.map.worldToTileY(palettePoint.y);

			if (this.devPalette.visible
				&& 0 <= palettePointerTileX
				&& palettePointerTileX < 27
				&& 0 <= palettePointerTileY
				&& palettePointerTileY < 20
				&& this.input.activePointer.x > this.devPalette.scrollBarContainer.x
				&& this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
				&& this.input.activePointer.y > this.devPalette.scrollBarContainer.y - 30
				&& this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height) {
				this.marker.setVisible(false);
				// Snap to tile coordinates, but in world space
				this.paletteMarker.x = this.devPalette.map.tileToWorldX(palettePointerTileX);
				this.paletteMarker.y = this.devPalette.map.tileToWorldY(palettePointerTileY);

				if (this.input.manager.activePointer.isDown) {
					this.selectedTile.tint = 0xffffff;
					this.selectedTile = this.devPalette.map.getTileAt(palettePointerTileX, palettePointerTileY, true);
					this.selectedTile.tint = 0x87cfff;
				}
			} else if (!(this.input.activePointer.x > this.devPalette.scrollBarContainer.x
				&& this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
				&& this.input.activePointer.y > this.devPalette.scrollBarContainer.y - 30
				&& this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height)
				|| !this.devPalette.visible) {
				this.paletteMarker.setVisible(false);
				this.marker.setVisible(true);
				// Rounds down to nearest tile
				const pointerTileX = map.worldToTileX(worldPoint.x);
				const pointerTileY = map.worldToTileY(worldPoint.y);

				// Snap to tile coordinates, but in world space
				this.marker.x = map.tileToWorldX(pointerTileX);
				this.marker.y = map.tileToWorldY(pointerTileY);

				if (this.input.manager.activePointer.rightButtonDown()) {
					if (map.getTileAt(pointerTileX, pointerTileY, true) !== null) {
						this.selectedTile.tint = 0xffffff;
						this.selectedTile = map.getTileAt(pointerTileX, pointerTileY, true);
					}
				}

				if (this.input.manager.activePointer.leftButtonDown()
				&& (pointerTileX >= 0 && pointerTileY >= 0
				&& pointerTileX < map.width
				&& pointerTileY < map.height)
				&& this.selectedTile.index !== (map.getTileAt(pointerTileX, pointerTileY, true)).index) {
					map.putTileAt(this.selectedTile, pointerTileX, pointerTileY);
					map.getTileAt(pointerTileX, pointerTileY, true).tint = 0xffffff;
					console.log('place tile', this.selectedTile.index)
					ige.network.send('editTile', {gid: this.selectedTile.index, layer: map.currentLayerIndex, x: pointerTileX, y: pointerTileY});
				}
			}
		}
		else this.marker.setVisible(false);
	}

}
