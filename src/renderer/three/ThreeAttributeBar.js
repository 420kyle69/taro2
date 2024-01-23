class ThreeAttributeBar extends THREE.Group {
    constructor(text = 'cccccc') {
        super();
        this.scaleScalar = 1;
        this.sprite = this.createLabel(text);
        this.add(this.sprite);
    }
    update(text, color = 'white', bold = false) {
        this.remove(this.sprite);
        this.sprite = this.createLabel(text, color, bold);
        this.add(this.sprite);
    }
    setOffset(offset) {
        this.sprite.geometry.translate(offset.x / 64 / 2 / this.scaleScalar, offset.y / 64 + ((this.sprite.material.map.image.height / 64 / 100) * 1.5) / this.scaleScalar, offset.z / 64 / 2 / this.scaleScalar);
    }
    setScale(scale) {
        this.scaleScalar = scale;
        this.sprite.scale.setScalar(scale);
    }
    createLabel(text, color = 'white', bold = false) {
        const textCanvas = document.createElement('canvas');
        textCanvas.height = 34;
        const ctx = textCanvas.getContext('2d');
        const font = `${bold ? 'bold' : 'normal'} 16px Verdana`;
        ctx.font = font;
        textCanvas.width = Math.ceil(ctx.measureText(text).width + 16);
        if (taro.game.data.settings.addStrokeToNameAndAttributes) {
            ctx.font = font;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.lineJoin = 'miter';
            ctx.miterLimit = 3;
            ctx.strokeText(text, 8, 26);
        }
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.font;
        ctx.fillText(text, 8, 26);
        const spriteMap = new THREE.Texture(ctx.getImageData(0, 0, textCanvas.width, textCanvas.height));
        spriteMap.minFilter = THREE.LinearFilter;
        spriteMap.generateMipmaps = false;
        spriteMap.needsUpdate = true;
        const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
        spriteMaterial.depthTest = false;
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.renderOrder = 999;
        sprite.scale.set(this.scaleScalar * (textCanvas.width / textCanvas.height), this.scaleScalar, 1);
        return sprite;
    }
}
//# sourceMappingURL=ThreeAttributeBar.js.map