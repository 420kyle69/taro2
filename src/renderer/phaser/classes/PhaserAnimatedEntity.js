class PhaserAnimatedEntity extends PhaserEntity {
    constructor(scene, entity, key) {
        super(entity);
        this.scene = scene;
        this.key = key;
        this.attachedParticles = [];
        const bounds = entity._bounds2d;
        this.sprite = this.addSprite(key);
        this.sprite.setDisplaySize(bounds.x, bounds.y);
        this.sprite.rotation = entity._rotate.z;
        Object.assign(this.evtListeners, {
            'play-animation': entity.on('play-animation', this.playAnimation, this),
            size: entity.on('size', this.size, this),
            scale: entity.on('scale', this.scale, this),
            flip: entity.on('flip', this.flip, this),
        });
    }
    playAnimation(animationId) {
        if (this.scene.anims.exists(`${this.key}/${animationId}`)) {
            this.sprite.play(`${this.key}/${animationId}`);
        }
        else {
            this.sprite.anims.stop();
        }
    }
    transform(data) {
        this.gameObject.setPosition(data.x, data.y);
        this.sprite.rotation = data.rotation;
        this.flip(this.entity._stats.flip);
    }
    size(data) {
        this.sprite.setSize(data.width, data.height);
        this.sprite.setDisplaySize(data.width, data.height);
    }
    scale(data) {
        this.sprite.setScale(data.x, data.y);
    }
    flip(flip) {
        this.sprite.setFlip(flip % 2 === 1, flip > 1);
    }
    destroy() {
        this.sprite = null;
        this.attachedParticles.forEach(particle => particle.stop());
        super.destroy();
    }
    useTexturePack(key) {
        if (this.scene.textures.exists('pack-result')) {
            const frame = this.scene.textures.getFrame('pack-result', key);
            if (frame && frame.name === key) {
                if (this.entity._stats.cellSheet.columnCount === 1 && this.entity._stats.cellSheet.rowCount === 1) {
                    return true;
                }
            }
        }
        return false;
    }
    addSprite(key) {
        if (this.useTexturePack(key)) {
            return this.scene.add.sprite(0, 0, 'pack-result', key);
        }
        return this.scene.add.sprite(0, 0, key);
    }
    setTexture(key) {
        if (this.useTexturePack(key)) {
            return this.sprite.setTexture('pack-result', key);
        }
        return this.sprite.setTexture(key);
    }
}
//# sourceMappingURL=PhaserAnimatedEntity.js.map