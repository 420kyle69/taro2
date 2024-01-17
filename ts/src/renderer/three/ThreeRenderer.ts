/// <reference types="@types/google.analytics" />

class ThreeRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private units: Unit[] = [];

	constructor() {
		this.canvas = document.createElement('canvas');

		this.ctx = this.canvas.getContext('2d');

		document.querySelector('#game-div')?.appendChild(this.canvas);

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.canvas.style.backgroundColor = 'gray';

		taro.client.rendererLoaded.resolve();

		taro.client.on('create-unit', (unit: Unit) => {
			unit.on(
				'transform',
				(data: { x: number; y: number; rotation: number }) => {
					unit._translate.x = data.x;
					unit._translate.y = data.y;
				},
				this
			);

			this.units.push(unit);

			this;
		});

		requestAnimationFrame(this.render.bind(this));

		this.setupInputListeners();
	}

	private setupInputListeners(): void {
		// Ask the input component to set up any listeners it has
		taro.input.setupListeners(this.canvas);
	}

	getViewportBounds() {
		// return this.scene.getScene('Game').cameras.main.worldView;
		return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
	}

	getCameraWidth(): number {
		// return this.scene.getScene('Game').cameras.main.displayWidth;
		return window.innerWidth;
	}

	getCameraHeight(): number {
		// return this.scene.getScene('Game').cameras.main.displayHeight;
		return window.innerHeight;
	}

	render() {
		requestAnimationFrame(this.render.bind(this));

		this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

		if (this.units.length > 0) {
			for (const u of this.units) {
				this.ctx.beginPath();
				this.ctx.arc(u._translate.x, u._translate.y, 50, 0, 2 * Math.PI);
				this.ctx.stroke();
			}
		}

		taro.client.emit('tick');
	}
}
