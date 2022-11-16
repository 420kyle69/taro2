
type Font = 'Arial' | 'Verdana';

class BitmapFontManager {

	static preload (scene: Phaser.Scene): void {

		scene.load.bitmapFont('ArialBold#FFFFFF',
			'/assets/fonts/ArialBold.png',
			'/assets/fonts/ArialBold.xml'
		);
	}

	static create (scene: Phaser.Scene): void {

		this.add(scene, 'Arial', true, '#000000');
	}

	static font (
		scene: Phaser.Scene,
		font: Font,
		bold: boolean,
		color: string
	): string {

		const key = font +
			(bold ? 'Bold' : '') +
			color.toUpperCase();

		if (!scene.cache.bitmapFont.has(key)) {

			this.add(scene, font, bold, color);
		}

		return key;
	}

	static add (
		scene: Phaser.Scene,
		font: Font,
		bold: boolean,
		color: string
	):  void {

		const key = font +
			(bold ? 'Bold' : '') +
			color.toUpperCase();

		const sourceFillKey = `${font +
			(bold ? 'Bold' : '')
		}#FFFFFF`;

		const bitmapCache = scene.cache.bitmapFont;
		const textures = scene.textures;

		const sourceFillData = bitmapCache.get(sourceFillKey);
		const sourceFillTexture = textures.get(sourceFillData.texture);
		const sourceFillImage = sourceFillTexture
			.getSourceImage() as HTMLImageElement;
		const w = sourceFillImage.width;
		const h = sourceFillImage.height;

		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;

		const ctx = canvas.getContext('2d');
		ctx.drawImage(sourceFillImage, 0, 0, w, h);

		ctx.globalCompositeOperation = 'source-in';
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, w, h);
		ctx.globalCompositeOperation = 'source-over'; // default

		textures.addCanvas(key, canvas);

		bitmapCache.add(key, {
			data: sourceFillData.data,
			frame: null,
			texture: key
		});
	}
}
