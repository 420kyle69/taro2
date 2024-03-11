namespace Renderer {
	export namespace Three {
		export class TextureRepository {
			private static _instance: TextureRepository;

			static instance() {
				return this._instance || (this._instance = new this());
			}

			filter: typeof THREE.LinearFilter | typeof THREE.NearestFilter = THREE.LinearFilter;

			private textures = new Map<string, THREE.Texture>();
			private loader = new THREE.TextureLoader();

			get(key: string) {
				return this.textures.get(key);
			}

			set(key: string, texture: THREE.Texture) {
				this.textures.set(key, texture);
			}

			loadFromUrl(key: string, url: string, cb?: (tex: THREE.Texture) => void) {
				this.loader.load(url, (tex) => {
					tex.colorSpace = THREE.SRGBColorSpace;
					tex.magFilter = this.filter;
					this.textures.set(key, tex);
					if (cb) cb(tex);
				});
			}

			setFilter(filter: renderingFilter) {
				this.filter = filter === 'pixelArt' ? THREE.NearestFilter : THREE.LinearFilter;
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
		}
	}
}
