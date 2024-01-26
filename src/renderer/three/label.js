class Label extends THREE.Group {
    constructor(text = 'cccccc') {
        super();
        this.scaleScalar = 1;
        this.center = new THREE.Vector2(0.5, 0.5);
        this.offset = new THREE.Vector2();
        this.sprite = this.createLabel(text);
        this.add(this.sprite);
        this.visible = false;
    }
    update(text, color = 'white', bold = false) {
        this.remove(this.sprite);
        this.sprite = this.createLabel(text, color, bold);
        this.add(this.sprite);
        this.visible = true;
    }
    setOffset(offset, center = new THREE.Vector2(0.5, 0.5)) {
        this.center.copy(center);
        this.offset.copy(offset);
        const width = this.sprite.material.map.image.width;
        const height = this.sprite.material.map.image.height;
        this.sprite.center.set(center.x - offset.x / width, center.y - offset.y / height);
    }
    setScale(scale) {
        this.scaleScalar = scale;
        this.sprite.scale.setScalar(scale);
    }
    createLabel(text, color = 'white', bold = false) {
        const textCanvas = document.createElement('canvas');
        textCanvas.height = 10;
        const padding = 4;
        const ctx = textCanvas.getContext('2d');
        const font = `${bold ? 'bold' : 'normal'} 16px Verdana`;
        ctx.font = font;
        const metrics = ctx.measureText(text);
        const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        textCanvas.width = Math.ceil(metrics.width) + padding;
        textCanvas.height = Math.ceil(textHeight) + padding;
        if (taro.game.data.settings.addStrokeToNameAndAttributes) {
            ctx.font = font;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.lineJoin = 'miter';
            ctx.miterLimit = 3;
            ctx.strokeText(text, padding / 2, textHeight + padding / 2);
        }
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.font;
        ctx.fillText(text, padding / 2, textHeight + padding / 2);
        const spriteMap = new THREE.Texture(ctx.getImageData(0, 0, textCanvas.width, textCanvas.height));
        spriteMap.minFilter = THREE.LinearFilter;
        spriteMap.magFilter = THREE.NearestFilter;
        spriteMap.generateMipmaps = false;
        spriteMap.needsUpdate = true;
        const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
        spriteMaterial.depthTest = false;
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.renderOrder = 999;
        sprite.scale.set(this.scaleScalar * (textCanvas.width / 64), this.scaleScalar * (textCanvas.height / 64), 1);
        sprite.center.set(this.center.x - this.offset.x / textCanvas.width, this.center.y - this.offset.y / textCanvas.height);
        return sprite;
    }
}
//# sourceMappingURL=label.js.map