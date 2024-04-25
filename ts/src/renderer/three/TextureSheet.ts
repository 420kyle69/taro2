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
				public tileHeight: number
			) {
				this.originalWidth = texture.image.width;
				this.originalHeight = texture.image.height;
				this.cols = Math.floor(texture.image.width / tileWidth);
				this.rows = Math.floor(texture.image.height / tileHeight);
				texture.image = Utils.resizeImageToPowerOf2(texture.image);
				this.width = texture.image.width;
				this.height = texture.image.height;
				texture.generateMipmaps = false;
			}
		}
	}
}
