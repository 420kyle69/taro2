class ThreeAnimatedSprite extends THREE.Group {
    constructor(tex, tileH, tileV, currentTile = 0) {
        super();
        this.tex = tex;
        this.tileH = tileH;
        this.tileV = tileV;
        this.currentTile = currentTile;
        this.playSpriteIndices = [];
        this.runningTileArrayIndex = 0;
        this.maxDisplayTime = 0;
        this.elapsedTime = 0;
        tex.repeat.set(1 / tileH, 1 / tileV);
        const offsetX = (currentTile % tileH) / tileH;
        const offsetY = 1 - 1 / tileV - (Math.floor(this.currentTile / tileH) % tileV) / tileV;
        tex.offset.set(offsetX, offsetY);
        const spriteMaterial = new THREE.SpriteMaterial({ map: tex });
        spriteMaterial.depthTest = false;
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.renderOrder = 1001;
        sprite.position.set(taro.game.data.map.width / 2, 1, taro.game.data.map.height / 2);
        this.add(sprite);
    }
    loop(playSpriteIndices, fps) {
        this.playSpriteIndices = playSpriteIndices;
        this.runningTileArrayIndex = 0;
        this.currentTile = playSpriteIndices[this.runningTileArrayIndex];
        this.maxDisplayTime = 1 / fps;
    }
    update(dt) {
        this.elapsedTime += dt;
        if (this.maxDisplayTime > 0 && this.elapsedTime >= this.maxDisplayTime) {
            this.elapsedTime = 0;
            this.runningTileArrayIndex = (this.runningTileArrayIndex + 1) % this.playSpriteIndices.length;
            this.currentTile = this.playSpriteIndices[this.runningTileArrayIndex];
            const offsetX = (this.currentTile % this.tileH) / this.tileH;
            const offsetY = 1 - 1 / this.tileV - (Math.floor(this.currentTile / this.tileH) % this.tileV) / this.tileV;
            this.tex.offset.set(offsetX, offsetY);
        }
    }
}
//# sourceMappingURL=ThreeAnimatedSprite.js.map