class DevModeScene extends PhaserScene {

	rexUI: any;
	gameScene: any;

	devModeTools: DevModeTools;
	regionEditor: RegionEditor;

	tilePalette: TilePalette;
	tilemap: Phaser.Tilemaps.Tilemap;
	tileset: Phaser.Tilemaps.Tileset;

	selectedTile: Phaser.Tilemaps.Tile;
	selectedTileArea: Phaser.Tilemaps.Tile[][];

	marker: TileMarker;
	paletteMarker: TileMarker;

	regions: PhaserRegion[];

	defaultZoom: number;
	
	constructor() {
		super({ key: 'DevMode' });
	}

	init (): void {
		this.input.setTopOnly(true);
		this.gameScene = ige.renderer.scene.getScene('Game');
		this.regions = [];
		const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
		this.selectedTile = null;
		this.selectedTileArea = [[null, null],[null, null]];

		ige.client.on('enterDevMode', () => {
			this.enterDevMode();
		});

		ige.client.on('leaveDevMode', () => {
			this.leaveDevMode();
		});

		const tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
		tabKey.on('down', () => {
			if (shouldPreventKeybindings()) {
				this.input.keyboard.disableGlobalCapture();
			} else {
				this.input.keyboard.enableGlobalCapture();
				if(ige.developerMode.active) {
					if (this.tilePalette.visible) {
						this.tilePalette.hide();
					}
					else {
						this.tilePalette.show()
					}
				}
			}
		});

		const shouldPreventKeybindings = function () {
			if (!$('#game-editor').is(':visible')) {
				return false;
			}
			let activeElement = document.activeElement;
			let inputs = ['input', 'select', 'textarea'];
	
			if (activeElement && inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1) {
				return true;
			}
			return false;
		}

		const plusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, false);
		plusKey.on('down', () => {
			if(ige.developerMode.active && !shouldPreventKeybindings()) {
				const zoom = (this.gameScene.zoomSize / 2.15) / 1.1;
				ige.client.emit('zoom', zoom);
			}
		});
		const minusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
		minusKey.on('down', () => {
			if(ige.developerMode.active && !shouldPreventKeybindings()) {
				const zoom =(this.gameScene.zoomSize / 2.15) * 1.1;
				ige.client.emit('zoom', zoom);
			}
		});

		ige.client.on('editTile', (data: TileData) => {
			console.log('editTile', data);
			map.putTileAt(data.gid, data.x, data.y, false, data.layer);

			/* TODO: SAVE MAP DATA FROM SERVER SIDE */
			const width = ige.game.data.map.width;
			//save tile change to ige.game.map.data
			if (ige.game.data.map.layers.length > 4 && data.layer >= 2) data.layer ++;
			ige.game.data.map.layers[data.layer].data[data.y*width + data.x] = data.gid;
			if (ige.physics && ige.game.data.map.layers[data.layer].name === 'walls') {
				//if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
				ige.physics.destroyWalls();
				let map = ige.scaleMap(_.cloneDeep(ige.game.data.map));
				ige.tiled.loadJson(map, function (layerArray, IgeLayersById) {
					ige.physics.staticsFromMap(IgeLayersById.walls);
				})
			}
		});

		ige.client.on('editRegion', (data: RegionData) => {
			this.regionEditor.edit(data);
		});

