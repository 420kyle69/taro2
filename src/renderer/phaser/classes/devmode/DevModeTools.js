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
            };
            _this.scene.editEntity({ entityType: 'item',
                typeId: 'axe',
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