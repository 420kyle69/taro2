class ThreeAttributeBar extends THREE.Group {
    constructor(text = '100') {
        super();
        this.scaleScalar = 1;
        this.center = new THREE.Vector2(0.5, 0.5);
        this.offset = new THREE.Vector2();
        this.sprite = this.createBar(text);
        this.add(this.sprite);
    }
    update(text, color = 'white', bold = false) {
        this.remove(this.sprite);
        this.sprite = this.createBar(text, color, bold);
        this.add(this.sprite);
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
    createBar(text, color = 'white', bold = false) {
        const textCanvas = document.createElement('canvas');
        const ctx = textCanvas.getContext('2d');
        const font = `bold 14px Verdana`;
        const padding = 4;
        var x = padding / 2;
        var y = padding / 2;
        var w = 94;
        var h = 16;
        var radius = h / 2 - 1;
        ctx.font = font;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        textCanvas.width = w + padding;
        textCanvas.height = h + padding;
        fillRoundedRect(ctx, x, y, w, h, radius);
        strokeRoundedRect(ctx, x, y, w, h, radius);
        ctx.font = font;
        ctx.fillStyle = '#000';
        ctx.fillText(text, textCanvas.width / 2 - textWidth / 2, textCanvas.height / 2 + textHeight / 2);
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
function fillRoundedRect(ctx, x, y, width, height, radius) {
    var tl = radius;
    var tr = radius;
    var bl = radius;
    var br = radius;
    const fillColor = 0xffff00;
    const fillAlpha = 1;
    const red = (fillColor & 0xff0000) >>> 16;
    const green = (fillColor & 0xff00) >>> 8;
    const blue = fillColor & 0xff;
    ctx.fillStyle = `rgba(${red},${green},${blue},${fillAlpha})`;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + width - tr, y);
    ctx.arc(x + width - tr, y + tr, tr, -(Math.PI * 0.5), 0);
    ctx.lineTo(x + width, y + height - br);
    ctx.arc(x + width - br, y + height - br, br, 0, Math.PI * 0.5);
    ctx.lineTo(x + bl, y + height);
    ctx.arc(x + bl, y + height - bl, bl, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + tl);
    ctx.arc(x + tl, y + tl, tl, -Math.PI, -(Math.PI * 0.5));
    ctx.fill();
}
function strokeRoundedRect(ctx, x, y, width, height, radius) {
    var tl = radius;
    var tr = radius;
    var bl = radius;
    var br = radius;
    const lineWidth = 2;
    const lineColor = 0x000000;
    const lineAlpha = 1;
    const red = (lineColor & 0xff0000) >>> 16;
    const green = (lineColor & 0xff00) >>> 8;
    const blue = lineColor & 0xff;
    ctx.strokeStyle = `rgba(${red},${green},${blue},${lineAlpha})`;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + width - tr, y);
    ctx.moveTo(x + width - tr, y);
    ctx.arc(x + width - tr, y + tr, tr, -(Math.PI * 0.5), 0);
    ctx.lineTo(x + width, y + height - br);
    ctx.moveTo(x + width, y + height - br);
    ctx.arc(x + width - br, y + height - br, br, 0, Math.PI * 0.5);
    ctx.lineTo(x + bl, y + height);
    ctx.moveTo(x + bl, y + height);
    ctx.arc(x + bl, y + height - bl, bl, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + tl);
    ctx.moveTo(x, y + tl);
    ctx.arc(x + tl, y + tl, tl, -Math.PI, -(Math.PI * 0.5));
    ctx.stroke();
}
//# sourceMappingURL=ThreeAttributeBar.js.map