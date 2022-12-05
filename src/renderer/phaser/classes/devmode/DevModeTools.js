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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var DevModeTools = /** @class */ (function (_super) {
    __extends(DevModeTools, _super);
    function DevModeTools(scene) {
        var _this = _super.call(this, scene) || this;
        var palette = _this.palette = new TilePalette(_this.scene, _this.scene.tileset, _this.scene.rexUI);
        _this.tileEditor = new TileEditor(_this.scene.gameScene, _this.scene, _this);
        _this.regionEditor = new RegionEditor(_this.scene.gameScene, _this.scene, _this);
        _this.keyBindings();
        _this.COLOR_PRIMARY = palette.COLOR_PRIMARY;
        _this.COLOR_LIGHT = palette.COLOR_LIGHT;
        _this.COLOR_DARK = palette.COLOR_DARK;
        _this.scene.scale.on(Phaser.Scale.Events.RESIZE, function () {
            layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
            layerButtonsContainer.y = palette.camera.y - 170;
            toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
            toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 136;
        });
        new DevToolButton(_this, '+', null, 0, -34, 30, palette.scrollBarContainer, palette.zoom.bind(palette), -1);
        new DevToolButton(_this, '-', null, 34, -34, 30, palette.scrollBarContainer, palette.zoom.bind(palette), 1);
        var layerButtonsContainer = _this.layerButtonsContainer = new Phaser.GameObjects.Container(scene);
        layerButtonsContainer.width = 120;
        layerButtonsContainer.height = 204;
        layerButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
        layerButtonsContainer.y = palette.camera.y - 204;
        scene.add.existing(layerButtonsContainer);
        new DevToolButton(_this, 'palette', null, 0, 170, 120, layerButtonsContainer, palette.toggle.bind(palette));
        _this.layerButtons = [];
        _this.layerButtons.push(new DevToolButton(_this, 'floor', null, 30, 102, 85, layerButtonsContainer, _this.switchLayer.bind(_this), 0), new DevToolButton(_this, 'floor2', null, 30, 68, 85, layerButtonsContainer, _this.switchLayer.bind(_this), 1), new DevToolButton(_this, 'walls', null, 30, 34, 85, layerButtonsContainer, _this.switchLayer.bind(_this), 2), new DevToolButton(_this, 'trees', null, 30, 0, 85, layerButtonsContainer, _this.switchLayer.bind(_this), 3));
        _this.layerButtons[0].highlight(true);
        _this.layerHideButtons = [];
        _this.layerHideButtons.push(new DevToolButton(_this, '', 'eyeopen', 0, 102, 35, layerButtonsContainer, _this.hideLayer.bind(_this), 0), new DevToolButton(_this, '', 'eyeopen', 0, 68, 35, layerButtonsContainer, _this.hideLayer.bind(_this), 1), new DevToolButton(_this, '', 'eyeopen', 0, 34, 35, layerButtonsContainer, _this.hideLayer.bind(_this), 2), new DevToolButton(_this, '', 'eyeopen', 0, 0, 35, layerButtonsContainer, _this.hideLayer.bind(_this), 3));
        _this.layerHideButtons[0].highlight(true);
        var toolButtonsContainer = _this.toolButtonsContainer = new Phaser.GameObjects.Container(scene);
        toolButtonsContainer.x = palette.camera.x + palette.paletteWidth - 98;
        toolButtonsContainer.y = palette.camera.y - layerButtonsContainer.height - 184;
        toolButtonsContainer.width = 120;
        toolButtonsContainer.height = 98;
        scene.add.existing(toolButtonsContainer);
        _this.modeButtons = [];
        _this.modeButtons.push(new DevToolButton(_this, '', 'cursor', 0, 0, 58, toolButtonsContainer, _this.cursor.bind(_this)), new DevToolButton(_this, '', 'region', 62, 0, 58, toolButtonsContainer, _this.drawRegion.bind(_this)), new DevToolButton(_this, '', 'stamp', 0, 34, 58, toolButtonsContainer, _this.brush.bind(_this)), new DevToolButton(_this, '', 'eraser', 62, 34, 58, toolButtonsContainer, _this.emptyTile.bind(_this)));
        _this.cursorButton = _this.modeButtons[0];
        _this.highlightModeButton(0);
        _this.brushButtons = [];
        _this.brushButtons.push(new DevToolButton(_this, '1x1', null, 0, 102, 58, toolButtonsContainer, _this.selectSingle.bind(_this)), new DevToolButton(_this, '2x2', null, 62, 102, 58, toolButtonsContainer, _this.selectArea.bind(_this)));
        _this.brushButtons[0].highlight(true);
        _this.palette.hide();
        _this.layerButtonsContainer.setVisible(false);
        _this.toolButtonsContainer.setVisible(false);
        _this.regionEditor.hideRegions();
        var ctrlKey = _this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL, false);
        _this.scene.input.on('pointermove', function (p) {
            if (ige.developerMode.active && ige.developerMode.activeTab !== 'play' && (p.rightButtonDown() || (p.isDown && ctrlKey.isDown))) {
                var camera = this.scene.gameScene.cameras.main;
                var scrollX_1 = (p.x - p.prevPosition.x) / camera.zoom;
                var scrollY_1 = (p.y - p.prevPosition.y) / camera.zoom;
                camera.scrollX -= scrollX_1;
                camera.scrollY -= scrollY_1;
            }
            ;
        });
        return _this;
    }
    DevModeTools.prototype.enterMapTab = function () {
        this.layerButtonsContainer.setVisible(true);
        this.toolButtonsContainer.setVisible(true);
        this.highlightModeButton(0);
        this.tileEditor.activateMarker(false);
        this.palette.show();
        this.regionEditor.showRegions();
    };
    DevModeTools.prototype.leaveMapTab = function () {
        this.regionEditor.cancelDrawRegion();
        this.palette.hide();
        this.layerButtonsContainer.setVisible(false);
        this.toolButtonsContainer.setVisible(false);
        this.regionEditor.hideRegions();
    };
    DevModeTools.prototype.keyBindings = function () {
        var _this = this;
        var gameScene = this.scene.gameScene;
        var keyboard = this.scene.input.keyboard;
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
        var tabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
        tabKey.on('down', function () {
            //temporary for testing
            var newData = {
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
            _this.scene.editEntity({ entityType: 'unit',
                typeId: 'tree',
                action: 'update',
                newData: newData
            });
            if (ige.developerMode.shouldPreventKeybindings()) {
                keyboard.disableGlobalCapture();
            }
            else {
                keyboard.enableGlobalCapture();
                if (ige.developerMode.active && ige.developerMode.activeTab === 'map') {
                    if (_this.palette.visible) {
                        _this.palette.hide();
                    }
                    else {
                        _this.palette.show();
                    }
                }
            }
        });
        var plusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, false);
        plusKey.on('down', function () {
            if (ige.developerMode.active && ige.developerMode.activeTab !== 'play' && !ige.developerMode.shouldPreventKeybindings()) {
                var zoom = (gameScene.zoomSize / 2.15) / 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        var minusKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
        minusKey.on('down', function () {
            if (ige.developerMode.active && ige.developerMode.activeTab !== 'play' && !ige.developerMode.shouldPreventKeybindings()) {
                var zoom = (gameScene.zoomSize / 2.15) * 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
    };
    DevModeTools.prototype.cursor = function () {
        this.highlightModeButton(0);
        this.scene.regionEditor.regionTool = false;
        this.tileEditor.activateMarker(false);
    };
    DevModeTools.prototype.drawRegion = function () {
        this.tileEditor.activateMarker(false);
        this.highlightModeButton(1);
        this.scene.regionEditor.regionTool = true;
    };
    DevModeTools.prototype.brush = function () {
        if (this.modeButtons[3].active) {
            this.tileEditor.selectedTile = this.tileEditor.lastSelectedTile;
            this.tileEditor.selectedTileArea = this.tileEditor.lastSelectedTileArea;
        }
        this.tileEditor.activateMarker(true);
        this.scene.regionEditor.regionTool = false;
        this.highlightModeButton(2);
    };
    DevModeTools.prototype.emptyTile = function () {
        /*if (this.tileEditor.selectedTile) this.tileEditor.selectedTile.tint = 0xffffff;
        for (let i = 0; i < this.tileEditor.area.x; i++) {
            for (let j = 0; j < this.tileEditor.area.y; j++) {
                if (this.tileEditor.selectedTileArea[i][j]) this.tileEditor.selectedTileArea[i][j].tint = 0xffffff;
            }
        }*/
        if (!this.modeButtons[3].active) {
            this.tileEditor.lastSelectedTile = this.tileEditor.selectedTile;
            this.tileEditor.lastSelectedTileArea = this.tileEditor.selectedTileArea;
            var copy = __assign({}, this.tileEditor.selectedTile);
            copy.index = 0;
            this.tileEditor.selectedTile = copy;
            this.tileEditor.selectedTileArea = [[copy, copy], [copy, copy]];
            this.tileEditor.activateMarker(true);
            this.scene.regionEditor.regionTool = false;
            this.highlightModeButton(3);
        }
    };
    DevModeTools.prototype.highlightModeButton = function (n) {
        this.modeButtons.forEach(function (button, index) {
            if (index === n)
                button.highlight(true);
            else
                button.highlight(false);
        });
    };
    DevModeTools.prototype.selectSingle = function () {
        for (var i = 0; i < this.tileEditor.area.x; i++) {
            for (var j = 0; j < this.tileEditor.area.y; j++) {
                if (this.tileEditor.selectedTileArea[i][j])
                    this.tileEditor.selectedTileArea[i][j].tint = 0xffffff;
            }
        }
        this.tileEditor.area = { x: 1, y: 1 };
        this.tileEditor.marker.graphics.scale = 1;
        this.tileEditor.paletteMarker.graphics.scale = 1;
        this.brushButtons[0].highlight(true);
        this.brushButtons[1].highlight(false);
        this.tileEditor.activateMarker(true);
        if (!this.modeButtons[3].active) {
            this.brush();
        }
    };
    DevModeTools.prototype.selectArea = function () {
        if (this.tileEditor.selectedTile)
            this.tileEditor.selectedTile.tint = 0xffffff;
        this.tileEditor.area = { x: 2, y: 2 };
        this.tileEditor.marker.graphics.scale = 2;
        this.tileEditor.paletteMarker.graphics.scale = 2;
        this.brushButtons[1].highlight(true);
        this.brushButtons[0].highlight(false);
        this.tileEditor.activateMarker(true);
        if (!this.modeButtons[3].active) {
            this.brush();
        }
    };
    DevModeTools.prototype.switchLayer = function (value) {
        var scene = this.scene;
        var gameMap = scene.gameScene.tilemap;
        gameMap.currentLayerIndex = value;
        this.layerButtons.forEach(function (button) {
            button.highlight(false);
        });
        this.layerHideButtons.forEach(function (button) {
            button.highlight(false);
        });
        this.layerButtons[value].highlight(true);
        this.layerHideButtons[value].highlight(true);
    };
    DevModeTools.prototype.hideLayer = function (value) {
        this.switchLayer(value);
        var scene = this.scene;
        var tilemapLayers = scene.gameScene.tilemapLayers;
        if (this.layerHideButtons[value].image.texture.key === 'eyeopen') {
            this.layerHideButtons[value].image.setTexture('eyeclosed');
            tilemapLayers[value].setVisible(false);
        }
        else {
            this.layerHideButtons[value].image.setTexture('eyeopen');
            tilemapLayers[value].setVisible(true);
        }
    };
    return DevModeTools;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=DevModeTools.js.map