namespace Renderer {
	export namespace Three {
		export class Tileset {
			originalWidth: number;
			originalHeight: number;
			columns: number;
			width: number;
			height: number;

			constructor(
				public texture: THREE.Texture,
				public tileWidth: number,
				public tileHeight: number
			) {
				this.originalWidth = texture.image.width;
				this.originalHeight = texture.image.height;
				this.columns = Math.floor(texture.image.width / tileWidth);
				texture.image = Utils.resizeImageToPowerOf2(texture.image);
				this.width = texture.image.width;
				this.height = texture.image.height;
				texture.generateMipmaps = false;
			}
		}
	}
}