		this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
			if (this.tilePalette && this.tilePalette.visible) {
				this.tilePalette.zoom(deltaY);
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

		this.load.image('cursor', 'https://cache.modd.io/asset/spriteImage/1666276041347_cursor.png');
		this.load.image('region', 'https://cache.modd.io/asset/spriteImage/1666882309997_region.png');
		this.load.image('stamp', 'https://cache.modd.io/asset/spriteImage/1666724706664_stamp.png');
		this.load.image('eraser', 'https://cache.modd.io/asset/spriteImage/1666276083246_erasergap.png');

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
			/*} else {
				this.tileset = map.addTilesetImage(tileset.name, key);
			}*/
		});

		const gameMap = this.gameScene.tilemap;
		console.log('game map', gameMap)
		gameMap.currentLayerIndex = 0;
		this.selectedTile = gameMap.getTileAt(2, 3);
		this.marker = new TileMarker (this.gameScene, gameMap, 2);
	}

	enterDevMode () {
		this.defaultZoom = (this.gameScene.zoomSize / 2.15)
			if (!this.tilePalette) {
				this.tilePalette = new TilePalette(this, this.tileset, this.rexUI);
				this.devModeTools = new DevModeTools(this, this.tilePalette);
				this.regionEditor = this.devModeTools.regionEditor;
				this.paletteMarker = new TileMarker(this, this.tilePalette.map, 1);
			}
			this.tilePalette.show();
			this.devModeTools.layerButtonsContainer.setVisible(true);
			this.devModeTools.toolButtonsContainer.setVisible(true);
			this.devModeTools.highlightModeButton(0);
			this.activateMarker(false);
			this.regionEditor.showRegions();

	}

	leaveDevMode () {
		this.regionEditor.cancelDrawRegion();
		this.tilePalette.hide();
		this.devModeTools.layerButtonsContainer.setVisible(false);
		this.devModeTools.toolButtonsContainer.setVisible(false);
		this.regionEditor.hideRegions();
		ige.client.emit('zoom', this.defaultZoom);
	}

	putTile (tileX: number, tileY: number, selectedTile: Phaser.Tilemaps.Tile) {
		const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
		if (selectedTile && this.pointerInsideMap(tileX, tileY, map)) {
			let index = selectedTile.index;
			if (selectedTile.index === -1) index = 0;
			if  (index !== (map.getTileAt(tileX, tileY, true)).index &&
			!(index === 0 && map.getTileAt(tileX, tileY, true).index === -1)) {
				map.putTileAt(index, tileX, tileY);
				map.getTileAt(tileX, tileY, true).tint = 0xffffff;
				console.log('place tile', index)
				ige.network.send('editTile', {gid: index, layer: map.currentLayerIndex, x: tileX, y: tileY});
			}
		}
	}

	getTile (tileX: number, tileY: number, selectedTile: Phaser.Tilemaps.Tile, map: Phaser.Tilemaps.Tilemap): Phaser.Tilemaps.Tile {
		if (this.pointerInsideMap(tileX, tileY, map)) {
			if (selectedTile) selectedTile.tint = 0xffffff;
			if (map.getTileAt(tileX, tileY) && map.getTileAt(tileX, tileY).index !== 0) {
				selectedTile = map.getTileAt(tileX, tileY);
				if (map === this.tilePalette.map) selectedTile.tint = 0x87cfff;
			} else {
				selectedTile = null;
			}
			this.activateMarker(true);
			this.devModeTools.highlightModeButton(2);
			return selectedTile;
		}
	}

	activateMarker(active: boolean) {
		this.marker.active = active;
		this.marker.graphics.setVisible(active);
		if (active) this.regionEditor.regionTool = false;
	}

	pointerInsideMap(pointerX: number, pointerY: number, map: Phaser.Tilemaps.Tilemap): boolean {
		return (0 <= pointerX && pointerX < map.width
			&& 0 <= pointerY && pointerY < map.height);
	}

	pointerInsidePalette(): boolean {
		return (this.input.activePointer.x > this.tilePalette.scrollBarContainer.x
			&& this.input.activePointer.x < this.tilePalette.scrollBarContainer.x + this.tilePalette.scrollBarContainer.width
			&& this.input.activePointer.y > this.tilePalette.scrollBarContainer.y - 30
			&& this.input.activePointer.y < this.tilePalette.scrollBarContainer.y + this.tilePalette.scrollBarContainer.height)
	}

	pointerInsideButtons(): boolean {
		return ((this.input.activePointer.x > this.devModeTools.layerButtonsContainer.x
			&& this.input.activePointer.x < this.devModeTools.layerButtonsContainer.x + this.devModeTools.layerButtonsContainer.width
			&& this.input.activePointer.y > this.devModeTools.layerButtonsContainer.y 
			&& this.input.activePointer.y < this.devModeTools.layerButtonsContainer.y + this.devModeTools.layerButtonsContainer.height)
			|| (this.input.activePointer.x > this.devModeTools.toolButtonsContainer.x
			&& this.input.activePointer.x < this.devModeTools.toolButtonsContainer.x + this.devModeTools.toolButtonsContainer.width
			&& this.input.activePointer.y > this.devModeTools.toolButtonsContainer.y 
			&& this.input.activePointer.y < this.devModeTools.toolButtonsContainer.y + this.devModeTools.toolButtonsContainer.height))
	}

	update (): void {
		if(ige.developerMode.active) {
			const palette = this.tilePalette;
			const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
			const paletteMap = palette.map;
			const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
			const palettePoint = this.cameras.getCamera('palette').getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
			const marker = this.marker;
			const paletteMarker = this.paletteMarker;

			paletteMarker.graphics.clear();
			paletteMarker.graphics.strokeRect(0, 0, paletteMap.tileWidth * palette.texturesLayer.scaleX, paletteMap.tileHeight * palette.texturesLayer.scaleY);
			paletteMarker.graphics.setVisible(true);

			// Rounds down to nearest tile
			const palettePointerTileX = paletteMap.worldToTileX(palettePoint.x);
			const palettePointerTileY = paletteMap.worldToTileY(palettePoint.y);

			if (palette.visible	&& this.pointerInsidePalette()) {
				marker.graphics.setVisible(false);
				// Snap to tile coordinates, but in world space
				paletteMarker.graphics.x = paletteMap.tileToWorldX(palettePointerTileX);
				paletteMarker.graphics.y = paletteMap.tileToWorldY(palettePointerTileY);

				if (this.input.manager.activePointer.isDown) {
					if (palette.area.x > 1 || palette.area.y > 1) {
						for (let i = 0; i < palette.area.x; i++) {
							for (let j = 0; j < palette.area.y; j++) {
								this.selectedTileArea[i][j] = this.getTile(palettePointerTileX + i, palettePointerTileY + j, this.selectedTileArea[i][j], paletteMap);
							}
						}
					} else {
						this.selectedTile = this.getTile(palettePointerTileX, palettePointerTileY, this.selectedTile, paletteMap);
					}
				}
			} else if ((!this.pointerInsidePalette() || !palette.visible) &&
				!this.pointerInsideButtons() && marker.active) {
				paletteMarker.graphics.setVisible(false);
				marker.graphics.setVisible(true);
				// Rounds down to nearest tile
				const pointerTileX = map.worldToTileX(worldPoint.x);
				const pointerTileY = map.worldToTileY(worldPoint.y);

				// Snap to tile coordinates, but in world space
				marker.graphics.x = map.tileToWorldX(pointerTileX);
				marker.graphics.y = map.tileToWorldY(pointerTileY);

				if (this.input.manager.activePointer.rightButtonDown()) {
					if (palette.area.x > 1 || palette.area.y > 1) {
						for (let i = 0; i < palette.area.x; i++) {
							for (let j = 0; j < palette.area.y; j++) {
								this.selectedTileArea[i][j] = this.getTile(pointerTileX + i, pointerTileY + j, this.selectedTileArea[i][j], map);
							}
						}
					} else {
						this.selectedTile = this.getTile(pointerTileX, pointerTileY, this.selectedTile, map);
					}
				}

				if (this.input.manager.activePointer.leftButtonDown()) {
					if (palette.area.x > 1 || palette.area.y > 1) {
						for (let i = 0; i < palette.area.x; i++) {
							for (let j = 0; j < palette.area.y; j++) {
								this.putTile(pointerTileX + i, pointerTileY + j, this.selectedTileArea[i][j]);
							}
						}
					}
					else {
						this.putTile(pointerTileX, pointerTileY, this.selectedTile);
					}
				}
			}
		}
		else this.marker.graphics.setVisible(false);
	}

}
