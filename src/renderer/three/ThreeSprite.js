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
    setScale(sx, sy) {
        this.sprite.scale.set(sx, 1, sy);
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
    setTexture(tex) {
        this.sprite.material.map = tex;
    }
    calcRenderOrder() {
        this.sprite.renderOrder = this.layer * 100 + this.depth;
    }
}
//# sourceMappingURL=ThreeSprite.js.map