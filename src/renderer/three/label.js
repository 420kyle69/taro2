class Label extends THREE.Group {
    constructor(text = 'cccccc') {
        super();
        const textCanvas = document.createElement('canvas');
        textCanvas.height = 34;
        const ctx = textCanvas.getContext('2d');
        const font = '16px Verdana';
        ctx.font = font;
        textCanvas.width = Math.ceil(ctx.measureText(text).width + 16);
        ctx.font = font;
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 3;
        ctx.strokeText(text, 8, 26);
        ctx.fillStyle = 'white';
        ctx.font = font;
        ctx.fillText(text, 8, 26);
        const spriteMap = new THREE.Texture(ctx.getImageData(0, 0, textCanvas.width, textCanvas.height));
        spriteMap.minFilter = THREE.LinearFilter;
        spriteMap.generateMipmaps = false;
        spriteMap.needsUpdate = true;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteMap }));
        sprite.scale.set((0.4 * textCanvas.width) / textCanvas.height, 0.4, 1);
        sprite.position.y = 2;
        this.add(sprite);
    }
}
//# sourceMappingURL=label.js.map