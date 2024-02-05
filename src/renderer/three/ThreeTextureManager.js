class ThreeTextureManager {
    constructor() {
        this.textureMap = new Map();
        this.loader = new THREE.TextureLoader();
    }
    static instance() {
        return this._instance || (this._instance = new this());
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    loadFromUrl(key, url, cb = (tex) => { }) {
        this.loader.load(url, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            this.textureMap.set(key, tex);
            cb(tex);
        });
    }
}
//# sourceMappingURL=ThreeTextureManager.js.map