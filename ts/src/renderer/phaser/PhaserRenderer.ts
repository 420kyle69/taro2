/// <reference types="@types/google.analytics" />

class PhaserRenderer extends Phaser.Game {

	constructor () {

		const forceCanvas = JSON.parse(
			localStorage.getItem('forceCanvas')
		) || {};

		super({
			type: forceCanvas[gameId] ?
				Phaser.CANVAS : Phaser.AUTO,
			scale: {
				width: 600,
				height: 400,
				parent: 'game-div',
				mode: Phaser.Scale.ScaleModes.RESIZE,
				autoRound: true,
				resizeInterval: 100
			},
			render: {
				pixelArt: false,
				transparent: false
			},
			scene: [
				GameScene,
				MobileControlsScene
			],
			loader: {
				crossOrigin: 'anonymous'
			},
			plugins: {
				global: [{
					key: 'virtual-joystick',
					plugin: rexvirtualjoystickplugin,
					start: true
				}]
			}
		});

		// Ask the input component to setup any listeners it has
		ige.input.setupListeners(this.canvas);

		if (typeof ga != 'undefined' && ige.env != 'local') {
			ga('send', {
				hitType: 'event',
				eventCategory: 'Rendering Engine',
				eventAction: this.renderer.type
			});
		}
	}
}
