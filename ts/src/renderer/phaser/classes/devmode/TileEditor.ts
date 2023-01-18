class TileEditor {
    gameScene: GameScene;
    devModeTools: DevModeTools;
    tilePalette: TilePalette;

    marker: TileMarker;
	paletteMarker: TileMarker;

    area: { x: number, y: number };
    selectedTile: Phaser.Tilemaps.Tile;
	selectedTileArea: Phaser.Tilemaps.Tile[][];
	lastSelectedTile: Phaser.Tilemaps.Tile;
	lastSelectedTileArea: Phaser.Tilemaps.Tile[][];

	startDragIn: string;

	constructor (
        gameScene: GameScene, devModeScene: DevModeScene, devModeTools: DevModeTools
	) {
        this.gameScene = gameScene;
        this.devModeTools = devModeTools;
        const palette = this.tilePalette = this.devModeTools.palette;

        const gameMap = this.gameScene.tilemap;

        this.marker = new TileMarker (this.gameScene, gameMap, 2);
        this.paletteMarker = new TileMarker(this.devModeTools.scene, this.tilePalette.map, 1);

        this.area = {x: 1, y: 1};

        this.selectedTile = null;
		this.selectedTileArea = [[null, null],[null, null]];

		const pointerPosition = {x: 0, y: 0}

		let startDragIn = this.startDragIn = 'none';

		devModeScene.input.on('pointerdown', (p) => {
			if (!devModeScene.pointerInsideButtons() && 
				!devModeScene.pointerInsideWidgets() &&
				palette.visible	&& devModeScene.pointerInsidePalette()) {
					startDragIn = 'palette';
					pointerPosition.x = devModeScene.input.activePointer.x;
					pointerPosition.y = devModeScene.input.activePointer.y;
				}
		});

		gameScene.input.on('pointerdown', (p) => {
			if (!devModeScene.pointerInsideButtons() && 
				!devModeScene.pointerInsideWidgets() && 
				this.marker.active && this.gameScene.tilemap.currentLayerIndex >=0 && 
				devModeScene.input.manager.activePointer.rightButtonDown() && 
				!this.devModeTools.modeButtons[3].active) {
					startDragIn = 'map';
					pointerPosition.x = gameScene.input.activePointer.x;
					pointerPosition.y = gameScene.input.activePointer.y;
				}
		});

		devModeScene.input.on('pointerup', (p) => {
			if (startDragIn === 'palette' && 
				Math.abs(pointerPosition.x - devModeScene.input.activePointer.x) < 50 &&
				Math.abs(pointerPosition.y - devModeScene.input.activePointer.y) < 50) {
					const palettePoint = devModeScene.cameras.getCamera('palette').getWorldPoint(devModeScene.input.activePointer.x, devModeScene.input.activePointer.y);
					const palettePointerTileX = palette.map.worldToTileX(palettePoint.x);
					const palettePointerTileY = palette.map.worldToTileY(palettePoint.y);
						this.devModeTools.brush();
						if (this.area.x > 1 || this.area.y > 1) {
							for (let i = 0; i < this.area.x; i++) {
								for (let j = 0; j < this.area.y; j++) {
									this.selectedTileArea[i][j] = this.getTile(palettePointerTileX + i, palettePointerTileY + j, this.selectedTileArea[i][j], palette.map);
								}
							}
						} else {
							this.selectedTile = this.getTile(palettePointerTileX, palettePointerTileY, this.selectedTile, palette.map);
						}
				}
			if (startDragIn === 'palette') {
				startDragIn = 'none';
			}
		});

		gameScene.input.on('pointerup', (p) => {
			if (startDragIn === 'map' && 
				Math.abs(pointerPosition.x - gameScene.input.activePointer.x) < 50 &&
				Math.abs(pointerPosition.y - gameScene.input.activePointer.y) < 50 && 
				!this.devModeTools.modeButtons[3].active) {
					const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
					const pointerTileX = gameMap.worldToTileX(worldPoint.x);
					const pointerTileY = gameMap.worldToTileY(worldPoint.y);
					if (this.area.x > 1 || this.area.y > 1) {
						for (let i = 0; i < this.area.x; i++) {
							for (let j = 0; j < this.area.y; j++) {
								this.selectedTileArea[i][j] = this.getTile(pointerTileX + i, pointerTileY + j, this.selectedTileArea[i][j], gameMap);
							}
						}
					} else {
						this.selectedTile = this.getTile(pointerTileX, pointerTileY, this.selectedTile, gameMap);
					}
				}
			if (startDragIn === 'map') {
				startDragIn = 'none';
			}
		});
    }

    activateMarker(active: boolean): void {
		this.marker.active = active;
		this.marker.graphics.setVisible(active);
		this.paletteMarker.active = active;
		this.paletteMarker.graphics.setVisible(active);
		if (active) this.devModeTools.regionEditor.regionTool = false;
	}

    edit (data:TileData): void {
        const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
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
    }

    putTile (tileX: number, tileY: number, selectedTile: Phaser.Tilemaps.Tile): void {
		const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
		if (this.gameScene.tilemapLayers[map.currentLayerIndex].visible && selectedTile && this.devModeTools.scene.pointerInsideMap(tileX, tileY, map)) {
			let index = selectedTile.index;
			if (selectedTile.index === -1) index = 0;
			if  (index !== (map.getTileAt(tileX, tileY, true)).index &&
			!(index === 0 && map.getTileAt(tileX, tileY, true).index === -1)) {
				map.putTileAt(index, tileX, tileY);
				map.getTileAt(tileX, tileY, true).tint = 0xffffff;
				ige.network.send('editTile', {gid: index, layer: map.currentLayerIndex, x: tileX, y: tileY});
			}
		}
	}

	getTile (tileX: number, tileY: number, selectedTile: Phaser.Tilemaps.Tile, map: Phaser.Tilemaps.Tilemap): Phaser.Tilemaps.Tile {
		if (this.devModeTools.scene.pointerInsideMap(tileX, tileY, map)) {
			if (selectedTile) selectedTile.tint = 0xffffff;
			if (map.getTileAt(tileX, tileY) && map.getTileAt(tileX, tileY).index !== 0) {
				selectedTile = map.getTileAt(tileX, tileY);
				if (map === this.tilePalette.map) selectedTile.tint = 0x87cfff;
			}
			return selectedTile;
		}
	}

    update (): void {
        if(ige.developerMode.active && ige.developerMode.activeTab === 'map') {
            const devModeScene = this.devModeTools.scene;
			const palette = this.tilePalette;
			const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
			const paletteMap = palette.map;
			const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
			const palettePoint = devModeScene.cameras.getCamera('palette').getWorldPoint(devModeScene.input.activePointer.x, devModeScene.input.activePointer.y);
			const marker = this.marker;
			const paletteMarker = this.paletteMarker;

			paletteMarker.graphics.clear();
			paletteMarker.graphics.strokeRect(0, 0, paletteMap.tileWidth * palette.texturesLayer.scaleX, paletteMap.tileHeight * palette.texturesLayer.scaleY);
			paletteMarker.graphics.setVisible(true);

			// Rounds down to nearest tile
			const palettePointerTileX = paletteMap.worldToTileX(palettePoint.x);
			const palettePointerTileY = paletteMap.worldToTileY(palettePoint.y);

			if (palette.visible	&& devModeScene.pointerInsidePalette()) {
				devModeScene.regionEditor.cancelDrawRegion();
				marker.graphics.setVisible(false);
				// Snap to tile coordinates, but in world space
				paletteMarker.graphics.x = paletteMap.tileToWorldX(palettePointerTileX);
				paletteMarker.graphics.y = paletteMap.tileToWorldY(palettePointerTileY);

				/*if (devModeScene.input.manager.activePointer.isDown) {
					this.devModeTools.brush();
					if (this.area.x > 1 || this.area.y > 1) {
						for (let i = 0; i < this.area.x; i++) {
							for (let j = 0; j < this.area.y; j++) {
								this.newSelectedTileArea[i][j] = this.getTile(palettePointerTileX + i, palettePointerTileY + j, this.selectedTileArea[i][j], paletteMap);
							}
						}
					} else {
						this.newSelectedTile = this.getTile(palettePointerTileX, palettePointerTileY, this.selectedTile, paletteMap);
					}
				}*/
			} else if ((!devModeScene.pointerInsidePalette() || !palette.visible) &&
				!devModeScene.pointerInsideButtons() && !devModeScene.pointerInsideWidgets() && marker.active && map.currentLayerIndex >=0) {
				paletteMarker.graphics.setVisible(false);
				marker.graphics.setVisible(true);
				// Rounds down to nearest tile
				const pointerTileX = map.worldToTileX(worldPoint.x);
				const pointerTileY = map.worldToTileY(worldPoint.y);

				// Snap to tile coordinates, but in world space
				marker.graphics.x = map.tileToWorldX(pointerTileX);
				marker.graphics.y = map.tileToWorldY(pointerTileY);

				if (devModeScene.input.manager.activePointer.rightButtonDown() && !this.devModeTools.modeButtons[3].active) {
					/*if (this.area.x > 1 || this.area.y > 1) {
						for (let i = 0; i < this.area.x; i++) {
							for (let j = 0; j < this.area.y; j++) {
								this.selectedTileArea[i][j] = this.getTile(pointerTileX + i, pointerTileY + j, this.selectedTileArea[i][j], map);
							}
						}
					} else {
						this.selectedTile = this.getTile(pointerTileX, pointerTileY, this.selectedTile, map);
					}*/
				}

				if (devModeScene.input.manager.activePointer.leftButtonDown()) {
					if (this.area.x > 1 || this.area.y > 1) {
						for (let i = 0; i < this.area.x; i++) {
							for (let j = 0; j < this.area.y; j++) {
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
		else {
			this.marker.graphics.setVisible(false);
			this.paletteMarker.graphics.setVisible(false);
		}
	}
}
 
