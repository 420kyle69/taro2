class ThreeSprite extends THREE.Group {
    constructor(tex) {
        super();
        const spriteMaterial = new THREE.SpriteMaterial({ transparent: true, map: tex });
        const sprite = new THREE.Sprite(spriteMaterial);
        this.sprite = sprite;
        this.add(sprite);
    }
    setScale(sx, sy, sz = 1) {
        this.sprite.scale.set(sx, sy, sz);
    }
    setRotationY(rad) {
        this.sprite.material.rotation = rad;
    }
}
//# sourceMappingURL=ThreeSprite.js.map