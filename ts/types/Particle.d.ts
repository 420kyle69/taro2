interface ParticleData {
	deathOpacityBase: number;
	dimensions: {
		width: number;
		height: number;
	}
	lifeBase: number;
	emitZone?: {
		x: number;
		y: number;
	}
	name: string;
	quantityBase: number;
	quantityTimespan: number;
	url: string;
	"z-index": {
		layer: number;
		depth: number;
	};
	angle: {
		min: number;
		max: number;
	};
	speed: {
		min: number;
		max: number;
	};
	fixedRotation: boolean;
}

interface Particle{
    position: {
        x: number;
        y: number;
    };
	config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
    data: ParticleData;
}