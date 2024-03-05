class ThreeTextureManager {
	private static _instance: ThreeTextureManager;

	static instance() {
		return this._instance || (this._instance = new this());
	}

	textureMap = new Map<string, THREE.Texture>();
	filter: typeof THREE.LinearFilter | typeof THREE.NearestFilter = THREE.LinearFilter;

	private loader = new THREE.TextureLoader();

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	loadFromUrl(key: string, url: string, cb = (tex: THREE.Texture) => {}) {
		this.loader.load(url, (tex) => {
			tex.colorSpace = THREE.SRGBColorSpace;
			tex.magFilter = this.filter;
			this.textureMap.set(key, tex);
			cb(tex);
		});
	}

	loadFromFile(key: string, url: string, cb?: (tex: THREE.Texture) => void) {
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
