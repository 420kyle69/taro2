class DevModeScene extends PhaserScene {

	devPalette: PhaserPalette;
	tilemap: Phaser.Tilemaps.Tilemap;
	selectedTile: Phaser.Tilemaps.Tile;
	paletteMarker: any;
	rexUI: any;
	gameScene: any;
	tileset: Phaser.Tilemaps.Tileset;
	marker: Phaser.GameObjects.Graphics;

	constructor() {
		super({ key: 'Palette' });
	}

	init (): void {
		console.log('palette scene init');
		this.gameScene = ige.renderer.scene.getScene('Game') as any;

		ige.client.on('enterDevMode', () => {
			if (this.devPalette) {
				this.devPalette.setVisible(true);
				this.devPalette.texturesLayer.setVisible(true);
				this.devPalette.camera.setVisible(true);
				this.devPalette.scrollBarContainer.setVisible(true);
			} else {
				console.log(this.tileset);
				this.devPalette = new PhaserPalette(this, this.tileset, this.rexUI);
				this.gameScene.devPalette = this.devPalette;
				const map = this.devPalette.map;
				this.selectedTile = map.getTileAt(2, 3);
		 		this.paletteMarker = this.add.graphics();
				this.paletteMarker.lineStyle(2, 0x000000, 1);
				this.paletteMarker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
				this.paletteMarker.setVisible(false);
			}
		});

		ige.client.on('leaveDevMode', () => {
			this.devPalette.setVisible(false);
			this.devPalette.texturesLayer.setVisible(false);
			this.devPalette.camera.setVisible(false);
			this.devPalette.scrollBarContainer.setVisible(false);
		});

		ige.client.on('updateTile', (data: {
			gid: number,
			x: number,
			y: number
		}) => {
			console.log('updateTile', data);
			this.gameScene.tilemap.putTileAt(data.gid, data.x, data.y);
		});

		this.input.on('pointerdown', function (pointer) {
			if(ige.developerMode.active) {
				const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
				const palettePoint = this.cameras.getCamera('palette').getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
				// Rounds down to nearest tile
				const palettePointerTileX = this.devPalette.map.worldToTileX(palettePoint.x);
				const palettePointerTileY = this.devPalette.map.worldToTileY(palettePoint.y);

				if (0 <= palettePointerTileX
					&& palettePointerTileX < 27
					&& 0 <= palettePointerTileY
					&& palettePointerTileY < 20
					&& this.input.activePointer.x > this.devPalette.scrollBarContainer.x
					&& this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
					&& this.input.activePointer.y > this.devPalette.scrollBarContainer.y
					&& this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height) {
					this.marker.setVisible(false);
					// Snap to tile coordinates, but in world space
					this.paletteMarker.x = this.devPalette.map.tileToWorldX(palettePointerTileX);
					this.paletteMarker.y = this.devPalette.map.tileToWorldY(palettePointerTileY);

					//if (pointer.rightButtonDown()) {
						this.selectedTile = this.devPalette.map.getTileAt(palettePointerTileX, palettePointerTileY);
					//}
				} else if (!(this.input.activePointer.x > this.devPalette.scrollBarContainer.x
					&& this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
					&& this.input.activePointer.y > this.devPalette.scrollBarContainer.y
					&& this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height)) {
					this.paletteMarker.setVisible(false);
					this.marker.setVisible(true);
					// Rounds down to nearest tile
					const pointerTileX = this.gameScene.tilemap.worldToTileX(worldPoint.x);
					const pointerTileY = this.gameScene.tilemap.worldToTileY(worldPoint.y);

					// Snap to tile coordinates, but in world space
					this.marker.x = this.gameScene.tilemap.tileToWorldX(pointerTileX);
					this.marker.y = this.gameScene.tilemap.tileToWorldY(pointerTileY);
					if (pointer.rightButtonDown()) {
						this.selectedTile = this.gameScene.tilemap.getTileAt(pointerTileX, pointerTileY);
					}

					if (pointer.leftButtonDown()) {
						this.gameScene.tilemap.putTileAt(this.selectedTile, pointerTileX, pointerTileY);
						ige.network.send("editTile", {gid: this.selectedTile.index, pointerTileX, pointerTileY})
					}
				}
			}
		}, this);

		this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
			if (this.devPalette && this.devPalette.visible) {
				this.devPalette.zoom(pointer, deltaY);
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

	/*updateTile (gid:integer, x:integer, y:integer): void {
		this.gameScene.tilemap.putTileAt(gid, x, y);
	}*/

	update (): void {
		if(ige.developerMode.active) {
			const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
			const palettePoint = this.cameras.getCamera('palette').getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
			this.paletteMarker.clear();
			this.paletteMarker.strokeRect(0, 0, this.devPalette.map.tileWidth * this.devPalette.texturesLayer.scaleX, this.devPalette.map.tileHeight * this.devPalette.texturesLayer.scaleY);
			this.paletteMarker.setVisible(true);
			// Rounds down to nearest tile
			const palettePointerTileX = this.devPalette.map.worldToTileX(palettePoint.x);
			const palettePointerTileY = this.devPalette.map.worldToTileY(palettePoint.y);

			if (0 <= palettePointerTileX
				&& palettePointerTileX < 27
				&& 0 <= palettePointerTileY
				&& palettePointerTileY < 20
				&& this.input.activePointer.x > this.devPalette.scrollBarContainer.x
				&& this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
				&& this.input.activePointer.y > this.devPalette.scrollBarContainer.y
				&& this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height) {
				this.marker.setVisible(false);
				// Snap to tile coordinates, but in world space
				this.paletteMarker.x = this.devPalette.map.tileToWorldX(palettePointerTileX);
				this.paletteMarker.y = this.devPalette.map.tileToWorldY(palettePointerTileY);

				/*if (this.input.manager.activePointer.rightButtonDown()) {
					this.selectedTile = this.devPalette.map.getTileAt(palettePointerTileX, palettePointerTileY);
				}*/
			} else if (!(this.input.activePointer.x > this.devPalette.scrollBarContainer.x
				&& this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
				&& this.input.activePointer.y > this.devPalette.scrollBarContainer.y
				&& this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height)) {
				this.paletteMarker.setVisible(false);
				this.marker.setVisible(true);
				// Rounds down to nearest tile
				const pointerTileX = this.gameScene.tilemap.worldToTileX(worldPoint.x);
				const pointerTileY = this.gameScene.tilemap.worldToTileY(worldPoint.y);

				// Snap to tile coordinates, but in world space
				this.marker.x = this.gameScene.tilemap.tileToWorldX(pointerTileX);
				this.marker.y = this.gameScene.tilemap.tileToWorldY(pointerTileY);
				//console.log('palette scene', this.marker.x, this.marker.y);
				/*if (this.input.manager.activePointer.rightButtonDown()) {
					this.selectedTile = this.gameScene.tilemap.getTileAt(pointerTileX, pointerTileY);
				}

				if (this.input.manager.activePointer.leftButtonDown()) {
					this.gameScene.tilemap.putTileAt(this.selectedTile, pointerTileX, pointerTileY);
					ige.network.send("editTile", {gid: this.selectedTile.index, pointerTileX, pointerTileY})
				}*/
			}
		}
		else this.marker.setVisible(false);
	}

}
