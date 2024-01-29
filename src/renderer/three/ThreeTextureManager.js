class ThreeTextureManager {
    constructor() {
        this.textureMap = new Map();
        this.loader = new THREE.TextureLoader();
    }
    static instance() {
        return this._instance || (this._instance = new this());
    }
    loadFromUrl(key, url) {
        this.loader.load(url, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            this.textureMap.set(key, tex);
        });
    }
}
//# sourceMappingURL=ThreeTextureManager.js.map