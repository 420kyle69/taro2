class ThreeSprite extends THREE.Group {
    constructor(tex) {
        super();
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
}
//# sourceMappingURL=ThreeSprite.js.map