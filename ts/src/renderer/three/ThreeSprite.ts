class ThreeSprite extends THREE.Group {
	private sprite: THREE.Sprite;

	constructor(tex: THREE.Texture) {
		super();

		const spriteMaterial = new THREE.SpriteMaterial({ transparent: true, map: tex });
		const sprite = new THREE.Sprite(spriteMaterial);
		this.sprite = sprite;
		this.add(sprite);
	}

	setScale(sx: number, sy: number, sz = 1) {
		this.sprite.scale.set(sx, sy, sz);
	}

	setRotationY(rad: number) {
		this.sprite.material.rotation = rad;
	}
}
