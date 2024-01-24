class ThreeChatBubble extends THREE.Group {
    constructor(text) {
        super();
        this.width = 97;
        this.height = 16;
        this.radius = 7;
        this.scaleScalar = 1;
        this.center = new THREE.Vector2(0.5, 0.5);
        this.offset = new THREE.Vector2();
        this.sprite = this.createBubble(text);
        this.add(this.sprite);
        this.timeout = setTimeout(() => {
            this.visible = false;
        }, 3000);
    }
    update(text) {
        this.remove(this.sprite);
        this.sprite = this.createBubble(text);
        this.add(this.sprite);
        this.visible = true;
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.timeout = setTimeout(() => {
            this.visible = false;
        }, 3000);
    }
    setOffset(offset, center = new THREE.Vector2(0.5, 0.5)) {
        this.center.copy(center);
        this.offset.copy(offset);
        if (this.sprite) {
            const width = this.sprite.material.map.image.width;
            const height = this.sprite.material.map.image.height;
            this.sprite.center.set(center.x - offset.x / width, center.y - offset.y / height);
        }
    }
    setScale(scale) {
        this.scaleScalar = scale;
        this.sprite.scale.setScalar(scale);
    }
    createBubble(text, color = '#000000') {
        const textCanvas = document.createElement('canvas');
        const ctx = textCanvas.getContext('2d');
        const font = `bold 12px Arial`;
        const padding = 4;
        var x = padding / 2;
        var y = padding / 2;
        ctx.font = font;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        const width = textWidth + 20;
        const height = textHeight + 10;
        textCanvas.width = width + padding;
        textCanvas.height = height + padding + 7;
        const halfSizeX = width / 2;
        const halfSizeY = height / 2;
        Utils.fillRoundedRect(ctx, x, y, width, height, 5, color);
        Utils.fillTriangle(ctx, halfSizeX, halfSizeY * 2 + 7, halfSizeX + 7, halfSizeY * 2, halfSizeX + -7, halfSizeY * 2, color);
        ctx.font = font;
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x + halfSizeX - textWidth / 2, y + halfSizeY + textHeight / 2 - 3);
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
//# sourceMappingURL=ThreeChatBubble.js.map