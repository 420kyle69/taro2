class DevModeScene extends PhaserScene {

	rexUI: any;
	gameScene: any;

	devModeTools: DevModeTools;
	regionEditor: RegionEditor;
	tileEditor: TileEditor;
	gameEditorWidgets: Array<DOMRect>;

	pointerInsideButtons: boolean;

	tilePalette: TilePalette;
	tilemap: Phaser.Tilemaps.Tilemap;
	tileset: Phaser.Tilemaps.Tileset;

	regions: PhaserRegion[];

	entityImages: (Phaser.GameObjects.Image & {entity: EntityImage})[];

	showRepublishWarning: boolean;

	constructor() {
		super({ key: 'DevMode' });
	}

	init (): void {
		this.gameScene = taro.renderer.scene.getScene('Game');
		this.pointerInsideButtons = false;

		this.regions = [];
		this.entityImages = [];

		this.showRepublishWarning = false;

		taro.client.on('unlockCamera', () => {
			this.gameScene.cameras.main.stopFollow();
		});

		taro.client.on('lockCamera', () => {
			taro.client.emit('zoom', taro.client.zoom);
			let trackingDelay = taro?.game?.data?.settings?.camera?.trackingDelay || 3;
			trackingDelay = trackingDelay / 60;
			if (this.gameScene.cameraTarget) this.gameScene.cameras.main.startFollow(this.gameScene.cameraTarget, false, trackingDelay, trackingDelay);
		});

		taro.client.on('enterMapTab', () => {
			this.enterMapTab();
		});

		taro.client.on('leaveMapTab', () => {
			this.leaveMapTab();
		});

		taro.client.on('editTile', (data: TileData) => {
			this.tileEditor.edit(data);
		});

		taro.client.on('editRegion', (data: RegionData) => {
			this.regionEditor.edit(data);
		});

        taro.client.on('editInitEntity', (data: ActionData) => {
            let found = false;
            this.entityImages.forEach((image) => {
                if (image.entity.action.actionId === data.actionId) {
                    found = true;
                    image.entity.update(data);
                }
            });
            if (!found) {
                this.createEntityImage(data);
            }
		});

        taro.client.on('updateInitEntities', () => {
			this.updateInitEntities();
		});

		this.gameScene.input.on('pointerup', (p) => {
			const draggedEntity = taro.unitBeingDragged;
			// taro.unitBeingDragged = {typeId: 'unit id', playerId: 'xyz', angle: 0, entityType: 'unit'}
			if (draggedEntity) {
			    // find position and call editEntity function.
				const worldPoint = this.gameScene.cameras.main.getWorldPoint(p.x, p.y);
				const playerId = taro.game.getPlayerByClientId(taro.network.id()).id();
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
				taro.developerMode.editEntity(data, playerId);
				taro.unitBeingDragged = null;
			}
		});
	}

	preload (): void {
		/*const data = taro.game.data;

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
        this.load.image('entity', 'https://cache.modd.io/asset/spriteImage/1686840222943_cube.png');
		this.load.image('region', 'https://cache.modd.io/asset/spriteImage/1666882309997_region.png');
		this.load.image('stamp', 'https://cache.modd.io/asset/spriteImage/1666724706664_stamp.png');
		this.load.image('eraser', 'https://cache.modd.io/asset/spriteImage/1666276083246_erasergap.png');
		this.load.image('eyeopen', 'https://cache.modd.io/asset/spriteImage/1669820752914_eyeopen.png');
		this.load.image('eyeclosed', 'https://cache.modd.io/asset/spriteImage/1669821066279_eyeclosed.png');
		this.load.image('fill', 'https://cache.modd.io/asset/spriteImage/1675428550006_fill_(1).png');
		this.load.image('clear', 'https://cache.modd.io/asset/spriteImage/1681917489086_layerClear.png');
		this.load.image('save', 'https://cache.modd.io/asset/spriteImage/1681916834218_saveIcon.png');
		

		this.load.scenePlugin(
			'rexuiplugin',
			'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
			//'src/renderer/phaser/rexuiplugin.min.js',
			'rexUI',
			'rexUI'
		  );
	}

	create(): void {
		const data = taro.game.data;
		const map = this.tilemap = this.make.tilemap({ key: 'map' });

		data.map.tilesets.forEach((tileset) => {
			const key = `tiles/${tileset.name}`;
			const extrudedKey = `extruded-${key}`;
			if (this.textures.exists(extrudedKey)) {
				this.tileset = map.addTilesetImage(tileset.name, extrudedKey,
					tileset.tilewidth, tileset.tileheight,
					(tileset.margin || 0) + 2,
					(tileset.spacing || 0) + 4
				);
			} else {
				this.tileset = map.addTilesetImage(tileset.name, key);
			}
		});

		const gameMap = this.gameScene.tilemap;
		gameMap.currentLayerIndex = 0;

		this.devModeTools = new DevModeTools(this);
		this.tileEditor = this.devModeTools.tileEditor;
		this.tilePalette = this.devModeTools.palette;
		this.regionEditor = this.devModeTools.regionEditor;
		this.gameEditorWidgets = this.devModeTools.gameEditorWidgets;
	}

	enterMapTab (): void {
		if (this.gameEditorWidgets.length === 0) {
			this.devModeTools.queryWidgets();
			this.gameEditorWidgets = this.devModeTools.gameEditorWidgets;
		}

		this.devModeTools.enterMapTab();

		this.gameScene.renderedEntities.forEach(element => {
			element.setVisible(false);
		});

		if (this.entityImages.length === 0) {
			// create images for entities created in initialize script
			Object.values(taro.game.data.scripts).forEach((script) => {
				if (script.triggers?.[0]?.type === 'gameStart') {
					Object.values(script.actions).forEach((action) => {
                        this.createEntityImage(action);
					});
				}
			});

			if (this.showRepublishWarning) {
				inGameEditor.showRepublishToInitEntitiesWarning();
			}
		}

        taro.network.send('updateClientInitEntities', true);

		this.entityImages.forEach((image) => {
			image.setVisible(true);
		});
	}

	leaveMapTab (): void {
		if (this.devModeTools) this.devModeTools.leaveMapTab();
        
		this.entityImages.forEach((image) => {
			image.setVisible(false);
		});

		this.gameScene.renderedEntities.forEach(element => {
			element.setVisible(true);
		});

	}

    createEntityImage(action: ActionData): void {
        if (!action.disabled && action.position?.function === 'xyCoordinate' 
        && !isNaN(action.position?.x) && !isNaN(action.position?.y)) {
            if (action.type === 'createEntityForPlayerAtPositionWithDimensions' || action.type === 'createEntityAtPositionWithDimensions'
            && !isNaN(action.width) && !isNaN(action.height) && !isNaN(action.angle)) {
                if (action.actionId) new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action);
                else {
					this.showRepublishWarning = true;
                }
            } else if (action.type === 'createUnitAtPosition' && !isNaN(action.angle)) {
                if (action.actionId) new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action, 'unit');
                else {
					this.showRepublishWarning = true;
                }
            } else if (action.type === 'createUnitForPlayerAtPosition' 
            && !isNaN(action.angle) && !isNaN(action.width) && !isNaN(action.height)) {
                if (action.actionId) new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action, 'unit');
                else {
					this.showRepublishWarning = true;
                }
            }
            else if (action.type === 'spawnItem' || action.type === 'createItemWithMaxQuantityAtPosition') {
                if (action.actionId) new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action, 'item');
                else {
					this.showRepublishWarning = true;
                }
            } else if (action.type === 'createProjectileAtPosition' && !isNaN(action.angle)) {
                if (action.actionId) new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action, 'projectile');
                else {
					this.showRepublishWarning = true;
                }
            } 
        }
    }

	pointerInsideMap(pointerX: number, pointerY: number, map: Phaser.Tilemaps.Tilemap): boolean {
		return (0 <= pointerX && pointerX < map.width
			&& 0 <= pointerY && pointerY < map.height);
	}

	pointerInsideWidgets(): boolean {
		let inside = false;

		this.gameEditorWidgets.forEach((widget: DOMRect) => {
			if (this.input.activePointer.x >= widget.left
				&& this.input.activePointer.x <= widget.right
				&& this.input.activePointer.y >= widget.top
				&& this.input.activePointer.y <= widget.bottom) {
				inside = true;
				return;
			}
		});

		return inside;
	}

	pointerInsidePalette(): boolean {
		return (this.input.activePointer.x > this.tilePalette.scrollBarContainer.x
			&& this.input.activePointer.x < this.tilePalette.scrollBarContainer.x + this.tilePalette.scrollBarContainer.width
			&& this.input.activePointer.y > this.tilePalette.scrollBarContainer.y - 30
			&& this.input.activePointer.y < this.tilePalette.scrollBarContainer.y + this.tilePalette.scrollBarContainer.height);
	}

	update (): void {
		if (this.tileEditor) this.tileEditor.update();
        if (this.devModeTools.entityEditor) this.devModeTools.entityEditor.update();
	}

    updateInitEntities(): void {
        taro.developerMode.initEntities.forEach((action) => {
            let found = false;
            this.entityImages.forEach((image) => {
                if (image.entity.action.actionId === action.actionId) {
                    found = true;
                    image.entity.update(action);
                }
            });
            if (!found) {
                this.createEntityImage(action);
            }
        });

    }

}
