class ThreeTextureManager {
	private static _instance: ThreeTextureManager;

	static instance() {
		return this._instance || (this._instance = new this());
	}

	textureMap = new Map<string, THREE.Texture>();

	private loader = new THREE.TextureLoader();

	loadFromUrl(key: string, url: string) {
		this.loader.load(url, (tex) => {
			tex.colorSpace = THREE.SRGBColorSpace;
			this.textureMap.set(key, tex);
		});
	}
}
