class ThreeSprite extends THREE.Group {
    constructor(tex) {
        super();
        const geometry = new THREE.PlaneGeometry(1, 1);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        this.plane = new THREE.Mesh(geometry, material);
        this.add(this.plane);
        // const spriteMaterial = new THREE.SpriteMaterial({ transparent: true, map: tex });
        // const sprite = new THREE.Sprite(spriteMaterial);
        // this.sprite = sprite;
        // this.add(sprite);
    }
    setScale(sx, sy, sz = 1) {
        // this.sprite.scale.set(sx, sy, sz);
        this.plane.scale.set(sx, sy, sz);
    }
    setRotationY(rad) {
        // this.sprite.material.rotation = rad;
        this.plane.rotation.y = rad;
    }
}
//# sourceMappingURL=ThreeSprite.js.map