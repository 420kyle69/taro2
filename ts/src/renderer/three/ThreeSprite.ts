class ThreeSprite extends THREE.Group {
	sprite: THREE.Sprite;
	tileH = 1;
	tileV = 1;

	constructor(tex: THREE.Texture) {
		super();

		if (tex.userData.numColumns && tex.userData.numRows) {
			this.tileH = tex.userData.numColumns;
			this.tileV = tex.userData.numRows;
		}

		const currentTile = 0;

		tex.repeat.set(1 / this.tileH, 1 / this.tileV);
		const offsetX = (currentTile % this.tileH) / this.tileH;
		const offsetY = 1 - 1 / this.tileV - (Math.floor(currentTile / this.tileH) % this.tileV) / this.tileV;
		tex.offset.set(offsetX, offsetY);
		const spriteMaterial = new THREE.SpriteMaterial({ transparent: true, map: tex });
		// spriteMaterial.depthTest = false;
		const sprite = new THREE.Sprite(spriteMaterial);
		// sprite.renderOrder = 1001;
		this.sprite = sprite;
		this.add(sprite);
	}

	setScale(sx: number, sy: number, sz = 1) {
		this.sprite.scale.set(sx, sy, sz);
	}
}
