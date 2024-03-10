namespace Renderer {
	export namespace Three {
		export class TextureManager {
			private static _instance: TextureManager;

			static instance() {
				return this._instance || (this._instance = new this());
			}

			textureMap = new Map<string, THREE.Texture>();
			filter: typeof THREE.LinearFilter | typeof THREE.NearestFilter = THREE.LinearFilter;

			private loader = new THREE.TextureLoader();

			loadFromUrl(key: string, url: string, cb?: (tex: THREE.Texture) => void) {
				this.loader.load(url, (tex) => {
					tex.colorSpace = THREE.SRGBColorSpace;
					tex.magFilter = this.filter;
					this.textureMap.set(key, tex);
					if (cb) cb(tex);
				});
			}

			setFilter(filter: renderingFilter) {
				this.filter = filter === 'pixelArt' ? THREE.NearestFilter : THREE.LinearFilter;
			}

			getTexturesWithKeyContains(str: string) {
				const textures = [];
				for (const [key, tex] of this.textureMap.entries()) {
					if (key.includes(str)) {
						textures.push(tex);
					}
				}
				return textures;
			}
		}
	}
}
