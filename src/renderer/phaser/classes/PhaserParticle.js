class PhaserParticle extends Phaser.GameObjects.Particles.ParticleEmitter {
    constructor(scene, particle) {
        let particleData = taro.game.data.particleTypes[particle.particleId];
        //@ts-ignore //there seems to be an issue with phaser's type def for particleEmitter
        super(scene, particle.position.x, particle.position.y, `particle/${particleData.url}`, PhaserParticle.createConfig(scene, particleData, particle.angle));
        if (particle.entityId) {
            let entity = scene.findEntity(particle.entityId);
            if (entity) {
                entity.attachedParticles.push(this);
                this.startFollow(entity.gameObject);
            }
        }
        this.setDepth(particleData["z-index"].depth);
        this.on('complete', (emitter) => { emitter.destroy(); });
        scene.entityLayers[particleData["z-index"].layer - 1].add(this);
    }
    static createConfig(scene, data, angle) {
        if (data) {
            let frame = scene.textures.getFrame(`particle/${data.url}`);
            let config = {
                angle: (particle, key, value) => {
                    let direction = Math.floor(Math.random() * (data.angle.max - data.angle.min + 1) + data.angle.min) + angle;
                    particle.angle = data.fixedRotation ? 0 : direction;
                    return direction - 90;
                },
                rotate: (particle, key, value) => {
                    return value;
                },
                speed: { min: data.speed.min, max: data.speed.max },
                lifespan: data.lifeBase,
                alpha: { start: 1, end: data.deathOpacityBase },
                name: data.name,
                duration: data.duration,
                frequency: data.emitFrequency,
                scaleX: data.dimensions.width / frame.width,
                scaleY: data.dimensions.height / frame.height
            };
            if (data.emitZone && data.emitZone.x && data.emitZone.y) {
                config.emitZone = new Phaser.GameObjects.Particles.Zones.RandomZone(new Phaser.Geom.Rectangle(-data.emitZone.x / 2, -data.emitZone.y / 2, data.emitZone.x, data.emitZone.y));
            }
            ;
            return config;
        }
    }
}
//# sourceMappingURL=PhaserParticle.js.map