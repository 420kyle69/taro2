namespace Renderer {
	export namespace Three {
		export class TextureManager {
			private static _instance: TextureManager;

			filter: typeof THREE.LinearFilter | typeof THREE.NearestFilter = THREE.LinearFilter;

			private textures = new Map<string, THREE.Texture>();
			private textureSheets = new Map<string, TextureSheet>();
			private loader = new THREE.TextureLoader();

			static instance() {
				return this._instance || (this._instance = new this());
			}

			get(key: string) {
				return this.textures.get(key);
			}

			set(key: string, texture: THREE.Texture) {
				this.textures.set(key, texture);
			}

			loadTextureFromUrl(key: string, url: string, cb?: (tex: THREE.Texture) => void) {
				if (this.textures.has(key)) {
					if (cb) cb(this.textures.get(key));
					return;
				}

				this.loader.load(url, (tex) => {
					tex.colorSpace = THREE.SRGBColorSpace;
					tex.magFilter = this.filter;
					this.textures.set(key, tex);
					if (cb) cb(tex);
				});
			}

			loadTextureSheetFromUrl(
				key: string,
				url: string,
				cols: number,
				rows: number,
				cb?: (textureSheet: TextureSheet) => void
			) {
				if (this.textureSheets.has(key)) {
					if (cb) cb(this.textureSheets.get(key));
					return;
				}

				this.loader.load(url, (tex) => {
					tex.colorSpace = THREE.SRGBColorSpace;
					tex.magFilter = this.filter;
					const frameWidth = tex.image.width / cols;
					const frameHeight = tex.image.height / rows;
					const textureSheet = new TextureSheet(key, tex, frameWidth, frameHeight);
					this.textureSheets.set(key, textureSheet);

					if (cb) cb(textureSheet);
				});
			}

			setFilter(filter: renderingFilter) {
				this.filter = filter === 'pixelArt' ? THREE.NearestFilter : THREE.LinearFilter;
			}

			setLoadingManager(manager: THREE.LoadingManager) {
				this.loader.manager = manager;
			}

			getTexturesWithKeyContains(str: string) {
				const textures = [];
				for (const [key, tex] of this.textures.entries()) {
					if (key.includes(str)) {
						textures.push(tex);
					}
				}
				return textures;
			}

			getTextureSheet(key: string) {
				return this.textureSheets.get(key);
			}

			getTextureSheetShallowCopy(key: string) {
				const sheet = this.getTextureSheet(key);
				if (sheet) {
					sheet.texture = sheet.texture.clone();
				}
				return sheet;
			}
		}
	}
}
