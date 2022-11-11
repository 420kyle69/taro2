class DevModeTools extends Phaser.GameObjects.Container {

	public scene: DevModeScene;
	public palette: TilePalette;
	public tileEditor: TileEditor;
	public regionEditor: RegionEditor;

	cursorButton: DevToolButton;
	layerButtonsContainer: Phaser.GameObjects.Container;
	layerButtons: DevToolButton[];
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
			new DevToolButton (this, 'floor', null, 0, 102, 120, layerButtonsContainer, this.switchLayer.bind(this), 0),
			new DevToolButton (this, 'floor2', null, 0, 68, 120, layerButtonsContainer, this.switchLayer.bind(this), 1),
			new DevToolButton (this, 'walls', null, 0, 34, 120, layerButtonsContainer, this.switchLayer.bind(this), 2),
			new DevToolButton (this, 'trees', null, 0, 0, 120, layerButtonsContainer, this.switchLayer.bind(this), 3)
		)
		this.layerButtons[0].highlight(true);

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
	}

	enterDevMode(): void {
		this.layerButtonsContainer.setVisible(true);
		this.toolButtonsContainer.setVisible(true);
		this.highlightModeButton(0);
		this.tileEditor.activateMarker(false);
		this.palette.show();
		this.regionEditor.showRegions();
	}

	leaveDevMode(): void {
		this.regionEditor.cancelDrawRegion();
		this.palette.hide();
		this.layerButtonsContainer.setVisible(false);
		this.toolButtonsContainer.setVisible(false);
		this.regionEditor.hideRegions();
		ige.client.emit('zoom', this.scene.defaultZoom);
	}

	keyBindings(): void {
		const gameScene = this.scene.gameScene;
		const keyboard = this.scene.input.keyboard;

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

		const tabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
		tabKey.on('down', () => {
			if (shouldPreventKeybindings()) {
				keyboard.disableGlobalCapture();
			} else {
				keyboard.enableGlobalCapture();
				if(ige.developerMode.active) {
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
			if(ige.developerMode.active && !shouldPreventKeybindings()) {
				const zoom = (gameScene.zoomSize / 2.15) / 1.1;
				ige.client.emit('zoom', zoom);
			}
		});
		const minusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
		minusKey.on('down', () => {
			if(ige.developerMode.active && !shouldPreventKeybindings()) {
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
			this.tileEditor.selectedTile = null;
			this.tileEditor.selectedTileArea = [[null, null],[null, null]] as any;
		}
		this.tileEditor.activateMarker(true);
		this.scene.regionEditor.regionTool = false;
		this.highlightModeButton(2);
	}

	emptyTile(): void {
		if (this.tileEditor.selectedTile) this.tileEditor.selectedTile.tint = 0xffffff;
		for (let i = 0; i < this.tileEditor.area.x; i++) {
			for (let j = 0; j < this.tileEditor.area.y; j++) {
				if (this.tileEditor.selectedTileArea[i][j]) this.tileEditor.selectedTileArea[i][j].tint = 0xffffff;
			}
		}
		var copy = { ...this.tileEditor.selectedTile };
		copy.index = 0;
		this.tileEditor.selectedTile = copy as any;
		this.tileEditor.selectedTileArea = [[copy, copy],[copy, copy]] as any;
		this.tileEditor.activateMarker(true);
		this.scene.regionEditor.regionTool = false;
		this.highlightModeButton(3);
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
		this.layerButtons[value].highlight(true);
		
	}
}
