class DevModeScene extends PhaserScene {

	rexUI: any;
	gameScene: any;

	devModeTools: DevModeTools;
	regionEditor: RegionEditor;
	tileEditor: TileEditor;

	tilePalette: TilePalette;
	tilemap: Phaser.Tilemaps.Tilemap;
	tileset: Phaser.Tilemaps.Tileset;

	regions: PhaserRegion[];

	defaultZoom: number;

	constructor() {
		super({ key: 'DevMode' });
	}

	init (): void {
		this.gameScene = ige.renderer.scene.getScene('Game');
		this.regions = [];
		this.defaultZoom = (this.gameScene.zoomSize / 2.15);

		ige.client.on('unlockCamera', () => {
			this.defaultZoom = (this.gameScene.zoomSize / 2.15);
			this.gameScene.cameras.main.stopFollow();
		});

		ige.client.on('lockCamera', () => {
			ige.client.emit('zoom', this.defaultZoom);
			if (this.gameScene.cameraTarget) this.gameScene.cameras.main.startFollow(this.gameScene.cameraTarget, false, 0.05, 0.05);
		});

		ige.client.on('enterMapTab', () => {
			this.enterMapTab();
		});

		ige.client.on('leaveMapTab', () => {
			this.leaveMapTab();
		});

		ige.client.on('editTile', (data: TileData) => {
			this.tileEditor.edit(data);
		});

		ige.client.on('editRegion', (data: RegionData) => {
			this.regionEditor.edit(data);
		});

		this.gameScene.input.on('pointerup', (p) => {
			const draggedEntity = ige.unitBeingDragged;
			// ige.unitBeingDragged = {typeId: 'unit id', playerId: 'xyz', angle: 0, entityType: 'unit'}
			if (draggedEntity) {
			    // find position and call editEntity function.
				const worldPoint = this.gameScene.cameras.main.getWorldPoint(p.x, p.y);
				const playerId = ige.game.getPlayerByClientId(ige.network.id()).id();
				const data = {
					action: 'create',
					entityType: draggedEntity.entityType,
					typeId: draggedEntity.typeId,
					playerId: playerId,
					position: {
						x: worldPoint.x,
						y: worldPoint.y
					}, 
					angle: draggedEntity.angle
				}
				ige.developerMode.editEntity(data);
				ige.unitBeingDragged = null;
			}
		});
		
		ige.client.on('default-zoom', (height: number) => {
			this.defaultZoom = height;
		});
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
		this.load.image('eyeopen', 'https://cache.modd.io/asset/spriteImage/1669820752914_eyeopen.png');
		this.load.image('eyeclosed', 'https://cache.modd.io/asset/spriteImage/1669821066279_eyeclosed.png');
		

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
				(tileset.margin || 0) + 2,
				(tileset.spacing || 0) + 4
			);
			/*} else {
				this.tileset = map.addTilesetImage(tileset.name, key);
			}*/
		});

		const gameMap = this.gameScene.tilemap;
		gameMap.currentLayerIndex = 0;

		this.devModeTools = new DevModeTools(this);
		this.tileEditor = this.devModeTools.tileEditor;
		this.tilePalette = this.devModeTools.palette;
		this.regionEditor = this.devModeTools.regionEditor;
	}

	enterMapTab (): void {
		this.devModeTools.enterMapTab();
	}

	leaveMapTab (): void {
		this.devModeTools.leaveMapTab();
	}

	pointerInsideMap(pointerX: number, pointerY: number, map: Phaser.Tilemaps.Tilemap): boolean {
		return (0 <= pointerX && pointerX < map.width
			&& 0 <= pointerY && pointerY < map.height);
	}

	pointerInsidePalette(): boolean {
		return (this.input.activePointer.x > this.tilePalette.scrollBarContainer.x
			&& this.input.activePointer.x < this.tilePalette.scrollBarContainer.x + this.tilePalette.scrollBarContainer.width
			&& this.input.activePointer.y > this.tilePalette.scrollBarContainer.y - 30
			&& this.input.activePointer.y < this.tilePalette.scrollBarContainer.y + this.tilePalette.scrollBarContainer.height);
	}

	pointerInsideButtons(): boolean {
		return ((this.input.activePointer.x > this.devModeTools.layerButtonsContainer.x
			&& this.input.activePointer.x < this.devModeTools.layerButtonsContainer.x + this.devModeTools.layerButtonsContainer.width
			&& this.input.activePointer.y > this.devModeTools.layerButtonsContainer.y
			&& this.input.activePointer.y < this.devModeTools.layerButtonsContainer.y + this.devModeTools.layerButtonsContainer.height)
			|| (this.input.activePointer.x > this.devModeTools.toolButtonsContainer.x
			&& this.input.activePointer.x < this.devModeTools.toolButtonsContainer.x + this.devModeTools.toolButtonsContainer.width
			&& this.input.activePointer.y > this.devModeTools.toolButtonsContainer.y
			&& this.input.activePointer.y < this.devModeTools.toolButtonsContainer.y + this.devModeTools.toolButtonsContainer.height));
	}

	update (): void {
		if (this.tileEditor) this.tileEditor.update();
	}

}
