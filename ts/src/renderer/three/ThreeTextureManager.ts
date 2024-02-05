class ThreeTextureManager {
	private static _instance: ThreeTextureManager;

	static instance() {
		return this._instance || (this._instance = new this());
	}

	textureMap = new Map<string, THREE.Texture>();

	private loader = new THREE.TextureLoader();

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	loadFromUrl(key: string, url: string, cb = (tex: THREE.Texture) => {}) {
		this.loader.load(url, (tex) => {
			tex.colorSpace = THREE.SRGBColorSpace;
			this.textureMap.set(key, tex);
			cb(tex);
		});
	}
}
