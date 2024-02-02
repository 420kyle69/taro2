class ThreeSprite extends THREE.Group {
    constructor(tex) {
        super();
        this.layer = 3; // Create enum
        this.depth = 1;
        const geometry = new THREE.PlaneGeometry(1, 1);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        this.sprite = new THREE.Mesh(geometry, material);
        this.add(this.sprite);
    }
    setScale(sx, sy, sz = 1) {
        this.sprite.scale.set(sx, sy, sz);
    }
    setRotationY(rad) {
        this.sprite.rotation.y = rad;
    }
    setLayer(layer) {
        this.layer = layer;
        this.calcRenderOrder();
    }
    setDepth(depth) {
        this.depth = depth;
        this.calcRenderOrder();
    }
    calcRenderOrder() {
        this.sprite.renderOrder = this.layer * 100 + this.depth;
    }
}
//# sourceMappingURL=ThreeSprite.js.map