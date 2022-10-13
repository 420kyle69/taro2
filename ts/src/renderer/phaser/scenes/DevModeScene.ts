class DevModeScene extends PhaserScene {

	devPalette: PhaserPalette;
	tilemap: Phaser.Tilemaps.Tilemap;
	selectedTile: Phaser.Tilemaps.Tile;
	selectedTileArea: Phaser.Tilemaps.Tile[][];
	paletteMarker: Phaser.GameObjects.Graphics;
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
		this.input.setTopOnly(true);
		this.gameScene = ige.renderer.scene.getScene('Game');
		//const map = this.devPalette.map;
		const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
		this.selectedTile = map.getTileAt(2, 3, true);
		this.selectedTileArea = [[map.getTileAt(2, 3, true), map.getTileAt(2, 4, true)],[map.getTileAt(3, 3, true), map.getTileAt(3, 4, true)]];
		console.log('tile', this.selectedTile, 'area', this.selectedTileArea);

		ige.client.on('enterDevMode', () => {
			this.defaultZoom = (this.gameScene.zoomSize / 2.15)
			if (!this.devPalette) {
				console.log('creating...', this, this.tileset, this.rexUI)
				this.devPalette = new PhaserPalette(this, this.tileset, this.rexUI);
		 		this.paletteMarker = this.add.graphics();
				this.paletteMarker.lineStyle(1, 0x000000, 1);
				this.paletteMarker.strokeRect(0, 0, this.devPalette.map.tileWidth, this.devPalette.map.tileHeight);
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
			layer: number,
			x: number,
			y: number
		}) => {
			console.log('editTile', data);
			map.putTileAt(data.gid, data.x, data.y, false, data.layer);
			//ige.developerMode.changedTiles.push(data);

			/* TODO: SAVE MAP DATA FROM SERVER SIDE */
			const width = ige.game.data.map.width;
			//save tile change to ige.game.map.data
			if (data.layer >= 2) data.layer ++;
			ige.game.data.map.layers[data.layer].data[data.y*width + data.x] = data.gid;
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
		console.log('game map', gameMap)
		gameMap.currentLayerIndex = 0;
		this.selectedTile = gameMap.getTileAt(2, 3);
		this.marker = this.gameScene.add.graphics();
		this.marker.lineStyle(2, 0x000000, 1);
		if (ige.game.data.defaultData.dontResize) {
			this.marker.strokeRect(0, 0, gameMap.tileWidth, gameMap.tileHeight);
		} else {
			this.marker.strokeRect(0, 0, 64, 64);
		}
		this.marker.setVisible(false);
	}

	pointerInsideMap(pointerX: number, pointerY: number, map: Phaser.Tilemaps.Tilemap): boolean {
		return (0 <= pointerX && pointerX < map.width
			&& 0 <= pointerY && pointerY < map.height);
	}

	pointerInsidePalette(): boolean {
		return (this.input.activePointer.x > this.devPalette.scrollBarContainer.x
			&& this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
			&& this.input.activePointer.y > this.devPalette.scrollBarContainer.y - 30
			&& this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height)
	}

	pointerInsideButtons(): boolean {
		return (this.input.activePointer.x > this.devPalette.layerButtonsContainer.x
			&& this.input.activePointer.x < this.devPalette.layerButtonsContainer.x + this.devPalette.layerButtonsContainer.width
			&& this.input.activePointer.y > this.devPalette.layerButtonsContainer.y - this.devPalette.layerButtonsContainer.height
			&& this.input.activePointer.y < this.devPalette.layerButtonsContainer.y)
	}

	update (): void {
		if(ige.developerMode.active) {
			const palette = this.devPalette;
			const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
			const paletteMap = palette.map;
			const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
			const palettePoint = this.cameras.getCamera('palette').getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
			const marker = this.marker;
			const paletteMarker = this.paletteMarker;

			paletteMarker.clear();
			paletteMarker.strokeRect(0, 0, paletteMap.tileWidth * palette.texturesLayer.scaleX, paletteMap.tileHeight * palette.texturesLayer.scaleY);
			paletteMarker.setVisible(true);

			// Rounds down to nearest tile
			const palettePointerTileX = paletteMap.worldToTileX(palettePoint.x);
			const palettePointerTileY = paletteMap.worldToTileY(palettePoint.y);

			if (palette.visible	&& this.pointerInsidePalette()) {
				marker.setVisible(false);
				// Snap to tile coordinates, but in world space
				paletteMarker.x = paletteMap.tileToWorldX(palettePointerTileX);
				paletteMarker.y = paletteMap.tileToWorldY(palettePointerTileY);

				if (this.input.manager.activePointer.isDown) {
					if (palette.area.x > 1 || palette.area.y > 1) {
						for (let i = 0; i < palette.area.x; i++) {
							for (let j = 0; j < palette.area.y; j++) {
								if (this.pointerInsideMap(palettePointerTileX + i, palettePointerTileY + j, paletteMap)) {
									//this.selectedTileArea[i][j].tint = 0xffffff;
									this.selectedTileArea[i][j] = paletteMap.getTileAt(palettePointerTileX + i, palettePointerTileY + j, true);
									//this.selectedTileArea[i][j].tint = 0x87cfff;
								}
							}
						}
					} else {
						if (this.pointerInsideMap(palettePointerTileX, palettePointerTileY, paletteMap)) {
							//this.selectedTile.tint = 0xffffff;
							this.selectedTile = paletteMap.getTileAt(palettePointerTileX, palettePointerTileY, true);
							//this.selectedTile.tint = 0x87cfff;
						}
					}
				}
			} else if ((!this.pointerInsidePalette() || !palette.visible) &&
				!this.pointerInsideButtons()) {
				paletteMarker.setVisible(false);
				marker.setVisible(true);
				// Rounds down to nearest tile
				const pointerTileX = map.worldToTileX(worldPoint.x);
				const pointerTileY = map.worldToTileY(worldPoint.y);

				// Snap to tile coordinates, but in world space
				marker.x = map.tileToWorldX(pointerTileX);
				marker.y = map.tileToWorldY(pointerTileY);

				if (this.input.manager.activePointer.rightButtonDown()) {
					if (palette.area.x > 1 || palette.area.y > 1) {
						for (let i = 0; i < palette.area.x; i++) {
							for (let j = 0; j < palette.area.y; j++) {
								if (this.pointerInsideMap(pointerTileX + i, pointerTileY + j, map)) {
									//this.selectedTileArea[i][j].tint = 0xffffff;
									this.selectedTileArea[i][j] = map.getTileAt(pointerTileX + i, pointerTileY + j, true);
								} 
							}
						}
					} else {
						if (this.pointerInsideMap(pointerTileX, pointerTileY, map)) {
							//this.selectedTile.tint = 0xffffff;
							this.selectedTile = map.getTileAt(pointerTileX, pointerTileY, true);
						} 
					}
				}

				if (this.input.manager.activePointer.leftButtonDown()) {
					if (palette.area.x > 1 || palette.area.y > 1) {
						for (let i = 0; i < palette.area.x; i++) {
							for (let j = 0; j < palette.area.y; j++) {
								if (this.pointerInsideMap(pointerTileX + i, pointerTileY + j, map) /*&& map.getTileAt(pointerTileX + i, pointerTileY + j)*/
									&& this.selectedTileArea[i][j].index !== (map.getTileAt(pointerTileX + i, pointerTileY + j, true)).index) {
										if (this.selectedTileArea[i][j].index === -1) this.selectedTile.index = 0;
										map.putTileAt(this.selectedTileArea[i][j], pointerTileX + i, pointerTileY + j);
										//map.getTileAt(pointerTileX + i, pointerTileY + j, true).tint = 0xffffff;
										console.log('place tile', this.selectedTileArea[i][j].index)
										ige.network.send('editTile', {gid: this.selectedTileArea[i][j].index, layer: map.currentLayerIndex, x: pointerTileX + i, y: pointerTileY + j});
									}
							}
						}
					}
					else {
						if (this.pointerInsideMap(pointerTileX, pointerTileY, map) /*&& map.getTileAt(pointerTileX, pointerTileY)*/
							&& (!map.getTileAt(pointerTileX, pointerTileY) || this.selectedTile.index !== (map.getTileAt(pointerTileX, pointerTileY, true)).index)) {
								if (this.selectedTile.index === -1) this.selectedTile.index = 0;
								//const prevTile = map.getTileAt(pointerTileX, pointerTileY, true).index;
								//console.log('prev tile', prevTile)
								map.putTileAt(this.selectedTile, pointerTileX, pointerTileY);
								//map.getTileAt(pointerTileX, pointerTileY, true).tint = 0xffffff;
								console.log('place tile', this.selectedTile.index/*, 'instead of', prevTile*/)
								ige.network.send('editTile', {gid: this.selectedTile.index, layer: map.currentLayerIndex, x: pointerTileX, y: pointerTileY});
						}
					}
				}
			}
		}
		else this.marker.setVisible(false);
	}

}
