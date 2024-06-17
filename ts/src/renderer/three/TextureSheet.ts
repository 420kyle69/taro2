namespace Renderer {
	export namespace Three {
		export class TextureSheet {
			originalWidth: number;
			originalHeight: number;
			cols: number;
			rows: number;
			width: number;
			height: number;

			constructor(
				public key: string,
				public texture: THREE.Texture,
				public tileWidth: number,
				public tileHeight: number,
				public resizeToPowerOf2 = false
			) {
				this.originalWidth = texture.image.width;
				this.originalHeight = texture.image.height;
				this.cols = Math.floor(texture.image.width / tileWidth);
				this.rows = Math.floor(texture.image.height / tileHeight);

				if (resizeToPowerOf2) {
					// Note that texture.image is shared between texture
					// instances. So be careful using this.
					texture.image = Utils.resizeImageToPowerOf2(texture.image);
				}

				this.width = texture.image.width;
				this.height = texture.image.height;
				texture.generateMipmaps = false;
			}
		}
	}
}
