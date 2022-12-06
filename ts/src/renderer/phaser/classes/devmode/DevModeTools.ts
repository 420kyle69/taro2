class DevModeTools extends Phaser.GameObjects.Container {

	public scene: DevModeScene;
	public palette: TilePalette;
	public tileEditor: TileEditor;
	public regionEditor: RegionEditor;

	cursorButton: DevToolButton;
	layerButtonsContainer: Phaser.GameObjects.Container;
	layerButtons: DevToolButton[];
	layerHideButtons: DevToolButton[];
	toolButtonsContainer: Phaser.GameObjects.Container;
	modeButtons: DevToolButton[];
	brushButtons: DevToolButton[];

	COLOR_DARK: number;
	COLOR_LIGHT: number;
	COLOR_PRIMARY: number;
	
	
	constructor(
		scene: DevModeScene,
	) {
		super(scene);

		const palette = this.palette = new TilePalette(this.scene, this.scene.tileset, this.scene.rexUI)
		this.tileEditor = new TileEditor(this.scene.gameScene, this.scene, this);
		this.regionEditor = new RegionEditor(this.scene.gameScene, this.scene, this);

		this.keyBindings();

		this.COLOR_PRIMARY = palette.COLOR_PRIMARY;
		this.COLOR_LIGHT = palette.COLOR_LIGHT;
		this.COLOR_DARK = palette.COLOR_DARK;

		this.scene.scale.on(Phaser.Scale.Events.RESIZE, () => {
			layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
			layerButtonsContainer.y = palette.camera.y - 170;
			toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
			toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 136;
		});

		new DevToolButton (this, '+', null, 0, -34, 30, palette.scrollBarContainer, palette.zoom.bind(palette), -1);
		new DevToolButton (this, '-', null, 34, -34, 30, palette.scrollBarContainer, palette.zoom.bind(palette), 1);

		const layerButtonsContainer = this.layerButtonsContainer = new Phaser.GameObjects.Container(scene);
		layerButtonsContainer.width = 120;
		layerButtonsContainer.height = 204;
		layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
		layerButtonsContainer.y = palette.camera.y - 204;
		scene.add.existing(layerButtonsContainer);
		
		new DevToolButton (this, 'palette', null, 0, 170, 120, layerButtonsContainer, palette.toggle.bind(palette));

		this.layerButtons = [];
		this.layerButtons.push (
			new DevToolButton (this, 'floor', null, 30, 102, 85, layerButtonsContainer, this.switchLayer.bind(this), 0),
			new DevToolButton (this, 'floor2', null, 30, 68, 85, layerButtonsContainer, this.switchLayer.bind(this), 1),
			new DevToolButton (this, 'walls', null, 30, 34, 85, layerButtonsContainer, this.switchLayer.bind(this), 2),
			new DevToolButton (this, 'trees', null, 30, 0, 85, layerButtonsContainer, this.switchLayer.bind(this), 3)
		)
		this.layerButtons[0].highlight(true);
		this.layerHideButtons = [];
		this.layerHideButtons.push (
			new DevToolButton (this, '', 'eyeopen', 0, 102, 35, layerButtonsContainer, this.hideLayer.bind(this), 0),
			new DevToolButton (this, '', 'eyeopen', 0, 68, 35, layerButtonsContainer, this.hideLayer.bind(this), 1),
			new DevToolButton (this, '', 'eyeopen', 0, 34, 35, layerButtonsContainer, this.hideLayer.bind(this), 2),
			new DevToolButton (this, '', 'eyeopen', 0, 0, 35, layerButtonsContainer, this.hideLayer.bind(this), 3)
		)
		this.layerHideButtons[0].highlight(true);

		const toolButtonsContainer = this.toolButtonsContainer = new Phaser.GameObjects.Container(scene);
		toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
		toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 184;
		toolButtonsContainer.width = 120;
		toolButtonsContainer.height = 98;
		scene.add.existing(toolButtonsContainer);

		this.modeButtons = [];
		this.modeButtons.push (
			new DevToolButton (this, '', 'cursor', 0, 0, 58, toolButtonsContainer, this.cursor.bind(this)),
			new DevToolButton (this, '', 'region', 62, 0, 58, toolButtonsContainer, this.drawRegion.bind(this)),
			new DevToolButton (this, '', 'stamp', 0, 34, 58, toolButtonsContainer, this.brush.bind(this)),
			new DevToolButton (this, '', 'eraser', 62, 34, 58, toolButtonsContainer, this.emptyTile.bind(this))
		)
		this.cursorButton = this.modeButtons[0];
		this.highlightModeButton(0);

		this.brushButtons = [];
		this.brushButtons.push (
			new DevToolButton (this, '1x1', null, 0, 102, 58, toolButtonsContainer, this.selectSingle.bind(this)),
			new DevToolButton (this, '2x2', null, 62, 102, 58, toolButtonsContainer, this.selectArea.bind(this))
		)
		this.brushButtons[0].highlight(true);

		this.palette.hide();
		this.layerButtonsContainer.setVisible(false);
		this.toolButtonsContainer.setVisible(false);
		this.regionEditor.hideRegions();

		const ctrlKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL, false);

		this.scene.input.on('pointermove', function (p) {
			if (ige.developerMode.active && ige.developerMode.activeTab !== 'play' && (p.rightButtonDown() || (p.isDown && ctrlKey.isDown))) {
				const camera = this.scene.gameScene.cameras.main;
				const scrollX = (p.x - p.prevPosition.x) / camera.zoom
				const scrollY = (p.y - p.prevPosition.y) / camera.zoom;
				camera.scrollX -= scrollX;
				camera.scrollY -= scrollY;
			};
		});
	}

	enterMapTab(): void {
		this.layerButtonsContainer.setVisible(true);
		this.toolButtonsContainer.setVisible(true);
		this.highlightModeButton(0);
		this.tileEditor.activateMarker(false);
		this.palette.show();
		this.regionEditor.showRegions();
	}

	leaveMapTab(): void {
		this.regionEditor.cancelDrawRegion();
		this.palette.hide();
		this.layerButtonsContainer.setVisible(false);
		this.toolButtonsContainer.setVisible(false);
		this.regionEditor.hideRegions();
	}

	keyBindings(): void {
		const gameScene = this.scene.gameScene;
		const keyboard = this.scene.input.keyboard;

		/*const shouldPreventKeybindings = function () {
			if (!$('#game-editor').is(':visible')) {
				return false;
			}
			let activeElement = document.activeElement;
			let inputs = ['input', 'select', 'textarea'];
	
			if (activeElement && inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1 ) {
				return true;
			}
			return false;
		}*/

		const tabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
		tabKey.on('down', () => {
			//temporary for testing
			const newData = {
				"carriedBy": [],
				"buffTypes": [],
				"cost": {
					"quantity": 0
				},
				"bonus": {
					"passive": {
						"unitAttribute": {},
						"playerAttribute": {}
					},
					"consume": {
						"unitAttribute": {},
						"playerAttribute": {}
					}
				},
				"removeWhenEmpty": false,
				"isUsedOnPickup": false,
				"canBeUsedBy": [],
				"sound": {},
				"damage": {
					"unitAttributes": {
						"health": 10
					}
				},
				"particles": {},
				"destroyTimer": 30000,
				"penetration": false,
				"bulletDestroyedOnCollisionWithWall/unitDistance": 1300,
				"bulletDestroyedOnCollisionWithWall/unitStartPosition": {
					"rotation": 0,
					"y": 0,
					"x": 0
				},
				"effects": {
					"empty": {
						"sound": {},
						"animation": ""
					},
					"reload": {
						"sound": {},
						"animation": ""
					},
					"destroy": {
						"animation": "",
						"sound": {},
						"projectileType": ""
					},
					"create": {
						"animation": "",
						"sound": {},
						"projectileType": ""
					},
					"use": {
						"tween": "swingCCW",
						"animation": "use",
						"sound": {},
						"projectileType": ""
					}
				},
				"knockbackForce": 0,
				"bulletDestroyedOnCollisionWithWall/unitForce": 14,
				"fireRate": 500,
				"recoilForce": 0,
				"reloadRate": 2800,
				"description": null,
				"maxQuantity": null,
				"quantity": null,
				"projectileType": "",
				"hideIfUnaffordable": false,
				"bodies": {
					"dropped": {
						"bullet": false,
						"itemAnchor": {
							"y": 0,
							"x": 0
						},
						"unitAnchor": {
							"rotation": 90,
							"x": 0,
							"y": 52
						},
						"jointType": "weldJoint",
						"fixtures": [
							{
								"isSensor": true,
								"shape": {
									"type": "rectangle"
								},
								"restitution": 0.01,
								"friction": 0.01,
								"density": 1
							}
						],
						"spriteScale": 1,
						"rotationSpeed": 1,
						"linearDamping": 1,
						"angularDamping": 1,
						"collidesWith": {
							"debris": false,
							"walls": false,
							"projectiles": false,
							"items": false,
							"units": false
						},
						"allowSleep": true,
						"constantSpeed +DestroyedOnCollisionWithWall/unit": false,
						"fixedRotation": false,
						"z-index": {
							"depth": 2,
							"layer": 1
						},
						"height": 53,
						"width": 26,
						"type": "dynamic",
						"name": "dropped"
					},
					"selected": {
						"itemAnchor": {
							"x": 0,
							"y": 52
						},
						"unitAnchor": {
							"x": 0,
							"y": 0,
							"rotation": 90
						},
						"jointType": "weldJoint",
						"fixtures": [
							{
								"isSensor": false,
								"shape": {
									"type": "rectangle"
								},
								"restitution": 0.01,
								"friction": 0.01,
								"density": 1
							}
						],
						"spriteScale": 1,
						"rotationSpeed": 3,
						"linearDamping": 5,
						"angularDamping": 1,
						"collidesWith": {
							"debris": false,
							"walls": true,
							"projectiles": true,
							"items": true,
							"units": true
						},
						"allowSleep": true,
						"constantSpeed +DestroyedOnCollisionWithWall/unit": false,
						"fixedRotation": false,
						"z-index": {
							"depth": 4,
							"layer": 3
						},
						"height": 53,
						"width": 26,
						"type": "spriteOnly",
						"name": "selected"
					}
				},
				"animations": {
					"default": {
						"name": "default",
						"frames": [
							1
						],
						"loopCount": null,
						"framesPerSecond": null
					}
				},
				"states": {
					"dropped": {
						"sound": {},
						"particles": {},
						"body": "dropped",
						"animation": "default",
						"name": "dropped"
					},
					"unselected": {
						"sound": {},
						"particles": {},
						"body": "none",
						"animation": "none",
						"name": "unselected"
					},
					"selected": {
						"sound": {},
						"particles": {},
						"body": "selected",
						"animation": "default",
						"name": "selected"
					}
				},
				"hits": [],
				"type": "weapon",
				"bulletDestroyedOnCollisionWithWall/unitType": "raycast",
				"isGun": false,
				"canBePurchasedBy": [],
				"isPurchasable": true,
				"isStackable": false,
				"inventoryImage": "https://cache.modd.io/asset/spriteImage/1588116120030_axe.png",
				"cellSheet": {
					"columnCount": 1,
					"rowCount": 1,
					"url": "https://cache.modd.io/asset/spriteImage/1567137993943_crowbar.png"
				},
				"attributes": {},
				"handle": "",
				"name": "Axe",
				"frames": {},
				"bulletStartPosition": {
					"x": 0,
					"y": 0,
					"rotation": 0
				},
				"damageHitBox": {
					"width": 38,
					"height": 30,
					"offsetX": 0,
					"offsetY": 50
				},
				"damageDelay": 0,
				"controls": {
					"undroppable": true,
					"designatedInventorySlot": 1,
					"mouseBehaviour": {
						"rotateToFaceMouseCursor": true,
						"flipSpriteHorizontallyWRTMouse": false
					},
					"permittedInventorySlots": []
				},
				"lifeSpan": 60000,
				"confinedWithinMapBoundaries": true,
				"delayBeforeUse": 0,
				"itemTypeId": "axe",
				"stateId": "selected",
				"currentBody": {
					"itemAnchor": {
						"x": 0,
						"y": 52
					},
					"unitAnchor": {
						"x": 0,
						"y": 0,
						"rotation": 90
					},
					"jointType": "weldJoint",
					"fixtures": [
						{
							"isSensor": false,
							"shape": {
								"type": "rectangle"
							},
							"restitution": 0.01,
							"friction": 0.01,
							"density": 1
						}
					],
					"spriteScale": 1,
					"rotationSpeed": 3,
					"linearDamping": 5,
					"angularDamping": 1,
					"collidesWith": {
						"debris": false,
						"walls": true,
						"projectiles": true,
						"items": true,
						"units": true
					},
					"allowSleep": true,
					"constantSpeed +DestroyedOnCollisionWithWall/unit": false,
					"fixedRotation": false,
					"z-index": {
						"depth": 4,
						"layer": 3
					},
					"height": 53,
					"width": 26,
					"type": "spriteOnly",
					"name": "selected"
				},
				"defaultData": {
					"translate": {
						"x": 0,
						"y": 0
					},
					"rotate": 0
				},
				"lastUsed": 1670337003795,
				"animationId": "default",
				"slotIndex": 0,
				"ownerUnitId": "23f744e6",
				"isBeingUsed": false
			}

			this.scene.editEntity({entityType: 'item', 
				typeId: 'axe',
				action: 'update',
				newData: newData
			})
			if (ige.developerMode.shouldPreventKeybindings()) {
				keyboard.disableGlobalCapture();
			} else {
				keyboard.enableGlobalCapture();
				if(ige.developerMode.active && ige.developerMode.activeTab === 'map') {
					if (this.palette.visible) {
						this.palette.hide();
					}
					else {
						this.palette.show()
					}
				}
			}
		});

		const plusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, false);
		plusKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab !== 'play' && !ige.developerMode.shouldPreventKeybindings()) {
				const zoom = (gameScene.zoomSize / 2.15) / 1.1;
				ige.client.emit('zoom', zoom);
			}
		});
		const minusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
		minusKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab !== 'play' && !ige.developerMode.shouldPreventKeybindings()) {
				const zoom =(gameScene.zoomSize / 2.15) * 1.1;
				ige.client.emit('zoom', zoom);
			}
		});
	}

	cursor(): void {
		this.highlightModeButton(0);
		this.scene.regionEditor.regionTool = false;
		this.tileEditor.activateMarker(false);
	}

	drawRegion(): void {
		this.tileEditor.activateMarker(false);
		this.highlightModeButton(1);
		this.scene.regionEditor.regionTool = true;
	}

	brush(): void {
		if (this.modeButtons[3].active) {
			this.tileEditor.selectedTile = this.tileEditor.lastSelectedTile;
			this.tileEditor.selectedTileArea = this.tileEditor.lastSelectedTileArea;
		}
		this.tileEditor.activateMarker(true);
		this.scene.regionEditor.regionTool = false;
		this.highlightModeButton(2);
	}

	emptyTile(): void {
		/*if (this.tileEditor.selectedTile) this.tileEditor.selectedTile.tint = 0xffffff;
		for (let i = 0; i < this.tileEditor.area.x; i++) {
			for (let j = 0; j < this.tileEditor.area.y; j++) {
				if (this.tileEditor.selectedTileArea[i][j]) this.tileEditor.selectedTileArea[i][j].tint = 0xffffff;
			}
		}*/
		if (!this.modeButtons[3].active) {
			this.tileEditor.lastSelectedTile = this.tileEditor.selectedTile;
			this.tileEditor.lastSelectedTileArea = this.tileEditor.selectedTileArea
			const copy = { ...this.tileEditor.selectedTile };
			copy.index = 0;
			this.tileEditor.selectedTile = copy as any;
			this.tileEditor.selectedTileArea = [[copy, copy],[copy, copy]] as any;
			this.tileEditor.activateMarker(true);
			this.scene.regionEditor.regionTool = false;
			this.highlightModeButton(3);
		}
	}

	highlightModeButton(n: number): void {
		this.modeButtons.forEach((button, index) => {
			if (index === n) button.highlight(true);
			else button.highlight(false);
		});
	}

	selectSingle(): void {
		for (let i = 0; i < this.tileEditor.area.x; i++) {
			for (let j = 0; j < this.tileEditor.area.y; j++) {
				if (this.tileEditor.selectedTileArea[i][j]) this.tileEditor.selectedTileArea[i][j].tint = 0xffffff;
			}
		}
		this.tileEditor.area = {x: 1, y: 1};
		this.tileEditor.marker.graphics.scale = 1;
		this.tileEditor.paletteMarker.graphics.scale = 1;
		this.brushButtons[0].highlight(true);
		this.brushButtons[1].highlight(false);
		this.tileEditor.activateMarker(true);
		if (!this.modeButtons[3].active) {
			this.brush();
		}
	}

	selectArea(): void {
		if (this.tileEditor.selectedTile) this.tileEditor.selectedTile.tint = 0xffffff;
		this.tileEditor.area = {x: 2, y: 2};
		this.tileEditor.marker.graphics.scale = 2;
		this.tileEditor.paletteMarker.graphics.scale = 2;
		this.brushButtons[1].highlight(true);
		this.brushButtons[0].highlight(false);
		this.tileEditor.activateMarker(true);
		if (!this.modeButtons[3].active) {
			this.brush();
		}
	}

	switchLayer(value: number): void {
		const scene = this.scene as any;
		const gameMap = scene.gameScene.tilemap;
		gameMap.currentLayerIndex = value;
		this.layerButtons.forEach(button => {
			button.highlight(false);
		});
		this.layerHideButtons.forEach(button => {
			button.highlight(false);
		});
		this.layerButtons[value].highlight(true);
		this.layerHideButtons[value].highlight(true);
	}

	hideLayer(value: number): void {
		this.switchLayer(value);
		const scene = this.scene as any;
		const tilemapLayers = scene.gameScene.tilemapLayers;
		if (this.layerHideButtons[value].image.texture.key === 'eyeopen') {
			this.layerHideButtons[value].image.setTexture('eyeclosed');
			tilemapLayers[value].setVisible(false);
		} else {
			this.layerHideButtons[value].image.setTexture('eyeopen');
			tilemapLayers[value].setVisible(true);
		}
	}
}
