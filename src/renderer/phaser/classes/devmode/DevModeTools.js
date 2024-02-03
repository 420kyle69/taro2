var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var DevModeTools = /** @class */ (function (_super) {
    __extends(DevModeTools, _super);
    function DevModeTools(scene) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, scene) || this;
        _this.scene = scene;
        _this.brushSize = 1;
        _this.SECTION_WIDTH = 125;
        _this.BUTTON_HEIGHT = 33;
        _this.BUTTON_WIDTH = 39;
        _this.BUTTON_INTERSPACE = 4;
        _this.commandController = new CommandController({
            'increaseBrushSize': function () {
                _this.brushSize = Math.min(_this.brushSize + 1, 50);
                brushSizeSection.buttons[1].label.setText(_this.brushSize.toString());
                _this.updateBrushArea();
            }, 'decreaseBrushSize': function () {
                _this.brushSize = Math.max(_this.brushSize - 1, 1);
                brushSizeSection.buttons[1].label.setText(_this.brushSize.toString());
                _this.updateBrushArea();
            }
        }, _this.scene.gameScene.tilemap);
        var palette = _this.palette = new TilePalette(_this.scene, _this.scene.tileset, _this.scene.rexUI, _this.commandController);
        _this.tileEditor = new TileEditor(_this.scene.gameScene, _this.scene, _this, _this.commandController);
        _this.regionEditor = new RegionEditor(_this.scene.gameScene, _this.scene, _this);
        _this.entityEditor = new EntityEditor(_this.scene.gameScene, _this.scene, _this);
        _this.gameEditorWidgets = [];
        _this.keyBindings();
        _this.COLOR_PRIMARY = palette.COLOR_PRIMARY;
        _this.COLOR_LIGHT = palette.COLOR_LIGHT;
        _this.COLOR_WHITE = palette.COLOR_WHITE;
        _this.COLOR_GRAY = palette.COLOR_GRAY;
        var h = _this.BUTTON_HEIGHT;
        var w = _this.BUTTON_WIDTH;
        var s = _this.BUTTON_INTERSPACE;
        var toolButtonsContainer = _this.toolButtonsContainer = new Phaser.GameObjects.Container(_this.scene);
        scene.add.existing(toolButtonsContainer);
        var toolButtonSection = _this.toolButtonSection = new DevButtonSection(_this, 'Tools', 0, (h + s) * 5 - s);
        var brushSizeSection = new DevButtonSection(_this, 'Brush Size', toolButtonSection.height, (h + s) * 2 - s * 4);
        var layersCount = scene.gameScene.tilemapLayers.length;
        if (layersCount > 0)
            _this.layerButtonSection = new DevButtonSection(_this, 'Layers', toolButtonSection.height + brushSizeSection.height, (h * 0.75 + s) * layersCount + s * 3);
        var paletteButtonSection = new DevButtonSection(_this, '', toolButtonSection.height + brushSizeSection.height + ((_a = _this.layerButtonSection) === null || _a === void 0 ? void 0 : _a.height) || 0, h);
        _this.scene.scale.on(Phaser.Scale.Events.RESIZE, function () {
            var _a;
            toolButtonsContainer.height = s + toolButtonSection.height + brushSizeSection.height + paletteButtonSection.height + ((_a = _this.layerButtonSection) === null || _a === void 0 ? void 0 : _a.height) || 0;
            /*if (toolButtonsContainer.height > window.innerHeight * 0.5) {
                toolButtonsContainer.scale = (window.innerHeight * 0.5) / toolButtonsContainer.height;
            }*/
            toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - ((h * 4) * toolButtonsContainer.scale) + 22;
            toolButtonsContainer.y = palette.camera.y - (toolButtonsContainer.height * toolButtonsContainer.scale);
        });
        new DevToolButton(_this, '+', '+', 'Zoom in (+)', null, 0, -(h + s), h, h, palette.scrollBarContainer, palette.zoom.bind(palette), -1);
        new DevToolButton(_this, '-', '-', 'Zoom out (-)', null, h + s, -(h + s), h, h, palette.scrollBarContainer, palette.zoom.bind(palette), 1);
        toolButtonsContainer.height = s + toolButtonSection.height + brushSizeSection.height + paletteButtonSection.height + ((_b = _this.layerButtonSection) === null || _b === void 0 ? void 0 : _b.height) || 0;
        /*if (toolButtonsContainer.height > window.innerHeight * 0.5) {
            toolButtonsContainer.scale = (window.innerHeight * 0.5) / toolButtonsContainer.height;
        }*/
        toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - ((h * 4) * toolButtonsContainer.scale) + 22;
        toolButtonsContainer.y = palette.camera.y - (toolButtonsContainer.height * toolButtonsContainer.scale);
        _this.brushButtons = {
            'rectangle': new DevToolButton(_this, 'rectangle', 'rectangle', 'changes the brush shape to rectangle', null, -(h * 4 + 1.5 * s), (h + s) * 1, h * 4 - s, h, toolButtonsContainer, _this.changeShape.bind(_this), 'rectangle', [], false),
            'diamond': new DevToolButton(_this, 'diamond', 'diamond', 'changes the brush shape to diamond', null, -(h * 4 + 1.5 * s), (h + s) * 2, h * 4 - s, h, toolButtonsContainer, _this.changeShape.bind(_this), 'diamond', [], false),
            'circle': new DevToolButton(_this, 'circle', 'circle', 'changes the brush shape to circle', null, -(h * 4 + 1.5 * s), (h + s) * 3, h * 4 - s, h, toolButtonsContainer, _this.changeShape.bind(_this), 'circle', [], false),
        };
        _this.brushButtons['rectangle'].highlight('active');
        _this.modeButtons = toolButtonSection.buttons;
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Cursor Tool (C)', 'interact with regions and entities', 'cursor', 0, h + s, w, h, toolButtonsContainer, _this.cursor.bind(_this)));
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Region Tool (R)', 'draw new region', 'region', w + s, h + s, w, h, toolButtonsContainer, _this.drawRegion.bind(_this)));
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Stamp Brush (B)', 'LMB: place selected tiles. RMB: copy tiles', 'stamp', 0, 0, w, h, toolButtonsContainer, _this.brush.bind(_this) /*, undefined, Object.values(this.brushButtons))*/));
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Eraser (E)', 'delete tiles from selected layer', 'eraser', w + s, 0, w, h, toolButtonsContainer, _this.emptyTile.bind(_this)));
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Bucket Fill (F)', 'fill an area with the selected tile', 'fill', (w + s) * 2, 0, w, h, toolButtonsContainer, _this.fill.bind(_this)));
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Clear Layer (L)', 'clear selected layer', 'clear', 0, (h + s) * 2, w, h, toolButtonsContainer, _this.clear.bind(_this)));
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Save Map (S)', 'save all changes', 'save', (w + s) * 2, (h + s) * 2, w, h, toolButtonsContainer, _this.save.bind(_this)));
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Entities Tool (A)', 'LMB: Place selected Entity on the Map', 'entity', (w + s) * 2, h + s, w, h, toolButtonsContainer, _this.addEntities.bind(_this)));
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Undo (ctrl-z)', 'undo', 'undo', 0, (h + s) * 3 + s, w * 1.5, h, toolButtonsContainer, _this.commandController.undo.bind(_this.commandController)));
        toolButtonSection.addButton(new DevToolButton(_this, '', 'Redo (ctrl-shift-z | ctrl-y)', 'redo', 'redo', w * 1.5 + s * 2, (h + s) * 3 + s, w * 1.5, h, toolButtonsContainer, _this.commandController.redo.bind(_this.commandController)));
        _this.cursorButton = _this.modeButtons[0];
        _this.highlightModeButton(0);
        brushSizeSection.addButton(new DevToolButton(_this, '-', '-', 'decrease brush size', null, 0, 0, w, h, toolButtonsContainer, _this.commandController.defaultCommands.decreaseBrushSize.bind(_this)));
        brushSizeSection.addButton(new DevToolButton(_this, '1', '1', 'current brush size', null, w + s, 0, w, h, toolButtonsContainer, function () { }));
        brushSizeSection.addButton(new DevToolButton(_this, '+', '+', 'increase brush size', null, (w + s) * 2, 0, w, h, toolButtonsContainer, _this.commandController.defaultCommands.increaseBrushSize.bind(_this)));
        _this.layerButtons = [];
        _this.layerHideButtons = [];
        scene.gameScene.tilemapLayers.forEach(function (layer, index) {
            _this.layerButtonSection.addButton(new DevToolButton(_this, layer.name, "Layer (".concat(index + 1, ")"), "select the ".concat(layer.name, " layer"), null, h + s, /*(h + s) * 5 +*/ (h * 0.75 + s) * (layersCount - 1 - index), h * 2 + 25, h * 0.75, toolButtonsContainer, _this.switchLayer.bind(_this), index), _this.layerButtons);
            _this.layerButtonSection.addButton(new DevToolButton(_this, '', "Layer visibility (shift-".concat(index + 1, ")"), "show/hide ".concat(layer.name, " layer"), 'eyeopen', 0, /*(h + s) * 5*/ +(h * 0.75 + s) * (layersCount - 1 - index), h * 2 - 25, h * 0.75, toolButtonsContainer, _this.hideLayer.bind(_this), index), _this.layerHideButtons);
        });
        _this.layerButtons[0].highlight('active');
        _this.layerButtons[0].increaseSize(true);
        _this.layerHideButtons[0].highlight('active');
        _this.layerHideButtons[0].increaseSize(true);
        paletteButtonSection.addButton(new DevToolButton(_this, 'palette', 'Palette', 'show/hide palette', null, 0, 0, w * 2 + s * 2, h, toolButtonsContainer, palette.toggle.bind(palette)));
        paletteButtonSection.addButton(new DevToolButton(_this, 'X', 'Settings', 'open settings', null, w * 2 + s * 3, 0, w, h, toolButtonsContainer, palette.toggle.bind(palette)));
        _this.paletteButton = paletteButtonSection.buttons[0];
        _this.tooltip = new DevTooltip(_this.scene);
        _this.scene.cameras.getCamera('palette').ignore([_this.tooltip, _this.toolButtonsContainer]);
        _this.palette.hide();
        _this.toolButtonsContainer.setVisible(false);
        _this.regionEditor.hideRegions();
        _this.entityEditor.activatePlacement(false);
        var ctrlKey = _this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL, false);
        _this.scene.input.on('pointermove', function (p) {
            if (taro.developerMode.active && taro.developerMode.activeTab !== 'play' && scene.tileEditor.startDragIn !== 'palette' && (p.rightButtonDown() || (p.isDown && ctrlKey.isDown))) {
                var camera = _this.scene.gameScene.cameras.main;
                var scrollX_1 = (p.x - p.prevPosition.x) / camera.zoom;
                var scrollY_1 = (p.y - p.prevPosition.y) / camera.zoom;
                camera.scrollX -= scrollX_1;
                camera.scrollY -= scrollY_1;
            }
        });
        return _this;
    }
    DevModeTools.prototype.updateBrushArea = function () {
        this.tileEditor.brushArea.size = { x: this.brushSize, y: this.brushSize };
        this.tileEditor.marker.changePreview();
    };
    DevModeTools.prototype.enterMapTab = function () {
        this.toolButtonsContainer.setVisible(true);
        this.palette.show();
        this.regionEditor.showRegions();
    };
    DevModeTools.prototype.leaveMapTab = function () {
        this.regionEditor.cancelDrawRegion();
        this.palette.hide();
        this.toolButtonsContainer.setVisible(false);
        this.regionEditor.hideRegions();
        this.showAllLayers();
    };
    DevModeTools.prototype.queryWidgets = function () {
        this.gameEditorWidgets = Array.from(document.querySelectorAll('.game-editor-widget'))
            .map(function (widget) { return widget.getBoundingClientRect(); });
    };
    DevModeTools.prototype.checkIfInputModalPresent = function () {
        var customModals = document.querySelectorAll('.winbox, .modal, .custom-editor-modal, #chat-message-input');
        for (var _i = 0, customModals_1 = customModals; _i < customModals_1.length; _i++) {
            var customModal = customModals_1[_i];
            if (customModal.style.display === 'none') {
                continue;
            }
            var inputs = customModal.querySelectorAll('input, select, textarea, button');
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i] === document.activeElement) {
                    return true;
                }
            }
        }
        return false;
    };
    DevModeTools.prototype.isForceTo1x1 = function () {
        if (this.modeButtons[4].active) {
            return true;
        }
        return false;
    };
    DevModeTools.prototype.keyBindings = function () {
        var _this = this;
        var gameScene = this.scene.gameScene;
        var keyboard = this.scene.input.keyboard;
        var altKey = this.altKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT, true);
        var shiftKey = this.shiftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false);
        var tabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, false);
        tabKey.on('down', function (key) {
            var isInputModalPresent = _this.checkIfInputModalPresent();
            if (!isInputModalPresent) {
                key.originalEvent.preventDefault();
            }
            if (!isInputModalPresent && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                if (_this.palette.visible) {
                    _this.palette.hide();
                }
                else {
                    _this.palette.show();
                }
            }
        });
        var plusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, false);
        plusKey.on('down', function () {
            if (!_this.checkIfInputModalPresent()) {
                _this.tileEditor.tilePalette.changeBrushSize(-1);
            }
        });
        var minusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
        minusKey.on('down', function () {
            if (!_this.checkIfInputModalPresent()) {
                _this.tileEditor.tilePalette.changeBrushSize(1);
            }
        });
        var cKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C, false);
        cKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                _this.cursor();
            }
        });
        var rKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R, false);
        rKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                _this.drawRegion();
            }
        });
        var bKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B, false);
        bKey.on('down', function (key) {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                _this.brush();
            }
        });
        var eKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E, false);
        eKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                _this.emptyTile();
            }
        });
        var fKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F, false);
        fKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                _this.fill();
            }
        });
        var lKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L, false);
        lKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                _this.clear();
            }
        });
        var sKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false);
        sKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                _this.save();
            }
        });
        var aKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false);
        aKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                _this.addEntities();
            }
        });
        var oneKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE, false);
        oneKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map' && !altKey.isDown) {
                if (shiftKey.isDown) {
                    _this.hideLayer(0);
                }
                else {
                    _this.switchLayer(0);
                }
            }
        });
        var twoKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO, false);
        twoKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map' && !altKey.isDown) {
                if (shiftKey.isDown) {
                    _this.hideLayer(1);
                }
                else {
                    _this.switchLayer(1);
                }
            }
        });
        var threeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE, false);
        threeKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map' && !altKey.isDown) {
                if (shiftKey.isDown) {
                    _this.hideLayer(2);
                }
                else {
                    _this.switchLayer(2);
                }
            }
        });
        var fourKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR, false);
        fourKey.on('down', function () {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map' && !altKey.isDown) {
                if (shiftKey.isDown) {
                    _this.hideLayer(3);
                }
                else {
                    _this.switchLayer(3);
                }
            }
        });
        var undoKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z, false, true);
        undoKey.on('down', function (event) {
            if (event.ctrlKey) {
                if (event.shiftKey) {
                    _this.commandController.redo();
                }
                else {
                    _this.commandController.undo();
                }
            }
        });
        var redoKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y, false, true);
        redoKey.on('down', function (event) {
            if (event.ctrlKey) {
                _this.commandController.redo();
            }
        });
        var deleteEntity = function (event) {
            if (!_this.checkIfInputModalPresent() && taro.developerMode.active && taro.developerMode.activeTab === 'map') {
                _this.entityEditor.deleteInitEntity();
            }
        };
        var deleteKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE, false);
        var backspaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE, false);
        deleteKey.on('down', deleteEntity);
        backspaceKey.on('down', deleteEntity);
    };
    DevModeTools.prototype.cursor = function () {
        this.highlightModeButton(0);
        this.scene.regionEditor.regionTool = false;
        this.tileEditor.activateMarkers(false);
        this.entityEditor.activatePlacement(false);
    };
    DevModeTools.prototype.addEntities = function () {
        this.highlightModeButton(7);
        this.scene.regionEditor.regionTool = false;
        this.tileEditor.activateMarkers(false);
        this.entityEditor.activatePlacement(true);
    };
    DevModeTools.prototype.drawRegion = function () {
        this.tileEditor.activateMarkers(false);
        this.entityEditor.activatePlacement(false);
        this.highlightModeButton(1);
        this.scene.regionEditor.regionTool = true;
    };
    DevModeTools.prototype.brush = function () {
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
    };
    DevModeTools.prototype.emptyTile = function () {
        if (!this.modeButtons[3].active) {
            this.tileEditor.lastSelectedTileArea = this.tileEditor.selectedTileArea;
            this.tileEditor.selectedTileArea = { 0: { 0: -1 } };
            this.tileEditor.activateMarkers(true);
            this.entityEditor.activatePlacement(false);
            this.scene.regionEditor.regionTool = false;
            this.highlightModeButton(3);
            this.tileEditor.marker.changePreview();
        }
    };
    DevModeTools.prototype.fill = function () {
        if (this.modeButtons[3].active) {
            this.tileEditor.selectedTileArea = this.tileEditor.lastSelectedTileArea;
        }
        this.tileEditor.activateMarkers(true);
        this.entityEditor.activatePlacement(false);
        this.scene.regionEditor.regionTool = false;
        this.highlightModeButton(4);
        this.tileEditor.marker.changePreview();
    };
    DevModeTools.prototype.clear = function () {
        var gameMap = this.scene.gameScene.tilemap;
        //this.tileEditor.clearLayer(gameMap.currentLayerIndex, false);
        var data = {
            clear: {
                layer: gameMap.currentLayerIndex,
                layerName: this.layerButtons[gameMap.currentLayerIndex].name
            }
        };
        inGameEditor.showClearLayerConfirmation(data);
    };
    DevModeTools.prototype.save = function () {
        inGameEditor.saveMap();
    };
    DevModeTools.prototype.highlightModeButton = function (n) {
        this.modeButtons.forEach(function (button, index) {
            if (index === n)
                button.highlight('active');
            else
                button.highlight('no');
        });
    };
    DevModeTools.prototype.changeShape = function (shape) {
        if (!this.modeButtons[2].active) {
            this.brush();
        }
        this.tileEditor.brushArea.shape = shape;
        this.updateBrushArea();
        Object.values(this.brushButtons).map(function (btn) {
            btn.highlight('no');
        });
        this.brushButtons[shape].highlight('active');
    };
    DevModeTools.prototype.switchLayer = function (value) {
        var scene = this.scene;
        var gameMap = scene.gameScene.tilemap;
        if (!scene.gameScene.tilemapLayers[value])
            return;
        gameMap.currentLayerIndex = value;
        this.layerButtons.forEach(function (button) {
            button.highlight('no');
            button.increaseSize(false);
        });
        this.layerHideButtons.forEach(function (button) {
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
    };
    DevModeTools.prototype.hideLayer = function (value) {
        var scene = this.scene;
        if (!scene.gameScene.tilemapLayers[value])
            return;
        if (scene.gameScene.tilemap.currentLayerIndex === value) {
            this.switchLayer(-1);
            this.tileEditor.marker.graphics.setVisible(false);
        }
        var tilemapLayers = scene.gameScene.tilemapLayers;
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
    };
    DevModeTools.prototype.showAllLayers = function () {
        var scene = this.scene;
        var tilemapLayers = scene.gameScene.tilemapLayers;
        for (var i = 0; i < tilemapLayers.length; i++) {
            if (tilemapLayers[i].visible === false) {
                this.hideLayer(i);
            }
        }
    };
    return DevModeTools;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=DevModeTools.js.map