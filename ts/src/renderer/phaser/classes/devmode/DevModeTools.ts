class DevModeTools extends Phaser.GameObjects.Container {

	public scene: DevModeScene;
	private palette: TilePalette;
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
		palette: TilePalette
	) {
		super(scene);

		this.palette = palette;
		this.regionEditor = new RegionEditor(this.scene.gameScene, this.scene, this);

		this.COLOR_PRIMARY = palette.COLOR_PRIMARY;
		this.COLOR_LIGHT = palette.COLOR_LIGHT;
		this.COLOR_DARK = palette.COLOR_DARK;

		this.scene.scale.on(Phaser.Scale.Events.RESIZE, () => {
			layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
			layerButtonsContainer.y = palette.camera.y - 170;
			toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
			toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 136;
		});

		new DevToolButton (this, '+', null, 0, -34, 30, palette.scrollBarContainer, palette.zoom.bind(this), -1);
		new DevToolButton (this, '-', null, 34, -34, 30, palette.scrollBarContainer, palette.zoom.bind(this), 1);

		const layerButtonsContainer = this.layerButtonsContainer = new Phaser.GameObjects.Container(scene);
		layerButtonsContainer.width = 120;
		layerButtonsContainer.height = 204;
		layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
		layerButtonsContainer.y = palette.camera.y - 204;
		scene.add.existing(layerButtonsContainer);
		
		new DevToolButton (this, 'palette', null, 0, 170, 120, layerButtonsContainer, palette.toggle.bind(this));

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
	}

	cursor() {
		this.highlightModeButton(0);
		this.scene.regionEditor.regionTool = false;
		this.scene.activateMarker(false);
	}

	drawRegion() {
		this.scene.activateMarker(false);
		this.highlightModeButton(1);
		this.scene.regionEditor.regionTool = true;
	}

	brush() {
		this.scene.selectedTile = null;
		this.scene.selectedTileArea = [[null, null],[null, null]] as any;
		this.scene.activateMarker(true);
		this.scene.regionEditor.regionTool = false;
		this.highlightModeButton(2);
	}

	emptyTile() {
		var copy = { ...this.scene.selectedTile };
		copy.index = 0;
		this.scene.selectedTile = copy as any;
		this.scene.selectedTileArea = [[copy, copy],[copy, copy]] as any;
		this.scene.activateMarker(true);
		this.scene.regionEditor.regionTool = false;
		this.highlightModeButton(3);
	}

	highlightModeButton(n: number) {
		this.modeButtons.forEach((button, index) => {
			if (index === n) button.highlight(true);
			else button.highlight(false);
		});
	}

	selectSingle() {
		for (let i = 0; i < this.palette.area.x; i++) {
			for (let j = 0; j < this.palette.area.y; j++) {
				if (this.scene.selectedTileArea[i][j]) this.scene.selectedTileArea[i][j].tint = 0xffffff;
			}
		}
		this.palette.area = {x: 1, y: 1};
		this.scene.marker.graphics.scale = 1;
		this.scene.paletteMarker.graphics.scale = 1;
		this.brushButtons[0].highlight(true);
		this.brushButtons[1].highlight(false);
		this.scene.activateMarker(true);
	}

	selectArea() {
		if (this.scene.selectedTile) this.scene.selectedTile.tint = 0xffffff;
		this.palette.area = {x: 2, y: 2};
		this.scene.marker.graphics.scale = 2;
		this.scene.paletteMarker.graphics.scale = 2;
		this.brushButtons[1].highlight(true);
		this.brushButtons[0].highlight(false);
		this.scene.activateMarker(true);
	}

	switchLayer(value) {
		const scene = this.scene as any;
		const gameMap = scene.gameScene.tilemap;
		gameMap.currentLayerIndex = value;
		this.layerButtons.forEach(button => {
			button.highlight(false);
		});
		this.layerButtons[value].highlight(true);
		
	}
}
