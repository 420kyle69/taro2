class DevModeTools extends Phaser.GameObjects.Container {

	public palette: TilePalette;
	public tileEditor: TileEditor;
	public regionEditor: RegionEditor;
	public gameEditorWidgets: Array<DOMRect>;

	cursorButton: DevToolButton;
	paletteButton: DevToolButton;
	layerButtonsContainer: Phaser.GameObjects.Container;
	layerButtons: DevToolButton[];
	layerHideButtons: DevToolButton[];
	toolButtonsContainer: Phaser.GameObjects.Container;
	modeButtons: DevToolButton[];
	brushButtons: DevToolButton[];
	tooltip: DevTooltip;

	COLOR_WHITE: number;
	COLOR_LIGHT: number;
	COLOR_PRIMARY: number;
	COLOR_GRAY: number;
	
	constructor(
		public scene: DevModeScene,
	) {
		super(scene);

		const palette = this.palette = new TilePalette(this.scene, this.scene.tileset, this.scene.rexUI)
		this.tileEditor = new TileEditor(this.scene.gameScene, this.scene, this);
		this.regionEditor = new RegionEditor(this.scene.gameScene, this.scene, this);
		this.gameEditorWidgets = [];

		this.keyBindings();

		this.COLOR_PRIMARY = palette.COLOR_PRIMARY;
		this.COLOR_LIGHT = palette.COLOR_LIGHT;
		this.COLOR_WHITE = palette.COLOR_WHITE;
		this.COLOR_GRAY = palette.COLOR_GRAY;

		this.scene.scale.on(Phaser.Scale.Events.RESIZE, () => {
			layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
			layerButtonsContainer.y = palette.camera.y - 170;
			toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
			toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 170;
		});

		new DevToolButton (this, '+', '+', 'Zoom in (+)', null, 0, -34, 30, palette.scrollBarContainer, palette.zoom.bind(palette), -1);
		new DevToolButton (this, '-', '-', 'Zoom out (-)', null, 34, -34, 30, palette.scrollBarContainer, palette.zoom.bind(palette), 1);

		const layerButtonsContainer = this.layerButtonsContainer = new Phaser.GameObjects.Container(scene);
		layerButtonsContainer.width = 120;
		layerButtonsContainer.height = 204;
		layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
		layerButtonsContainer.y = palette.camera.y - 204;
		scene.add.existing(layerButtonsContainer);
		
		this.paletteButton = new DevToolButton (this, 'palette', 'Palette', 'show/hide palette', null, 0, 170, 120, layerButtonsContainer, palette.toggle.bind(palette));

		this.layerButtons = [];
		this.layerButtons.push (
			new DevToolButton (this, 'floor', 'Layer (1)', 'select the Floor layer', null, 30, 102, 85, layerButtonsContainer, this.switchLayer.bind(this), 0),
			new DevToolButton (this, 'floor2', 'Layer (2)', 'select the Floor 2 layer', null, 30, 68, 85, layerButtonsContainer, this.switchLayer.bind(this), 1),
			new DevToolButton (this, 'walls', 'Layer (3)', 'select the Walls layer', null, 30, 34, 85, layerButtonsContainer, this.switchLayer.bind(this), 2),
			new DevToolButton (this, 'trees', 'Layer (4)', 'select the Trees layer', null, 30, 0, 85, layerButtonsContainer, this.switchLayer.bind(this), 3)
		)
		this.layerButtons[0].highlight('active');
		this.layerHideButtons = [];
		this.layerHideButtons.push (
			new DevToolButton (this, '', 'Layer visibility (shift-1)', 'show/hide floor layer', 'eyeopen', 0, 102, 35, layerButtonsContainer, this.hideLayer.bind(this), 0),
			new DevToolButton (this, '', 'Layer visibility (shift-2)', 'show/hide floor 2 layer', 'eyeopen', 0, 68, 35, layerButtonsContainer, this.hideLayer.bind(this), 1),
			new DevToolButton (this, '', 'Layer visibility (shift-3)', 'show/hide walls layer', 'eyeopen', 0, 34, 35, layerButtonsContainer, this.hideLayer.bind(this), 2),
			new DevToolButton (this, '', 'Layer visibility (shift-4)', 'show/hide trees layer', 'eyeopen', 0, 0, 35, layerButtonsContainer, this.hideLayer.bind(this), 3)
		)
		this.layerHideButtons[0].highlight('active');

		const toolButtonsContainer = this.toolButtonsContainer = new Phaser.GameObjects.Container(scene);
		toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
		toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 204;
		toolButtonsContainer.width = 120;
		toolButtonsContainer.height = 170;
		scene.add.existing(toolButtonsContainer);

		this.modeButtons = [];
		this.modeButtons.push (
			new DevToolButton (this, '', 'Cursor Tool (C)', 'interact with regions and entities', 'cursor', 0, 0, 56, toolButtonsContainer, this.cursor.bind(this)),
			new DevToolButton (this, '', 'Region Tool (R)', 'draw new region', 'region', 60, 0, 56, toolButtonsContainer, this.drawRegion.bind(this)),
			new DevToolButton (this, '', 'Stamp Brush (B)', 'LMB: place selected tiles. RMB: copy tiles', 'stamp', 0, 34, 56, toolButtonsContainer, this.brush.bind(this)),
			new DevToolButton (this, '', 'Eraser (E)', 'delete tiles from selected layer', 'eraser', 60, 34, 56, toolButtonsContainer, this.emptyTile.bind(this)),
			new DevToolButton (this, '', 'Bucket Fill (F)', 'fill an area with the selected tile', 'fill', 0, 68, 56, toolButtonsContainer, this.fill.bind(this))
		)
		this.cursorButton = this.modeButtons[0];
		this.highlightModeButton(0);

		this.brushButtons = [];
		this.brushButtons.push (
			new DevToolButton (this, '1x1', '1x1', 'changes the brush size to 1x1', null, 0, 136, 56, toolButtonsContainer, this.selectSingle.bind(this)),
			new DevToolButton (this, '2x2', '2x2', 'changes the brush size to 2x2', null, 60, 136, 56, toolButtonsContainer, this.selectArea.bind(this))
		)
		this.brushButtons[0].highlight('active');

		this.tooltip = new DevTooltip(this.scene);

		this.palette.hide();
		this.layerButtonsContainer.setVisible(false);
		this.toolButtonsContainer.setVisible(false);
		this.regionEditor.hideRegions();

		const ctrlKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL, false);

		this.scene.input.on('pointermove', (p) => {
			if (ige.developerMode.active && ige.developerMode.activeTab !== 'play' && scene.tileEditor.startDragIn !== 'palette' && (p.rightButtonDown() || (p.isDown && ctrlKey.isDown))) {
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

	queryWidgets(): void {
		this.gameEditorWidgets = Array.from(document.querySelectorAll<HTMLElement>('.game-editor-widget'))
			.map((widget: HTMLElement) => widget.getBoundingClientRect());
	}

	checkIfInputModalPresent(): boolean {
		const customModals: any = document.querySelectorAll(".winbox, .modal, .custom-editor-modal");
		for (const customModal of customModals) {
			const inputs = customModal.querySelectorAll("input, select, textarea, button");
			for (let i = 0; i < inputs.length; i++) {
				if (inputs[i] === document.activeElement) {
					return true;
				}
			}
		}

		return false;
	}

	keyBindings(): void {
		const gameScene = this.scene.gameScene;
		const keyboard = this.scene.input.keyboard;
		const altKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT, false);
		const shiftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false);
		const tabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, false);
		tabKey.on('down', (key) => {
			const isInputModalPresent = this.checkIfInputModalPresent()
			if (!isInputModalPresent) {
				key.originalEvent.preventDefault();
			}

			if(!isInputModalPresent && ige.developerMode.active && ige.developerMode.activeTab === 'map') {
				if (this.palette.visible) {
					this.palette.hide();
				}
				else {
					this.palette.show()
				}
			}
		});
		const plusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, false);
		plusKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map') {
				const zoom = (gameScene.zoomSize / 2.15) / 1.1;
				ige.client.emit('zoom', zoom);
			}
		});
		const minusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
		minusKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map') {
				const zoom =(gameScene.zoomSize / 2.15) * 1.1;
				ige.client.emit('zoom', zoom);
			}
		});
		const cKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C, false);
		cKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map') {
				this.cursor();
			}
		});
		const rKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R, false);
		rKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map') {
				this.drawRegion();
			}
		});
		const bKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B, false);
		bKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map') {
				this.brush();
			}
		});
		const eKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E, false);
		eKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map') {
				this.emptyTile();
			}
		});
		const fKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F, false);
		fKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map') {
				this.fill();
			}
		});
		const oneKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE, false);
		oneKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map' && !altKey.isDown) {
				if (shiftKey.isDown) {
        		    this.hideLayer(0);
        		} else {
					this.switchLayer(0);
				}
			}
		});
		const twoKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO, false);
		twoKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map' && !altKey.isDown) {
				if (shiftKey.isDown) {
        		    this.hideLayer(1);
        		} else {
					this.switchLayer(1);
				}
			}
		});
		const threeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE, false);
		threeKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map' && !altKey.isDown) {
				if (shiftKey.isDown) {
        		    this.hideLayer(2);
        		} else {
					this.switchLayer(2);
				}
			}
		});
		const fourKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR, false);
		fourKey.on('down', () => {
			if(ige.developerMode.active && ige.developerMode.activeTab === 'map' && !altKey.isDown) {
				if (shiftKey.isDown) {
        		    this.hideLayer(3);
        		} else {
					this.switchLayer(3);
				}
			}
		});
	}

	cursor(): void {
		this.highlightModeButton(0);
		this.scene.regionEditor.regionTool = false;
		this.tileEditor.activateMarkers(false);
	}

	drawRegion(): void {
		this.tileEditor.activateMarkers(false);
		this.highlightModeButton(1);
		this.scene.regionEditor.regionTool = true;
	}

	brush(): void {
		if (this.modeButtons[3].active) {
			this.tileEditor.selectedTile = this.tileEditor.lastSelectedTile;
			this.tileEditor.selectedTileArea = this.tileEditor.lastSelectedTileArea;
		}
		this.tileEditor.activateMarkers(true);
		this.tileEditor.marker.changePreview();
		this.scene.regionEditor.regionTool = false;
		this.highlightModeButton(2);
	}

	emptyTile(): void {
		if (!this.modeButtons[3].active) {
			this.tileEditor.lastSelectedTile = this.tileEditor.selectedTile;
			this.tileEditor.lastSelectedTileArea = this.tileEditor.selectedTileArea
			const copy = { ...this.tileEditor.selectedTile };
			copy.index = 0;
			this.tileEditor.selectedTile = copy as any;
			this.tileEditor.selectedTileArea = [[copy, copy],[copy, copy]] as any;
			this.tileEditor.activateMarkers(true);
			this.tileEditor.marker.changePreview();
			this.scene.regionEditor.regionTool = false;
			this.highlightModeButton(3);
		}
	}

	fill(): void {
		if (this.modeButtons[3].active) {
			this.tileEditor.selectedTile = this.tileEditor.lastSelectedTile;
			this.tileEditor.selectedTileArea = this.tileEditor.lastSelectedTileArea;
		}
		this.tileEditor.activateMarkers(true);
		this.tileEditor.marker.changePreview();
		this.scene.regionEditor.regionTool = false;
		this.selectSingle();
		this.highlightModeButton(4);
	}

	highlightModeButton(n: number): void {
		this.modeButtons.forEach((button, index) => {
			if (index === n) button.highlight('active');
			else button.highlight('no');
		});
	}

	selectSingle(): void {
		for (let i = 0; i < this.tileEditor.area.x; i++) {
			for (let j = 0; j < this.tileEditor.area.y; j++) {
				if (this.tileEditor.selectedTileArea[i][j]) this.tileEditor.selectedTileArea[i][j].tint = 0xffffff;
			}
		}
		this.tileEditor.area = {x: 1, y: 1};
		this.brushButtons[0].highlight('active');
		this.brushButtons[1].highlight('no');
		this.tileEditor.activateMarkers(true);
		this.tileEditor.marker.changePreview();
		this.tileEditor.paletteMarker.changePreview();
		if (!this.modeButtons[3].active) {
			this.brush();
		}
	}

	selectArea(): void {
		if (this.tileEditor.selectedTile) this.tileEditor.selectedTile.tint = 0xffffff;
		this.tileEditor.area = {x: 2, y: 2};
		this.brushButtons[1].highlight('active');
		this.brushButtons[0].highlight('no');
		this.tileEditor.activateMarkers(true);
		this.tileEditor.marker.changePreview();
		this.tileEditor.paletteMarker.changePreview();
		if (!this.modeButtons[3].active) {
			this.brush();
		}
	}

	switchLayer(value: number): void {
		const scene = this.scene as any;
		const gameMap = scene.gameScene.tilemap;
		gameMap.currentLayerIndex = value;
		this.layerButtons.forEach(button => {
			button.highlight('no');
			button.increaseSize(false);
		});
		this.layerHideButtons.forEach(button => {
			button.highlight('no');
			button.increaseSize(false);
		});
		if (this.layerButtons[value] && this.layerHideButtons[value]) {
			this.layerHideButtons[value].image.setTexture('eyeopen');
			this.layerButtons[value].highlight('no');
			this.layerHideButtons[value].highlight('no');
			scene.gameScene.tilemapLayers[value].setVisible(true);

			this.layerButtons[value].highlight('active');
			this.layerButtons[value].increaseSize(true);
			this.layerHideButtons[value].highlight('active');
			this.layerHideButtons[value].increaseSize(true);
		}
	}

	hideLayer(value: number): void {
		const scene = this.scene as any;
		if (scene.gameScene.tilemap.currentLayerIndex === value) {
			this.switchLayer(-1);
			this.tileEditor.marker.graphics.setVisible(false);
		}
		const tilemapLayers = scene.gameScene.tilemapLayers;
		if (this.layerHideButtons[value].image.texture.key === 'eyeopen') {
			this.layerHideButtons[value].image.setTexture('eyeclosed');
			this.layerButtons[value].highlight('hidden');
			this.layerHideButtons[value].highlight('hidden');
			tilemapLayers[value].setVisible(false);
		} else {
			this.layerHideButtons[value].image.setTexture('eyeopen');
			this.layerButtons[value].hidden = false;
			this.layerButtons[value].highlight('no');
			this.layerHideButtons[value].hidden = false;
			this.layerHideButtons[value].highlight('no');
			tilemapLayers[value].setVisible(true);
		}
	}
}
