class PhaserParticle extends Phaser.GameObjects.Particles.ParticleEmitter{
    constructor (scene: GameScene, particle: Particle) {
        let data = particle.data;
        let frame = scene.textures.getFrame(`particle/${data.url}`);
        let config = {scaleX: data.dimensions.width / frame.width, scaleY: data.dimensions.height / frame.height, ...particle.config};
        if (data.emitZone && data.emitZone.x && data.emitZone.y) {
            config.emitZone = new Phaser.GameObjects.Particles.Zones.RandomZone(new Phaser.Geom.Rectangle(-data.emitZone.x / 2, -data.emitZone.y / 2, data.emitZone.x, data.emitZone.y));
        };
        //@ts-ignore //there seems to be an issue with phaser's type def for particleEmitter
        super(scene, particle.position.x, particle.position.y, `particle/${data.url}`,config);

        if(particle.entityId){
            let entity = scene.findEntity(particle.entityId);
            entity.attachedParticles.push(this);
            this.startFollow(entity.gameObject);
        }
        this.setDepth(data["z-index"].depth);
        this.on('complete', (emitter: PhaserParticle) => {emitter.destroy();});
        scene.entityLayers[data["z-index"].layer - 1].add(this);
    }
}
