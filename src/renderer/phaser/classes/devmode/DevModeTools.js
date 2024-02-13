class DevModeTools extends Phaser.GameObjects.Container {
    constructor(scene) {
        var _a, _b;
        super(scene);
        this.scene = scene;
        this.brushSize = 1;
        this.SECTION_WIDTH = 90;
        this.BUTTON_HEIGHT = 25;
        this.BUTTON_WIDTH = 28;
        this.BUTTON_INTERSPACE = 3;
        this.commandController = new CommandController({
            'increaseBrushSize': () => {
                this.brushSize = Math.min(this.brushSize + 1, 50);
                brushSizeSection.buttons[1].label.setText(this.brushSize.toString());
                this.updateBrushArea();
            }, 'decreaseBrushSize': () => {
                this.brushSize = Math.max(this.brushSize - 1, 1);
                brushSizeSection.buttons[1].label.setText(this.brushSize.toString());
                this.updateBrushArea();
            }
        }, this.scene.gameScene.tilemap);
        const palette = this.palette = new TilePalette(this.scene, this.scene.tileset, this.scene.rexUI, this.commandController);
        this.tileEditor = new TileEditor(this.scene.gameScene, this.scene, this, this.commandController);
        this.regionEditor = new RegionEditor(this.scene.gameScene, this.scene, this);
        this.entityEditor = new EntityEditor(this.scene.gameScene, this.scene, this);
        this.gameEditorWidgets = [];
        this.keyBindings();
        this.COLOR_PRIMARY = palette.COLOR_PRIMARY;
        this.COLOR_LIGHT = palette.COLOR_LIGHT;
        this.COLOR_WHITE = palette.COLOR_WHITE;
        this.COLOR_GRAY = palette.COLOR_GRAY;
        const h = this.BUTTON_HEIGHT;
        const w = this.BUTTON_WIDTH;
        const s = this.BUTTON_INTERSPACE;
        const toolButtonsContainer = this.toolButtonsContainer = new Phaser.GameObjects.Container(this.scene);
        scene.add.existing(toolButtonsContainer);
        const toolButtonSection = this.toolButtonSection = new DevButtonSection(this, 'Tools', 0, (h + s) * 5 - s);
        const brushSizeSection = new DevButtonSection(this, 'Brush Size', toolButtonSection.height, (h + s) * 2 - s * 4);
        const layersCount = taro.game.data.map.layers.filter(layer => layer.type === 'tilelayer').length;
        if (layersCount > 0)
            this.layerButtonSection = new DevButtonSection(this, 'Layers', toolButtonSection.height + brushSizeSection.height, (h * 0.75 + s) * layersCount + s * 3);
        const paletteButtonSection = new DevButtonSection(this, '', toolButtonSection.height + brushSizeSection.height + ((_a = this.layerButtonSection) === null || _a === void 0 ? void 0 : _a.height) || 0, h);
        this.scene.scale.on(Phaser.Scale.Events.RESIZE, () => {
            var _a;
            toolButtonsContainer.height = s + toolButtonSection.height + brushSizeSection.height + paletteButtonSection.height + ((_a = this.layerButtonSection) === null || _a === void 0 ? void 0 : _a.height) || 0;
            if (window.innerHeight > 900) {
                toolButtonsContainer.scale = 1.25;
            }
            else if (window.innerHeight > 1200) {
                toolButtonsContainer.scale = 1.5;
            }
            else {
                toolButtonsContainer.scale = 1;
            }
            toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - (this.SECTION_WIDTH * toolButtonsContainer.scale) + 22;
            toolButtonsContainer.y = palette.camera.y - (toolButtonsContainer.height * toolButtonsContainer.scale);
        });
        new DevToolButton(this, '+', '+', 'Zoom in (+)', null, 0, -(h + s), h, h, palette.scrollBarContainer, palette.zoom.bind(palette), -1);
        new DevToolButton(this, '-', '-', 'Zoom out (-)', null, h + s, -(h + s), h, h, palette.scrollBarContainer, palette.zoom.bind(palette), 1);
        toolButtonsContainer.height = s + toolButtonSection.height + brushSizeSection.height + paletteButtonSection.height + ((_b = this.layerButtonSection) === null || _b === void 0 ? void 0 : _b.height) || 0;
        if (window.innerHeight > 900) {
            toolButtonsContainer.scale = 1.25;
        }
        else if (window.innerHeight > 1200) {
            toolButtonsContainer.scale = 1.5;
        }
        else {
            toolButtonsContainer.scale = 1;
        }
        toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - (this.SECTION_WIDTH * toolButtonsContainer.scale) + 22;
        toolButtonsContainer.y = palette.camera.y - (toolButtonsContainer.height * toolButtonsContainer.scale);
        this.brushButtons = {
            'rectangle': new DevToolButton(this, 'rectangle', 'rectangle', 'changes the brush shape to rectangle', null, -(h * 4 + 1.5 * s), (h + s) * 1, h * 4 - s, h, toolButtonsContainer, this.changeShape.bind(this), 'rectangle', [], false),
            'diamond': new DevToolButton(this, 'diamond', 'diamond', 'changes the brush shape to diamond', null, -(h * 4 + 1.5 * s), (h + s) * 2, h * 4 - s, h, toolButtonsContainer, this.changeShape.bind(this), 'diamond', [], false),
            'circle': new DevToolButton(this, 'circle', 'circle', 'changes the brush shape to circle', null, -(h * 4 + 1.5 * s), (h + s) * 3, h * 4 - s, h, toolButtonsContainer, this.changeShape.bind(this), 'circle', [], false),
        };
        this.brushButtons['rectangle'].highlight('active');
        this.modeButtons = toolButtonSection.buttons;
        toolButtonSection.addButton(new DevToolButton(this, '', 'Cursor Tool (C)', 'interact with regions and entities', 'cursor', 0, h + s, w, h, toolButtonsContainer, this.cursor.bind(this)));
        toolButtonSection.addButton(new DevToolButton(this, '', 'Region Tool (R)', 'draw new region', 'region', w + s, h + s, w, h, toolButtonsContainer, this.drawRegion.bind(this)));
        toolButtonSection.addButton(new DevToolButton(this, '', 'Stamp Brush (B)', 'LMB: place selected tiles. RMB: copy tiles', 'stamp', 0, 0, w, h, toolButtonsContainer, this.brush.bind(this) /*, undefined, Object.values(this.brushButtons))*/));
        toolButtonSection.addButton(new DevToolButton(this, '', 'Eraser (E)', 'delete tiles from selected layer', 'eraser', w + s, 0, w, h, toolButtonsContainer, this.emptyTile.bind(this)));
        toolButtonSection.addButton(new DevToolButton(this, '', 'Bucket Fill (F)', 'fill an area with the selected tile', 'fill', (w + s) * 2, 0, w, h, toolButtonsContainer, this.fill.bind(this)));
        toolButtonSection.addButton(new DevToolButton(this, '', 'Clear Layer (L)', 'clear selected layer', 'clear', 0, (h + s) * 2, w, h, toolButtonsContainer, this.clear.bind(this)));
        toolButtonSection.addButton(new DevToolButton(this, '', 'Save Map (S)', 'save all changes', 'save', (w + s) * 2, (h + s) * 2, w, h, toolButtonsContainer, this.save.bind(this)));
        toolButtonSection.addButton(new DevToolButton(this, '', 'Entities Tool (A)', 'LMB: Place selected Entity on the Map', 'entity', (w + s) * 2, h + s, w, h, toolButtonsContainer, this.addEntities.bind(this)));
        toolButtonSection.addButton(new DevToolButton(this, '', 'Undo (ctrl-z)', 'undo', 'undo', 0, (h + s) * 3 + s, w * 1.5, h, toolButtonsContainer, this.commandController.undo.bind(this.commandController)));
        toolButtonSection.addButton(new DevToolButton(this, '', 'Redo (ctrl-shift-z | ctrl-y)', 'redo', 'redo', w * 1.5 + s * 2, (h + s) * 3 + s, w * 1.5, h, toolButtonsContainer, this.commandController.redo.bind(this.commandController)));
        this.cursorButton = this.modeButtons[0];
        this.highlightModeButton(0);
        brushSizeSection.addButton(new DevToolButton(this, '-', '-', 'decrease brush size', null, 0, 0, w, h, toolButtonsContainer, this.commandController.defaultCommands.decreaseBrushSize.bind(this)));
        brushSizeSection.addButton(new DevToolButton(this, '1', '1', 'current brush size', null, w + s, 0, w, h, toolButtonsContainer, () => { }));
        brushSizeSection.addButton(new DevToolButton(this, '+', '+', 'increase brush size', null, (w + s) * 2, 0, w, h, toolButtonsContainer, this.commandController.defaultCommands.increaseBrushSize.bind(this)));
        this.layerButtons = [];
        this.layerHideButtons = [];
        let layerIndex = 0;
        scene.gameScene.tilemapLayers.forEach((layer, index) => {
            if (taro.game.data.map.layers[index].type === 'tilelayer' && taro.game.data.map.layers[index].data) {
                this.layerButtonSection.addButton(new DevToolButton(this, layer.name, `Layer (${index})`, `select the ${layer.name} layer`, null, w * 0.7, (h * 0.75 + s) * (layersCount - 1 - layerIndex), w * 2.5, h * 0.75, toolButtonsContainer, this.switchLayer.bind(this), index), this.layerButtons);
                this.layerButtonSection.addButton(new DevToolButton(this, '', `Layer visibility (shift-${index})`, `show/hide ${layer.name} layer`, 'eyeopen', 0, (h * 0.75 + s) * (layersCount - 1 - layerIndex), w, h * 0.75, toolButtonsContainer, this.hideLayer.bind(this), index), this.layerHideButtons);
                layerIndex++;
            }
            else {
                this.layerButtons.push(null);
                this.layerHideButtons.push(null);
            }
        });
        this.layerButtons[0].highlight('active');
        this.layerButtons[0].increaseSize(true);
        this.layerHideButtons[0].highlight('active');
        this.layerHideButtons[0].increaseSize(true);
        paletteButtonSection.addButton(new DevToolButton(this, 'palette', 'Palette', 'show/hide palette', null, 0, 0, w * 2 + s * 2, h, toolButtonsContainer, palette.toggle.bind(palette)));
        paletteButtonSection.addButton(new DevToolButton(this, '', 'Settings', 'open map settings', 'settings', w * 2 + s * 3, 0, w, h, toolButtonsContainer, this.settings.bind(this)));
        this.paletteButton = paletteButtonSection.buttons[0];
        this.tooltip = new DevTooltip(this.scene);
        this.scene.cameras.getCamera('palette').ignore([this.tooltip, this.toolButtonsContainer]);
        this.palette.hide();
        this.toolButtonsContainer.setVisible(false);
        this.regionEditor.hideRegions();
        this.entityEditor.activatePlacement(false);
        const ctrlKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL, false);
        this.scene.input.on('pointermove', (p) => {
            if (taro.developerMode.active && taro.developerMode.activeTab !== 'play' && scene.tileEditor.startDragIn !== 'palette' && (p.rightButtonDown() || (p.isDown && ctrlKey.isDown))) {
                const camera = this.scene.gameScene.cameras.main;
                const scrollX = (p.x - p.prevPosition.x) / camera.zoom;
                const scrollY = (p.y - p.prevPosition.y) / camera.zoom;
                camera.scrollX -= scrollX;
                camera.scrollY -= scrollY;
            }
        });
    }
    updateBrushArea() {
        this.tileEditor.brushArea.size = { x: this.brushSize, y: this.brushSize };
        this.tileEditor.marker.changePreview();
    }
    enterMapTab() {
        this.toolButtonsContainer.setVisible(true);
        this.palette.show();
        this.regionEditor.showRegions();
    }
    leaveMapTab() {
        this.regionEditor.cancelDrawRegion();
        this.palette.hide();
        this.toolButtonsContainer.setVisible(false);
        this.regionEditor.hideRegions();
        this.showAllLayers();
    }
    queryWidgets() {
        this.gameEditorWidgets = Array.from(document.querySelectorAll('.game-editor-widget'))
            .map((widget) => widget.getBoundingClientRect());
    }
    checkIfInputModalPresent() {
        const customModals = document.querySelectorAll('.winbox, .modal, .custom-editor-modal, #chat-message-input');
        for (const customModal of customModals) {
            if (customModal.style.display === 'none') {
                continue;
            }
            const inputs = customModal.querySelectorAll('input, select, textarea, button');
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i] === document.activeElement) {
                    return true;
                }
            }
        }
        return false;
    }
    isForceTo1x1() {
        if (this.modeButtons[4].active) {
            return true;
        }
        return false;
    }
    keyBindings() {
        const gameScene = this.scene.gameScene;
        const keyboard = this.scene.input.keyboard;
        const altKey = this.altKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT, true);
        const shiftKey = this.shiftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false);
        const tabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, false);
        tabKey.on('down', (key) => {
            const isInputModalPresent = this.checkIfInputModalPresent();
            if (!isInputModalPresent) {
                key.originalEvent.preventDefault();
            }
            if (!isInputModalPresent && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                if (this.palette.visible) {
                    this.palette.hide();
                }
                else {
                    this.palette.show();
                }
            }
        });
        const plusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, false);
        plusKey.on('down', () => {
            if (!this.checkIfInputModalPresent()) {
                this.tileEditor.tilePalette.changeBrushSize(-1);
            }
        });
        const minusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
        minusKey.on('down', () => {
            if (!this.checkIfInputModalPresent()) {
                this.tileEditor.tilePalette.changeBrushSize(1);
            }
        });
        const cKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C, false);
        cKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                this.cursor();
            }
        });
        const rKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R, false);
        rKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                this.drawRegion();
            }
        });
        const bKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B, false);
        bKey.on('down', (key) => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                this.brush();
            }
        });
        const eKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E, false);
        eKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                this.emptyTile();
            }
        });
        const fKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F, false);
        fKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                this.fill();
            }
        });
        const lKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L, false);
        lKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                this.clear();
            }
        });
        const sKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false);
        sKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                this.save();
            }
        });
        const aKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false);
        aKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                this.addEntities();
            }
        });
        const oneKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE, false);
        oneKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map' && !altKey.isDown) {
                if (shiftKey.isDown) {
                    this.hideLayer(0);
                }
                else {
                    this.switchLayer(0);
                }
            }
        });
        const twoKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO, false);
        twoKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map' && !altKey.isDown) {
                if (shiftKey.isDown) {
                    this.hideLayer(1);
                }
                else {
                    this.switchLayer(1);
                }
            }
        });
        const threeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE, false);
        threeKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map' && !altKey.isDown) {
                if (shiftKey.isDown) {
                    this.hideLayer(2);
                }
                else {
                    this.switchLayer(2);
                }
            }
        });
        const fourKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR, false);
        fourKey.on('down', () => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map' && !altKey.isDown) {
                if (shiftKey.isDown) {
                    this.hideLayer(3);
                }
                else {
                    this.switchLayer(3);
                }
            }
        });
        const undoKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z, false, true);
        undoKey.on('down', (event) => {
            if (event.ctrlKey) {
                if (event.shiftKey) {
                    this.commandController.redo();
                }
                else {
                    this.commandController.undo();
                }
            }
        });
        const redoKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y, false, true);
        redoKey.on('down', (event) => {
            if (event.ctrlKey) {
                this.commandController.redo();
            }
        });
        const deleteEntity = (event) => {
            if (!this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                this.entityEditor.deleteInitEntity();
            }
        };
        const deleteKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE, false);
        const backspaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE, false);
        deleteKey.on('down', deleteEntity);
        backspaceKey.on('down', deleteEntity);
    }
    cursor() {
        this.highlightModeButton(0);
        this.scene.regionEditor.regionTool = false;
        this.tileEditor.activateMarkers(false);
        this.entityEditor.activatePlacement(false);
    }
    addEntities() {
        this.highlightModeButton(7);
        this.scene.regionEditor.regionTool = false;
        this.tileEditor.activateMarkers(false);
        this.entityEditor.activatePlacement(true);
    }
    drawRegion() {
        this.tileEditor.activateMarkers(false);
        this.entityEditor.activatePlacement(false);
        this.highlightModeButton(1);
        this.scene.regionEditor.regionTool = true;
    }
    brush() {
        if (this.modeButtons[2].active) {
            return;
        }
        if (this.modeButtons[3].active) {
            this.tileEditor.selectedTileArea = this.tileEditor.lastSelectedTileArea;
        }
        this.tileEditor.activateMarkers(true);
        this.entityEditor.activatePlacement(false);
        this.scene.regionEditor.regionTool = false;
        this.highlightModeButton(2);
        this.tileEditor.marker.changePreview();
    }
    emptyTile() {
        if (!this.modeButtons[3].active) {
            this.tileEditor.lastSelectedTileArea = this.tileEditor.selectedTileArea;
            this.tileEditor.selectedTileArea = { 0: { 0: -1 } };
            this.tileEditor.activateMarkers(true);
            this.entityEditor.activatePlacement(false);
            this.scene.regionEditor.regionTool = false;
            this.highlightModeButton(3);
            this.tileEditor.marker.changePreview();
        }
    }
    fill() {
        if (this.modeButtons[3].active) {
            this.tileEditor.selectedTileArea = this.tileEditor.lastSelectedTileArea;
        }
        this.tileEditor.activateMarkers(true);
        this.entityEditor.activatePlacement(false);
        this.scene.regionEditor.regionTool = false;
        this.highlightModeButton(4);
        this.tileEditor.marker.changePreview();
    }
    clear() {
        const gameMap = this.scene.gameScene.tilemap;
        const data = {
            clear: {
                layer: gameMap.currentLayerIndex,
                layerName: this.layerButtons[gameMap.currentLayerIndex].name
            }
        };
        inGameEditor.showClearLayerConfirmation(data);
    }
    save() {
        inGameEditor.saveMap();
    }
    settings() {
        inGameEditor.openMapConfiguration();
    }
    highlightModeButton(n) {
        this.modeButtons.forEach((button, index) => {
            if (index === n)
                button.highlight('active');
            else
                button.highlight('no');
        });
    }
    changeShape(shape) {
        if (!this.modeButtons[2].active) {
            this.brush();
        }
        this.tileEditor.brushArea.shape = shape;
        this.updateBrushArea();
        Object.values(this.brushButtons).map((btn) => {
            btn.highlight('no');
        });
        this.brushButtons[shape].highlight('active');
    }
    switchLayer(value) {
        const scene = this.scene;
        const gameMap = scene.gameScene.tilemap;
        if (!scene.gameScene.tilemapLayers[value])
            return;
        gameMap.currentLayerIndex = value;
        this.layerButtons.forEach(button => {
            button === null || button === void 0 ? void 0 : button.highlight('no');
            button === null || button === void 0 ? void 0 : button.increaseSize(false);
        });
        this.layerHideButtons.forEach(button => {
            button === null || button === void 0 ? void 0 : button.highlight('no');
            button === null || button === void 0 ? void 0 : button.increaseSize(false);
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
    hideLayer(value) {
        const scene = this.scene;
        if (!scene.gameScene.tilemapLayers[value])
            return;
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
        }
        else {
            this.layerHideButtons[value].image.setTexture('eyeopen');
            this.layerButtons[value].hidden = false;
            this.layerButtons[value].highlight('no');
            this.layerHideButtons[value].hidden = false;
            this.layerHideButtons[value].highlight('no');
            tilemapLayers[value].setVisible(true);
        }
    }
    showAllLayers() {
        const scene = this.scene;
        const tilemapLayers = scene.gameScene.tilemapLayers;
        for (let i = 0; i < tilemapLayers.length; i++) {
            if (tilemapLayers[i].visible === false) {
                this.hideLayer(i);
            }
        }
    }
}
//# sourceMappingURL=DevModeTools.js.map