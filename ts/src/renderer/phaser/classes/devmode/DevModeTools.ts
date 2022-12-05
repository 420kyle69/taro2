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
				"defaultItem": [],
				"controls": {
					"movementMethod": "velocity",
					"movementControlScheme": "wasd",
					"abilities": {
						"movementWheel": {
							"mobilePosition": {
								"y": 204,
								"x": 35
							}
						},
						"lookWheel": {
							"mobilePosition": {
								"y": 204,
								"x": 407
							}
						}
					},
					"mouseBehaviour": {
						"flipSpriteHorizontallyWRTMouse": false,
						"rotateToFaceMouseCursor": true
					},
					"movementType": "wasd",
					"permittedInventorySlots": [],
					"absoluteRotation": false
				},
				"inventoryImage": "",
				"animations": {
					"default": {
						"framesPerSecond": 0,
						"loopCount": 0,
						"frames": [
							1
						],
						"name": "default"
					}
				},
				"canBePurchasedBy": [],
				"isPurchasable": false,
				"states": {
					"default": {
						"name": "default",
						"sound": {},
						"particles": {},
						"animation": "default",
						"body": "default"
					}
				},
				"sound": {
					"KK9JlU1UQy": {
						"name": "Cough",
						"file": "https://modd.s3.amazonaws.com/asset/sound/1517554516253_man_cough.mp3"
					},
					"fEhDyJ8knx": {
						"name": "Scream",
						"file": "https://modd.s3.amazonaws.com/asset/sound/1517556903046_man_scream1.mp3"
					}
				},
				"particles": {},
				"body": {
					"spriteScale": 1,
					"fixtures": [
						{
							"shape": {
								"type": "rectangle"
							},
							"restitution": 0.01,
							"friction": 0.01,
							"density": 3
						}
					],
					"isFlying": false,
					"fixedRotation": false,
					"constantSpeed +DestroyedOnCollisionWithWall/unit": false,
					"allowSleep": true,
					"angularDamping": 1,
					"linearDamping": 5,
					"rotationSpeed": 2,
					"type": "dynamic",
					"height": 40,
					"width": 40,
					"collidesWith": {
						"units": true,
						"items": true,
						"projectiles": true,
						"walls": true,
						"unit": true,
						"item": true,
						"debris": true
					},
					"z-index": {
						"layer": 3,
						"depth": 3
					},
					"name": "Human-body"
				},
				"spawnPosition": {
					"y": 2200,
					"x": 1500
				},
				"attributes": {
					"speed": {
						"decimalPlaces": 0,
						"dataType": "",
						"name": "speed",
						"min": 0,
						"max": 200,
						"value": 10,
						"regenerateSpeed": 0,
						"isVisible": [],
						"showAsHUD": true,
						"color": "#00fff0",
						"displayValue": true
					},
					"health": {
						"decimalPlaces": 0,
						"color": "#ffff0f",
						"showAsHUD": true,
						"displayValue": true,
						"isVisible": [],
						"regenerateSpeed": 100,
						"value": 10000,
						"dataType": "",
						"max": 10000,
						"min": 0,
						"name": "health "
					}
				},
				"abilitiesJ8Gtv5hQ8j": {
					"movementWheel": {
						"mobilePosition": {
							"y": 204,
							"x": 35
						}
					},
					"lookWheel": {
						"mobilePosition": {
							"y": 204,
							"x": 407
						}
					},
					"w": {
						"keyUp": "stopMovingUp",
						"keyDown": "moveUp"
					},
					"a": {
						"keyUp": "stopMovingLeft",
						"keyDown": "moveLeft"
					},
					"s": {
						"keyUp": "stopMovingDown",
						"keyDown": "moveDown"
					},
					"d": {
						"keyUp": "stopMovingRight",
						"keyDown": "moveRight"
					},
					"button1": {
						"keyUp": "stopUsingItem",
						"keyDown": "startUsingItem",
						"mobilePosition": {
							"x": 326,
							"y": 132
						}
					},
					"up": {
						"keyUp": "stopMovingUp",
						"keyDown": "moveUp"
					},
					"down": {
						"keyUp": "stopMovingDown",
						"keyDown": "moveDown"
					},
					"left": {
						"keyUp": "stopMovingLeft",
						"keyDown": "moveLeft"
					},
					"right": {
						"keyUp": "stopMovingRight",
						"keyDown": "moveRight"
					},
					"e": {
						"keyUp": "",
						"keyDown": "pickUp",
						"mobilePosition": {
							"x": 366,
							"y": 85
						}
					},
					"f": {
						"keyUp": "",
						"keyDown": "pickUp"
					},
					"g": {
						"keyUp": "",
						"keyDown": "drop",
						"mobilePosition": {
							"x": 365,
							"y": 33
						}
					},
					"b": {
						"keyUp": "",
						"keyDown": "shop",
						"mobilePosition": {
							"x": 419,
							"y": 32
						}
					}
				},
				"baseSpeed": 53,
				"price": {},
				"skin": "https://s3-us-west-1.amazonaws.com/modd/halloween-0.18/spritesheet/man.png",
				"canBuyItem": true,
				"handle": "human",
				"name": "Tree",
				"inventorySize": 0,
				"cellSheet": {
					"columnCount": 1,
					"rowCount": 1,
					"url": "https://cache.modd.io/asset/spriteImage/1589568802553_Stone_Rocks.png"
				},
				"bodies": {
					"default": {
						"bullet": false,
						"name": "default",
						"type": "static",
						"width": 105,
						"height": 105,
						"z-index": {
							"layer": 3,
							"depth": 3
						},
						"fixedRotation": true,
						"constantSpeed +DestroyedOnCollisionWithWall/unit": false,
						"allowSleep": true,
						"collidesWith": {
							"units": true,
							"items": true,
							"projectiles": true,
							"walls": true,
							"debris": true
						},
						"angularDamping": 1,
						"linearDamping": 8,
						"rotationSpeed": 1,
						"spriteScale": 1,
						"fixtures": [
							{
								"density": 1,
								"friction": 0,
								"restitution": 0,
								"shape": {
									"type": "circle"
								},
								"isSensor": false
							}
						],
						"jointType": "weldJoint",
						"unitAnchor": {
							"x": 0,
							"y": 33,
							"rotation": 0
						},
						"itemAnchor": {
							"x": 0,
							"y": 0,
							"lowerAngle": 0,
							"upperAngle": 0
						},
						"affectedByGravity": false
					}
				},
				"variables": {},
				"effects": {
					"idle": {
						"projectileType": "",
						"sound": {},
						"animation": "",
						"tween": "",
						"runScript": ""
					},
					"attacked": {
						"projectileType": "",
						"sound": {},
						"animation": "",
						"tween": "",
						"runScript": ""
					},
					"move": {
						"projectileType": "",
						"sound": {},
						"animation": "",
						"tween": "",
						"runScript": ""
					},
					"create": {
						"projectileType": "",
						"sound": {},
						"animation": "",
						"runScript": ""
					},
					"destroy": {
						"projectileType": "",
						"sound": {},
						"animation": "",
						"runScript": ""
					}
				},
				"confinedWithinMapBoundaries": true,
				"ai": {
					"pathFindingMethod": "simple",
					"idleBehaviour": "stay",
					"sensorResponse": "none",
					"attackResponse": "none",
					"maxTravelDistance": 300,
					"letGoDistance": "",
					"sensorRadius": 0,
					"maxAttackRange": 400,
					"enabled": false
				},
				"backpackSize": 0,
				"defaultItems": [],
				"isUnTargetable": false
			};

			this.scene.editEntity({entityType: 'unit', 
				typeId: 'tree',
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
