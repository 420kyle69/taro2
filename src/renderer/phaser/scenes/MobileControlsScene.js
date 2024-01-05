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
var MobileControlsScene = /** @class */ (function (_super) {
    __extends(MobileControlsScene, _super);
    function MobileControlsScene() {
        var _this = _super.call(this, { key: 'MobileControls' }) || this;
        _this.joysticks = [];
        return _this;
    }
    MobileControlsScene.prototype.init = function () {
        var _this = this;
        this.scene.swapPosition('MobileControls', 'Ui');
        // enabling four mobile pointers
        this.input.addPointer(3);
        var scale = this.scale;
        var controls = this.controls = this.add.container();
        var joysticks = this.joysticks;
        taro.mobileControls.on('add-control', function (key, x, y, settings, abilityId, ability) {
            var _a;
            switch (key) {
                case 'movementWheel':
                case 'lookWheel':
                case 'lookAndFireWheel':
                    new PhaserJoystick(_this, x, y, settings);
                    break;
                default:
                    var relativeX_1 = Math.trunc(x / 960 * window.outerWidth * window.devicePixelRatio);
                    var relativeY_1 = Math.trunc(y / 540 * window.outerHeight * window.devicePixelRatio);
                    var uiScene = taro.renderer.scene.getScene('Ui');
                    var buttonExist_1 = false;
                    Object.values((_a = uiScene === null || uiScene === void 0 ? void 0 : uiScene.phaserButtonBar) === null || _a === void 0 ? void 0 : _a.buttons).forEach(function (button) {
                        if (button.key === key) {
                            button.x = relativeX_1;
                            button.y = relativeY_1;
                            buttonExist_1 = true;
                        }
                    });
                    if (!buttonExist_1) {
                        var button = uiScene.phaserButtonBar.addButton(abilityId, ability, key);
                        button.x = relativeX_1;
                        button.y = relativeY_1;
                    }
                    ;
                    break;
            }
        });
        var resized = false;
        taro.mobileControls.on('orientationchange', function (e) {
            _this.game.scale.setGameSize(window.outerWidth * window.devicePixelRatio, window.outerHeight * window.devicePixelRatio);
            if (resized) {
                resized = false;
            }
            else {
                resized = true;
                window.dispatchEvent(new Event('resize'));
            }
        });
        taro.mobileControls.on('clear-controls', function () {
            joysticks.forEach(function (j) {
                j.destroy();
            });
            joysticks.length = 0;
            controls.getAll().forEach(function (c) {
                c.destroy();
            });
        });
        taro.mobileControls.on('visible', function (value) {
            _this.scene.setVisible(value);
        });
        this.input.on('pointerdown', function (pointer) {
            var emitPointerPosition = true;
            Object.keys(taro.mobileControls.controls).forEach(function (control) {
                if (control === 'lookWheel' || control === 'lookAndFireWheel')
                    emitPointerPosition = false;
            });
            if (emitPointerPosition) {
                var gameScene = taro.renderer.scene.getScene('Game');
                var worldPoint = gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                if (pointer === gameScene.input.pointer1) {
                    taro.input.emit('touchpointermove', [{
                            x: worldPoint.x,
                            y: worldPoint.y,
                        }]);
                }
                else if (pointer === gameScene.input.pointer2) {
                    taro.input.emit('secondarytouchpointermove', [{
                            x: worldPoint.x,
                            y: worldPoint.y,
                        }]);
                }
            }
            if (!this.disablePointerEvents) {
                if (this.joysticks.length === 0)
                    return;
                else if (this.joysticks.length === 1) {
                    var joystick = this.joysticks[0];
                    joystick.show();
                    joystick.x = pointer.x;
                    joystick.y = pointer.y;
                    joystick.updateTransform();
                }
                else {
                    var touchX = pointer.x;
                    var touchY = pointer.y;
                    if (touchX < this.cameras.main.displayWidth / 2.4) {
                        var leftJoystick = this.joysticks.find(function (_a) {
                            var side = _a.side;
                            return side === 'left';
                        });
                        if (leftJoystick) {
                            leftJoystick.show();
                            leftJoystick.x = touchX;
                            leftJoystick.y = touchY;
                            leftJoystick.updateTransform();
                        }
                    }
                    else if (touchX > this.cameras.main.displayWidth - (this.cameras.main.displayWidth / 2.4)) {
                        var rightJoystick = this.joysticks.find(function (_a) {
                            var side = _a.side;
                            return side === 'right';
                        });
                        if (rightJoystick) {
                            rightJoystick.show();
                            rightJoystick.x = touchX;
                            rightJoystick.y = touchY;
                            rightJoystick.updateTransform();
                        }
                    }
                }
            }
        }, this);
        this.input.on('pointerup', function (pointer) {
            var gameScene = taro.renderer.scene.getScene('Game');
            var emitPointerPosition = true;
            Object.keys(taro.mobileControls.controls).forEach(function (control) {
                if (control === 'lookWheel' || control === 'lookAndFireWheel')
                    emitPointerPosition = false;
            });
            if (emitPointerPosition) {
                if (pointer === gameScene.input.pointer2) {
                    taro.input.emit('secondarytouchpointermove', [{
                            x: NaN,
                            y: NaN,
                        }]);
                }
            }
            if (!this.disablePointerEvents) {
                var touchX = pointer.x;
                if (touchX < this.cameras.main.displayWidth / 2.4) {
                    var leftJoystick = this.joysticks.find(function (_a) {
                        var side = _a.side;
                        return side === 'left';
                    });
                    if (leftJoystick)
                        leftJoystick.hide();
                }
                else if (touchX > this.cameras.main.displayWidth - (this.cameras.main.displayWidth / 2.4)) {
                    var rightJoystick = this.joysticks.find(function (_a) {
                        var side = _a.side;
                        return side === 'right';
                    });
                    if (rightJoystick)
                        rightJoystick.hide();
                }
            }
        }, this);
        /*if (scale.fullscreen.available) {
            scale.fullscreenTarget =
                document.getElementById('game-div');
            document.body.addEventListener('touchstart', () => {
                this.enterFullscreen();
            }, true);
            document.body.addEventListener('touchend', () => {
                this.enterFullscreen();
            }, true);
        }*/
    };
    MobileControlsScene.prototype.preload = function () {
        this.load.image('mobile-button-up', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1549614640644_button1.png'));
        this.load.image('mobile-button-down', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1549614658007_button2.png'));
        this.load.image('mobile-button-icon', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1610494864771_fightFist_circle.png'));
    };
    MobileControlsScene.prototype.update = function () {
        if (this.enablePointerNextUpdate) {
            this.joysticks.forEach(function (j) {
                j.settings.onEnd && j.settings.onEnd();
            });
            this.enablePointerNextUpdate = false;
            this.disablePointerEvents = false;
        }
        //hide joysticks if no touching screen
        var gameScene = taro.renderer.scene.getScene('Game');
        var pointerDown = false;
        for (var i = 1; i < 6; i++) {
            var pointer = gameScene.input['pointer' + i.toString()];
            if (pointer && pointer.primaryDown)
                pointerDown = true;
        }
        if (!pointerDown) {
            var pointer = gameScene.input.mousePointer;
            if (pointer && pointer.primaryDown)
                pointerDown = true;
        }
        if (!pointerDown) {
            var leftJoystick = this.joysticks.find(function (_a) {
                var side = _a.side;
                return side === 'left';
            });
            if (leftJoystick)
                leftJoystick.hide();
            var rightJoystick = this.joysticks.find(function (_a) {
                var side = _a.side;
                return side === 'right';
            });
            if (rightJoystick)
                rightJoystick.hide();
        }
        else {
            var worldPoint = gameScene.cameras.main.getWorldPoint(gameScene.input.pointer1.x, gameScene.input.pointer1.y);
            taro.input.emit('pointermove', [{
                    x: worldPoint.x,
                    y: worldPoint.y,
                }]);
            if (gameScene.input.pointer2.primaryDown) {
                var worldPointSecondary = gameScene.cameras.main.getWorldPoint(gameScene.input.pointer2.x, gameScene.input.pointer2.y);
                taro.input.emit('secondarytouchpointermove', [{
                        x: worldPointSecondary.x,
                        y: worldPointSecondary.y,
                    }]);
            }
        }
    };
    MobileControlsScene.prototype.enterFullscreen = function () {
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        }
    };
    return MobileControlsScene;
}(PhaserScene));
//# sourceMappingURL=MobileControlsScene.js.map