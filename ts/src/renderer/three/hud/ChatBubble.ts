namespace Renderer {
	export namespace Three {
		const defaultConfig = {
			x: 0,
			y: 0,
			z: 0,
			text: '',
			color: '#ffffff',
			bold: true,
			renderOnTop: true,
			width: 97,
			height: 16,
			radius: 5,
			duration: 3000,
			fontSize: 12,
			letterSpacing: 0,
			bgColor: '#000000',
			bgAlpha: 0.5,
			tailSize: 7,
			padding: { x: 20, y: 10 },
		};

		export type ChatBubbleParams = Partial<typeof defaultConfig>;

		// TODO: Shares a lot of logic with Label class. Use composition to create a
		// chat bubble out of a label and a background. The background is unique to
		// a chat bubble so that logic goes here. Maybe these HUD classes should
		// have a draw function so that they can be composed together. Now that's
		// not possible, I tried.
		export class ChatBubble extends Element {
			text: string;
			bold: boolean;
			radius: number;
			fontSize: number;
			letterSpacing: number;
			renderOnTop: boolean;
			color: string;
			bgColor: string;
			bgAlpha: number;
			tailSize: number;
			padding: { x: number; y: number };
			duration: number;

			private fontHeight = 0;

			constructor(params: ChatBubbleParams) {
				const config = { ...defaultConfig, ...params };
				super(config.x, config.y, config.z, config.width, config.height);

				this.update(config);
			}

			update(params: ChatBubbleParams) {
				Object.assign(this, params);

				if (params.color && Utils.isHexColorWithAlpha(this.color)) {
					this.bgAlpha = Utils.getHexAlpha(this.color);
					this.color = this.color.slice(0, 7);
				}

				if (this.renderOnTop) {
					this.renderOnTopOfEverything();
				}

				if (this.duration > 0) {
					this.showAndHideAfterDelay(3000);
				}

				if (this.text.length === 0) return;

				this.ctx.font = `${this.bold ? 'bold' : 'normal'} ${this.fontSize}px Arial`;
				const metrics = this.ctx.measureText(this.text);
				this.width = Math.ceil(metrics.width);
				this.fontHeight = Math.ceil(Math.max(metrics.actualBoundingBoxAscent, metrics.actualBoundingBoxDescent) * 2);
				this.height = this.fontHeight;

				if (this.width < 1 || this.height < 1) return;

				this.width += this.padding.x;
				this.height += this.padding.y + this.tailSize;

				this.refreshTexture();
			}

			private refreshTexture() {
				this.setTextureImage(
					this.createUpscaledTextureImage((w: number, h: number, upscaleFactor: number) => {
						const x = this.padding.x * 0.5 * upscaleFactor;
						const y = this.padding.y * 0.5 * upscaleFactor;

						this.drawBackground(x, y, w, h - this.tailSize * upscaleFactor, upscaleFactor);
						this.drawText(x, y, w, h - this.tailSize * upscaleFactor, upscaleFactor);
					})
				);
			}

			private drawBackground(x: number, y: number, w: number, h: number, upscaleFactor: number) {
				const r = this.radius * upscaleFactor;
				const halfSizeX = w * 0.5;
				const halfSizeY = h * 0.5;
				const scailedTailSize = this.tailSize * upscaleFactor;

				Utils.fillRoundedRect(this.ctx, 0, 0, w, h, r, this.bgColor, this.bgAlpha);
				Utils.fillTriangle(
					this.ctx,
					halfSizeX,
					halfSizeY * 2 + scailedTailSize,
					halfSizeX + scailedTailSize,
					halfSizeY * 2,
					halfSizeX + -scailedTailSize,
					halfSizeY * 2,
					this.bgColor,
					this.bgAlpha
				);
			}

			private drawText(x: number, y: number, w: number, h: number, upscaleFactor: number) {
				this.ctx.font = `${this.bold ? 'bold' : 'normal'} ${this.fontSize * upscaleFactor}px Arial`;
				this.ctx.letterSpacing = `${this.letterSpacing * upscaleFactor}px`;

				const baselinePos = this.fontHeight * 0.5 * upscaleFactor;

				this.ctx.fillStyle = this.color;
				this.ctx.fillText(this.text, x, (h + baselinePos) * 0.5);
			}
		}
	}
}
