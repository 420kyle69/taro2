type MobileControlKey =
	'movementWheel' |
	'lookWheel' |
	'lookAndFireWheel' |
	string;

class MobileControlsScene extends PhaserScene {

	controls: Phaser.GameObjects.Container;
	joysticks: PhaserJoystick[] = [];

	enablePointerNextUpdate: boolean;
	disablePointerEvents: boolean;

	constructor() {
		super({ key: 'MobileControls' });
	}

	init (): void {

        this.scene.swapPosition('MobileControls', 'Ui');

		// enabling four mobile pointers
		this.input.addPointer(3);

		const scale = this.scale;
		const controls = this.controls = this.add.container();

		const joysticks = this.joysticks;

		taro.mobileControls.on('add-control',(
			key: MobileControlKey,
			x: number,
			y: number,
			settings: MobileControlSettings,
			abilityId: string,
			ability: any
		) => {

			switch (key) {

				case 'movementWheel':
				case 'lookWheel':
				case 'lookAndFireWheel':

					new PhaserJoystick(this, x, y, settings);

					break;

				default:
					const relativeX = Math.trunc(x / 960 * window.outerWidth * window.devicePixelRatio);
					const relativeY = Math.trunc(y / 540 * window.outerHeight * window.devicePixelRatio);

                    const uiScene = taro.renderer.scene.getScene('Ui') as UiScene;
					let buttonExist = false;
                    Object.values(uiScene?.phaserButtonBar?.buttons).forEach((button) => {
                        if (button.key === key) {
                            button.x = relativeX;
                            button.y = relativeY;
                            buttonExist = true;
                        }
                    });
                    if (!buttonExist) {
						const button = uiScene.phaserButtonBar.addButton(abilityId, ability, key);
						button.x = relativeX;
                        button.y = relativeY;
					};

					break;
			}
		});

		let resized = false;

		taro.mobileControls.on('orientationchange', (e: string) => {
			this.game.scale.setGameSize(window.outerWidth * window.devicePixelRatio, window.outerHeight * window.devicePixelRatio);
			if (resized) {
				resized = false;
			} else {
				resized = true;
				window.dispatchEvent(new Event('resize'));
			}
		});

		taro.mobileControls.on('clear-controls', () => {

			joysticks.forEach((j) => {
				j.destroy();
			});
			joysticks.length = 0;

			controls.getAll().forEach((c) => {
				c.destroy();
			});

		});

		taro.mobileControls.on('visible', (value: boolean) => {
			this.scene.setVisible(value);
		});

		this.input.on('pointerdown', function(pointer) {
			let emitPointerPosition = true;
			Object.keys(taro.mobileControls.controls).forEach(control => {
				if (control === 'lookWheel' || control === 'lookAndFireWheel') emitPointerPosition = false;
			});

			if (emitPointerPosition) {
				const gameScene = taro.renderer.scene.getScene('Game');
				const worldPoint = gameScene.cameras.main.getWorldPoint(gameScene.input.activePointer.x, gameScene.input.activePointer.y);
				taro.input.emit('touchpointermove', [{
					x: worldPoint.x,
					y: worldPoint.y,
				}]);
			}

			if (!this.disablePointerEvents) {
				if (this.joysticks.length === 0) return;
				else if (this.joysticks.length === 1) {
					const joystick = this.joysticks[0];
					joystick.show();
					joystick.x = pointer.x;
					joystick.y = pointer.y;
					joystick.updateTransform();
				} else {
					var touchX = pointer.x;
					var touchY = pointer.y;
					if (touchX < this.cameras.main.displayWidth / 2.4) {
						const leftJoystick = this.joysticks.find(({ side }) => side === 'left');
						if (leftJoystick) {
							leftJoystick.show();
							leftJoystick.x = touchX;
							leftJoystick.y = touchY;
							leftJoystick.updateTransform();
						}
					} else if (touchX > this.cameras.main.displayWidth - (this.cameras.main.displayWidth / 2.4)) {
						const rightJoystick = this.joysticks.find(({ side }) => side === 'right');
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

		this.input.on('pointerup', function(pointer) {
			if (!this.disablePointerEvents) {
				var touchX = pointer.x;
				if (touchX < this.cameras.main.displayWidth / 2.4) {
					const leftJoystick = this.joysticks.find(({ side }) => side === 'left');
					if (leftJoystick) leftJoystick.hide();
				} else if (touchX > this.cameras.main.displayWidth - (this.cameras.main.displayWidth / 2.4)) {
					const rightJoystick = this.joysticks.find(({ side }) => side === 'right');
					if (rightJoystick) rightJoystick.hide();
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
	}

	preload (): void {

		this.load.image('mobile-button-up', this.patchAssetUrl(
			'https://cache.modd.io/asset/spriteImage/1549614640644_button1.png'
		));
		this.load.image('mobile-button-down', this.patchAssetUrl(
			'https://cache.modd.io/asset/spriteImage/1549614658007_button2.png'
		));

		this.load.image('mobile-button-icon', this.patchAssetUrl(
			'https://cache.modd.io/asset/spriteImage/1610494864771_fightFist_circle.png'
		));
	}

	update () {
		if (this.enablePointerNextUpdate) {
			this.joysticks.forEach((j) => {
				j.settings.onEnd && j.settings.onEnd();
			});
			this.enablePointerNextUpdate = false;
			this.disablePointerEvents = false;
		}
		//hide joysticks if no touching screen
		const gameScene = taro.renderer.scene.getScene('Game');
		let pointerDown = false;
		for (let i = 1; i < 6; i++) {
			var pointer = gameScene.input['pointer'+i.toString()];
			if (pointer && pointer.primaryDown) pointerDown = true;
		}
        if (!pointerDown) {
            var pointer = gameScene.input.mousePointer;
            if (pointer && pointer.primaryDown) pointerDown = true;
        }
		if (!pointerDown) {
		    const leftJoystick = this.joysticks.find(({ side }) => side === 'left');
			if (leftJoystick) leftJoystick.hide();
			const rightJoystick = this.joysticks.find(({ side }) => side === 'right');
			if (rightJoystick) rightJoystick.hide();
		} else {
			const worldPoint = gameScene.cameras.main.getWorldPoint(gameScene.input.activePointer.x, gameScene.input.activePointer.y);
			taro.input.emit('pointermove', [{
		    	x: worldPoint.x,
		    	y: worldPoint.y,
		    }]);
		}
	}

	private enterFullscreen() {
		if (!this.scale.isFullscreen) {
			this.scale.startFullscreen();
		}
	}
}
