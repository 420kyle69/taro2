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

		// enabling four mobile pointers
		this.input.addPointer(3);

		const scale = this.scale;
		const controls = this.controls = this.add.container();
		this.resize();
		scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);

		const joysticks = this.joysticks;

		ige.mobileControls.on('add-control',(
			key: MobileControlKey,
			x: number,
			y: number,
			w: number,
			h: number,
			settings: MobileControlSettings
		) => {

			switch (key) {

				case 'movementWheel':
				case 'lookWheel':
				case 'lookAndFireWheel':

					new PhaserJoystick(this, x, y, settings);

					break;

				default:

					const text = key.toUpperCase();

					const button = this.add.image(x, y, 'mobile-button-up')
						.setDisplaySize(w, h)
						.setOrigin(0)
						.setAlpha(0.6);
					controls.add(button);

					if (text === 'BUTTON1') {
						const icon = this.add.image(
							x + w/2, y + h/2,
							'mobile-button-icon'
						);
						icon.setScale(0.5);
						controls.add(icon);
					} else {
						const label = this.add.bitmapText(
							x + w/2, y + h/2,
							BitmapFontManager.font(this,
								'Arial', true, '#FFFFFF'
							),
							text
						);
						label.setCenterAlign();
						label.setFontSize(24);
						label.setOrigin(0.5);
						label.letterSpacing = -0.4;
						controls.add(label);
					}

					button.setInteractive();

					let clicked = false;

					button.on('pointerdown', () => {
						this.disablePointerEvents = true;

						if (clicked) return;
						clicked = true;
						button.setTexture('mobile-button-down');

						settings.onStart && settings.onStart();
					});
					const onPointerEnd = () => {
						this.enablePointerNextUpdate = true;

						if (!clicked) return;
						clicked = false;
						button.setTexture('mobile-button-up');

						settings.onEnd && settings.onEnd();
					};
					button.on('pointerup', onPointerEnd);
					button.on('pointerout', onPointerEnd);

					break;
			}
		});

		ige.mobileControls.on('clear-controls', () => {

			joysticks.forEach((j) => {
				j.destroy();
			});
			joysticks.length = 0;

			controls.getAll().forEach((c) => {
				c.destroy();
			});

		});

		ige.mobileControls.on('visible', (value: boolean) => {
			this.scene.setVisible(value);
		});

		this.input.on('pointerdown', function(pointer){
			if (!this.disablePointerEvents) {
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
		}, this);

		this.input.on('pointerup', function(pointer){
			if (!this.disablePointerEvents) {
				var touchX = pointer.x;
				if (touchX < this.cameras.main.displayWidth / 2.4) {
					const leftJoystick = this.joysticks[0];
					leftJoystick.hide();
				} else if (touchX > this.cameras.main.displayWidth - (this.cameras.main.displayWidth / 2.4)) {
					const rightJoystick = this.joysticks[1];
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
			this.enablePointerNextUpdate = false;
			this.disablePointerEvents = false;
		}
	}

	private enterFullscreen() {
		if (!this.scale.isFullscreen) {
			this.scale.startFullscreen();
		}
	}

	private resize() {
		// make the mobileControls container
		// fit the width and be anchored to the bottom
		const controls = this.controls;
		const scale = this.scale;

		controls.setScale(scale.width / 960);
		controls.y = scale.height - 540 * controls.scale;
	}
}
