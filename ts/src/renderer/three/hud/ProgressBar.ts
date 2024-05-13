namespace Renderer {
	export namespace Three {
		const defaultConfig = {
			x: 0,
			y: 0,
			z: 0,
			width: 96,
			height: 16,
			radius: 7,
			bgColor: '#000',
			bgAlpha: 0,
			fgColor: '#fff',
			fgAlpha: 1,
			strokeColor: '#000',
			strokeThickness: 2,
			value: 0,
			max: 1,
			displayValue: false,
			decimalPlaces: 0,
			trailingZeros: false,
			fontSize: 14,
			letterSpacing: -0.8,
			renderOnTop: true,
			anchorPosition: 'below' as 'below' | 'above',
			padding: 0,
			margin: 0,
			origin: { x: 0.5, y: 0.5 },
		};

		export type ProgressBarParams = Partial<typeof defaultConfig>;

		export class ProgressBar extends Element {
			radius: number;
			bgColor: string;
			bgAlpha: number;
			fgColor: string;
			fgAlpha: number;
			strokeColor: string;
			strokeThickness: number;
			value: number;
			max: number;
			displayValue: boolean;
			decimalPlaces: number;
			trailingZeros: boolean;
			fontSize: number;
			letterSpacing: number;
			renderOnTop: boolean;
			anchorPosition: 'below' | 'above';
			padding: number;
			origin: { x: number; y: number };

			constructor(params: ProgressBarParams) {
				const config = { ...defaultConfig, ...params };
				super(config.x, config.y, config.z, config.width, config.height);

				this.update(config);
			}

			update(params: ProgressBarParams) {
				Object.assign(this, params);

				// The alpha can be set via the hex color in the editor. Three.js
				// doesn't support this, so we extract the alpha from the hex here.
				if (params.bgColor && Utils.isHexColorWithAlpha(this.bgColor)) {
					this.bgAlpha = Utils.getHexAlpha(this.bgColor);
					this.bgColor = this.bgColor.slice(0, 7);
				}

				if (params.fgColor && Utils.isHexColorWithAlpha(this.fgColor)) {
					this.fgAlpha = Utils.getHexAlpha(this.fgColor);
					this.fgColor = this.fgColor.slice(0, 7);
				}

				if (this.renderOnTop) {
					this.renderOnTopOfEverything();
				}

				this.refreshTexture();
			}

			private refreshTexture() {
				this.setTextureImage(
					this.createUpscaledTextureImage((w: number, h: number, upscaleFactor: number) => {
						const r = this.radius * upscaleFactor;
						const st = this.strokeThickness * upscaleFactor;
						const iw = w - st;
						const ih = h - st;
						const halfSt = st * 0.5;

						let progressScale = this.value / this.max;

						if (this.radius > 0) {
							// TODO(nick): Use separate sprites for bg, fg, and stroke. Then
							// reduce the u (from uv) of the fg sprite to show progress. Then
							// there is no need to have a minimum progress value here and it
							// looks nicer.
							progressScale = Math.max(progressScale, 0.08);
							Utils.fillRoundedRect(this.ctx, 0, 0, w, h, r, this.bgColor, this.bgAlpha);
							Utils.fillRoundedRect(this.ctx, halfSt, halfSt, iw * progressScale, ih, r, this.fgColor, this.fgAlpha);
							Utils.strokeRoundedRect(this.ctx, 0, 0, w, h, r, this.strokeColor, st);
						} else {
							Utils.fillRect(this.ctx, 0, 0, w, h, this.bgColor, this.bgAlpha);
							Utils.fillRect(this.ctx, halfSt, halfSt, iw * progressScale, ih, this.fgColor, this.fgAlpha);
							Utils.strokeRect(this.ctx, 0, 0, w, h, this.strokeColor, st);
						}

						if (this.displayValue) {
							const font = `bold ${this.fontSize * upscaleFactor}px Verdana`;
							this.ctx.font = font;
							this.ctx.fillStyle = '#000';
							this.ctx.letterSpacing = `${this.letterSpacing * upscaleFactor}px`;

							const text = Utils.formatNumber(this.value, this.decimalPlaces, this.trailingZeros);

							const metrics = this.ctx.measureText(text);
							const textWidth = metrics.width;
							const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
							const centerX = w * 0.5 - textWidth * 0.5;
							const centerY = h * 0.5 + textHeight * 0.5;
							this.ctx.fillText(text, centerX, centerY);
						}
					})
				);
			}
		}
	}
}
