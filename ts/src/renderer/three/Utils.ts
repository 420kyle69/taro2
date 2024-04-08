namespace Renderer {
	export namespace Three {
		export namespace Utils {
			export function patchAssetUrl(url: string): string {
				// proxy all s3 requests via cloudflare, old-cache.modd.io points to same 'modd' s3 bucket
				if (url?.startsWith('https://modd.s3.amazonaws.com')) {
					url = url.replace('https://modd.s3.amazonaws.com', 'https://old-cache.modd.io');
				}

				if (url?.indexOf('.png') !== -1 || url?.indexOf('.jpg') !== -1) {
					// load images via Image tag, helps CF optimize and convert(to webp) images via Polish - https://newdocs.phaser.io/docs/3.60.0/focus/Phaser.Loader.LoaderPlugin-image
					// this.load.imageLoadType = 'HTMLImageElement';
				} else {
					// default loader type
					// this.load.imageLoadType = 'XHR';
				}

				// https://stackoverflow.com/a/37455118
				return `${url}?v=1`;
			}

			export function fillRect(
				ctx: CanvasRenderingContext2D,
				x: number,
				y: number,
				width: number,
				height: number,
				color: string,
				alpha = 1
			) {
				const fillColor = new THREE.Color(color).getHex();
				const red = (fillColor & 0xff0000) >>> 16;
				const green = (fillColor & 0xff00) >>> 8;
				const blue = fillColor & 0xff;
				ctx.fillStyle = `rgba(${red},${green},${blue},${alpha})`;
				ctx.fillRect(x, y, width, height);
			}

			export function strokeRect(
				ctx: CanvasRenderingContext2D,
				x: number,
				y: number,
				width: number,
				height: number,
				color: string,
				lineWidth: number,
				alpha = 1
			) {
				const fillColor = new THREE.Color(color).getHex();
				const red = (fillColor & 0xff0000) >>> 16;
				const green = (fillColor & 0xff00) >>> 8;
				const blue = fillColor & 0xff;
				ctx.fillStyle = `rgba(${red},${green},${blue},${alpha})`;

				ctx.lineWidth = lineWidth;

				const lineWidthHalf = lineWidth / 2;
				const minx = x - lineWidthHalf;
				const maxx = x + lineWidthHalf;

				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x, y + height);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(x + width, y);
				ctx.lineTo(x + width, y + height);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(minx, y);
				ctx.lineTo(maxx + width, y);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(minx, y + height);
				ctx.lineTo(maxx + width, y + height);
				ctx.stroke();
			}

			export function fillRoundedRect(
				ctx: CanvasRenderingContext2D,
				x: number,
				y: number,
				width: number,
				height: number,
				radius: number,
				color: string,
				alpha = 1
			) {
				var tl = radius;
				var tr = radius;
				var bl = radius;
				var br = radius;

				const fillColor = new THREE.Color(color).getHex();
				const red = (fillColor & 0xff0000) >>> 16;
				const green = (fillColor & 0xff00) >>> 8;
				const blue = fillColor & 0xff;
				ctx.fillStyle = `rgba(${red},${green},${blue},${alpha})`;

				ctx.beginPath();
				ctx.moveTo(x + tl, y);
				ctx.lineTo(x + width - tr, y);
				ctx.arc(x + width - tr, y + tr, tr, -(Math.PI * 0.5), 0);
				ctx.lineTo(x + width, y + height - br);
				ctx.arc(x + width - br, y + height - br, br, 0, Math.PI * 0.5);
				ctx.lineTo(x + bl, y + height);
				ctx.arc(x + bl, y + height - bl, bl, Math.PI * 0.5, Math.PI);
				ctx.lineTo(x, y + tl);
				ctx.arc(x + tl, y + tl, tl, -Math.PI, -(Math.PI * 0.5));
				ctx.fill();
			}

			export function strokeRoundedRect(
				ctx: CanvasRenderingContext2D,
				x: number,
				y: number,
				width: number,
				height: number,
				radius: number,
				color: string,
				strokeThickness: number,
				alpha = 1
			) {
				var tl = radius;
				var tr = radius;
				var bl = radius;
				var br = radius;

				const lineColor = new THREE.Color(color).getHex();
				const red = (lineColor & 0xff0000) >>> 16;
				const green = (lineColor & 0xff00) >>> 8;
				const blue = lineColor & 0xff;
				ctx.strokeStyle = `rgba(${red},${green},${blue},${alpha})`;
				ctx.lineWidth = strokeThickness;

				ctx.beginPath();
				ctx.moveTo(x + tl, y);
				ctx.lineTo(x + width - tr, y);
				ctx.moveTo(x + width - tr, y);
				ctx.arc(x + width - tr, y + tr, tr, -(Math.PI * 0.5), 0);
				ctx.lineTo(x + width, y + height - br);
				ctx.moveTo(x + width, y + height - br);
				ctx.arc(x + width - br, y + height - br, br, 0, Math.PI * 0.5);
				ctx.lineTo(x + bl, y + height);
				ctx.moveTo(x + bl, y + height);
				ctx.arc(x + bl, y + height - bl, bl, Math.PI * 0.5, Math.PI);
				ctx.lineTo(x, y + tl);
				ctx.moveTo(x, y + tl);
				ctx.arc(x + tl, y + tl, tl, -Math.PI, -(Math.PI * 0.5));
				ctx.stroke();
			}

			export function fillTriangle(
				ctx: CanvasRenderingContext2D,
				x0: number,
				y0: number,
				x1: number,
				y1: number,
				x2: number,
				y2: number,
				color: string,
				alpha = 1
			) {
				const fillColor = new THREE.Color(color).getHex();
				const red = (fillColor & 0xff0000) >>> 16;
				const green = (fillColor & 0xff00) >>> 8;
				const blue = fillColor & 0xff;
				ctx.fillStyle = `rgba(${red},${green},${blue},${alpha})`;

				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.closePath();
				ctx.fill();
			}

			export function pixelToWorld(numPixels: number) {
				return numPixels / 64;
			}

			export function worldToPixel(units: number) {
				return units * 64;
			}

			export function resizeImageToPowerOf2(image) {
				const ceil = THREE.MathUtils.ceilPowerOfTwo;

				const width = ceil(image.width);
				const height = ceil(image.height);

				const canvas = document.createElement('canvas');

				canvas.width = width;
				canvas.height = height;

				const context = canvas.getContext('2d');
				context.drawImage(image, 0, 0, width, height, 0, 0, width, height);

				return canvas;
			}

			export function lerp(a: number, b: number, t: number) {
				return a + (b - a) * t;
			}

			export function round(num: number, decimalPlaces = 0) {
				var p = Math.pow(10, decimalPlaces || 0);
				var n = num * p * (1 + Number.EPSILON);
				return Math.round(n) / p;
			}

			export function getLayerZOffset(layer: number) {
				return layer - 1;
			}

			export function getDepthZOffset(depth: number) {
				return depth * 0.001;
			}

			export function isRightButton(buttons: number) {
				return !!(buttons & 2);
			}

			export function isHexColor(str: string) {
				return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(str);
			}

			export function isHexColorWithAlpha(str: string) {
				return /^#([A-Fa-f0-9]{8})$/.test(str);
			}

			export function getHexAlpha(hex: string) {
				if (isHexColorWithAlpha(hex)) {
					return parseInt(hex.slice(7), 16) / 255;
				}
				return 1;
			}
		}
	}
}
