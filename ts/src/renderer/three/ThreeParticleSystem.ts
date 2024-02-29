class ThreeParticleSystem {
	node: THREE.Object3D;
	particles = [];
	geometry = new THREE.InstancedBufferGeometry();
	particleEmitters = [];
	offset = { x: -15.828125, y: 2.0, z: -59.484375 };

	// Used during particle creation; avoid instantiating temp objects
	private worldPos = new THREE.Vector3();
	private forward = new THREE.Vector3();
	private right = new THREE.Vector3();
	private up = new THREE.Vector3();
	private basis = new THREE.Matrix4();
	private direction = new THREE.Vector3();

	constructor() {
		const maxParticles = 10000;

		const particleTextures = ThreeTextureManager.instance().getTexturesWithKeyContains('particle');

		// TODO: Add multiple shaders and geometry groups if texture count > 16
		// Add floor(numTextures / 16) total shaders.
		const material = new THREE.ShaderMaterial({
			uniforms: { textures: { value: particleTextures }, time: { value: 0 } },
			vertexShader: vs,
			fragmentShader: fs,
			transparent: true,
			depthWrite: false,
			blending: THREE.CustomBlending,
			blendEquation: THREE.AddEquation,
			blendSrc: THREE.OneFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor,
			forceSinglePass: true,
		});

		this.geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(
				[-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0],
				3
			)
		);
		this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0], 2));
		this.geometry.setAttribute(
			'offset',
			new THREE.InstancedBufferAttribute(new Float32Array(maxParticles * 3), 3).setUsage(THREE.DynamicDrawUsage)
		);
		this.geometry.setAttribute(
			'scale',
			new THREE.InstancedBufferAttribute(new Float32Array(maxParticles * 2), 2).setUsage(THREE.DynamicDrawUsage)
		);
		this.geometry.setAttribute(
			'rotation',
			new THREE.InstancedBufferAttribute(new Float32Array(maxParticles), 1).setUsage(THREE.DynamicDrawUsage)
		);
		this.geometry.setAttribute(
			'color',
			new THREE.InstancedBufferAttribute(new Float32Array(maxParticles * 4), 4).setUsage(THREE.DynamicDrawUsage)
		);
		this.geometry.setAttribute(
			'blend',
			new THREE.InstancedBufferAttribute(new Float32Array(maxParticles), 1).setUsage(THREE.DynamicDrawUsage)
		);
		this.geometry.setAttribute(
			'texture',
			new THREE.InstancedBufferAttribute(new Float32Array(maxParticles), 1).setUsage(THREE.DynamicDrawUsage)
		);

		const points = new THREE.Mesh(this.geometry, material);
		points.frustumCulled = false;
		points.matrixAutoUpdate = false;
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		points.updateMatrixWorld = function () {};
		this.node = points;
	}

	update(dt: number, time: number, camera: THREE.Camera) {
		const emittersIndicesMarkedForDestroy = [];

		for (let i = 0; i < this.particleEmitters.length; i++) {
			const emitter = this.particleEmitters[i];

			emitter.elapsed += dt;

			if (emitter.duration > 0 && emitter.elapsed >= emitter.duration) {
				emittersIndicesMarkedForDestroy.push(i);
				continue;
			}

			if (emitter.target) {
				emitter.target.getWorldPosition(this.worldPos);
				emitter.position.x = this.worldPos.x;
				emitter.position.y = this.worldPos.y;
				emitter.position.z = this.worldPos.z;
			}
		}

		// TODO: fix death time, now it extends the lifetime which is no good
		for (const idx of emittersIndicesMarkedForDestroy) {
			this.particleEmitters.splice(idx, 1);
		}

		this.particleEmittersUpdate(dt);

		const count = this.particles.length;
		const x = camera.position.x;
		const y = camera.position.y;
		const z = camera.position.z;
		for (var n = 0; n < count; n++) {
			const offset = this.particles[n].offset;
			this.particles[n].dSq = Math.pow(x - offset[0], 2) + Math.pow(y - offset[1], 2) + Math.pow(z - offset[2], 2);
		}
		this.particles.sort((a, b) => b.dSq - a.dSq);

		const offsetAttribute = this.geometry.attributes.offset.array;
		const scaleAttribute = this.geometry.attributes.scale.array;
		const rotationAttribute = this.geometry.attributes.rotation.array;
		const colorAttribute = this.geometry.attributes.color.array;
		const blendAttribute = this.geometry.attributes.blend.array;
		const textureAttribute = this.geometry.attributes.texture.array;

		for (var n = 0; n < count; n++) {
			const particle = this.particles[n];
			offsetAttribute[n * 3 + 0] = particle.offset[0];
			offsetAttribute[n * 3 + 1] = particle.offset[1];
			offsetAttribute[n * 3 + 2] = particle.offset[2];

			scaleAttribute[n * 2 + 0] = particle.scale[0];
			scaleAttribute[n * 2 + 1] = particle.scale[1];

			rotationAttribute[n] = particle.rotation;

			colorAttribute[n * 4 + 0] = particle.color[0];
			colorAttribute[n * 4 + 1] = particle.color[1];
			colorAttribute[n * 4 + 2] = particle.color[2];
			colorAttribute[n * 4 + 3] = particle.color[3];

			blendAttribute[n] = particle.blend;

			textureAttribute[n] = particle.texture;
		}

		this.geometry.attributes.offset.needsUpdate = true;
		this.geometry.attributes.scale.needsUpdate = true;
		this.geometry.attributes.rotation.needsUpdate = true;
		this.geometry.attributes.color.needsUpdate = true;
		this.geometry.attributes.blend.needsUpdate = true;
		this.geometry.attributes.texture.needsUpdate = true;

		this.geometry.instanceCount = count;

		((this.node as THREE.Mesh).material as THREE.ShaderMaterial).uniforms.time.value = time;
	}

	particleEmittersUpdate(delta) {
		for (let n = 0; n < this.particleEmitters.length; n++) {
			const emitter = this.particleEmitters[n];
			emitter.accumulator += delta;
			let add = Math.floor(emitter.accumulator / emitter.add_time);
			emitter.accumulator -= add * emitter.add_time;
			if (add > (0.016 / emitter.add_time) * 60) {
				emitter.accumulator = 0;
				add = 0;
			}

			while (add--) {
				this.particleEmitterEmit(emitter);
			}
		}

		let i = 0;
		for (let n = 0; n < this.particles.length; n++) {
			const particle = this.particles[n];

			if (particle.live > 0) {
				particle.live -= delta;

				// NOTE(nick): Decrease opacity during particle's lifetime, this is how
				// it currently works in the Phaser renderer. We might want to add more
				// control to this in the future and give users more emitter settings to
				// play with in the editor.
				let opacity = particle.live / particle.lifetime;
				if (opacity < 0) opacity = 0;

				particle.color[3] = opacity;

				if (particle.color_t < 1) {
					const p = particle;
					particle.color[0] = p.color_from[0] + (p.color_to[0] - p.color_from[0]) * p.color_t;
					particle.color[1] = p.color_from[1] + (p.color_to[1] - p.color_from[1]) * p.color_t;
					particle.color[2] = p.color_from[2] + (p.color_to[2] - p.color_from[2]) * p.color_t;
					particle.color_t += delta * particle.color_speed;
				} else {
					particle.color[0] = particle.color_to[0];
					particle.color[1] = particle.color_to[1];
					particle.color[2] = particle.color_to[2];
				}

				particle.offset[0] += particle.quaternion[0];
				particle.offset[1] += particle.quaternion[1];
				particle.offset[2] += particle.quaternion[2];

				particle.scale[0] += particle.scale_increase;
				particle.scale[1] += particle.scale_increase;

				this.particles[i] = particle;

				i++;
			}
		}

		this.particles.length = i;
	}

	particleEmitterEmit(emitter) {
		this.forward.set(emitter.direction.x, emitter.direction.y, emitter.direction.z).normalize();
		this.right.crossVectors({ x: 0, y: 1, z: 0 } as THREE.Vector3, this.forward).normalize();
		if (this.forward.x <= Number.EPSILON && this.forward.z <= Number.EPSILON) {
			this.right.set(0, 0, 1);
		}
		this.up.crossVectors(this.forward, this.right).normalize();
		this.basis.makeBasis(this.right, this.up, this.forward);

		const randAzimuth = Math.random() * (emitter.azimuth.max - emitter.azimuth.min) + emitter.azimuth.min;
		const randElevation = Math.random() * (emitter.elevation.max - emitter.elevation.min) + emitter.elevation.min;
		const angleOffset = Math.PI * 0.5;
		const speed = Math.random() * (emitter.speed_to - emitter.speed_from) + emitter.speed_from;

		this.direction
			.set(Math.cos(randAzimuth + angleOffset), Math.sin(randElevation), Math.sin(randAzimuth + angleOffset))
			.normalize()
			.applyMatrix4(this.basis)
			.multiplyScalar(speed);

		const brightness = Math.random() * (emitter.brightness_to - emitter.brightness_from) + emitter.brightness_from;

		const position = {
			x: emitter.position.x + (emitter.shape.width * Math.random() - emitter.shape.width * 0.5),
			y: emitter.position.y + (emitter.shape.height * Math.random() - emitter.shape.height * 0.5),
			z: emitter.position.z + (emitter.shape.depth * Math.random() - emitter.shape.depth * 0.5),
		};

		const lifetime = Math.random() * (emitter.live_time_to - emitter.live_time_from) + emitter.live_time_from;

		this.particles.push({
			offset: [position.x, position.y, position.z],
			// TODO: rename quaternion to velocity
			quaternion: [this.direction.x, this.direction.y, this.direction.z, 3],
			lifetime: lifetime,
			live: lifetime,
			scale: [emitter.scale_from, emitter.scale_from],
			scale_increase: emitter.scale_increase,
			rotation: Math.random() * (emitter.rotation_to - emitter.rotation_from) + emitter.rotation_from,
			color: [1, 1, 1, emitter.opacity],
			color_from: [
				emitter.color_from[0] * brightness,
				emitter.color_from[1] * brightness,
				emitter.color_from[2] * brightness,
			],
			color_to: [emitter.color_to[0] * brightness, emitter.color_to[1] * brightness, emitter.color_to[2] * brightness],
			color_speed: Math.random() * (emitter.color_speed_to - emitter.color_speed_from) + emitter.color_speed_from,
			color_t: 0,
			blend: emitter.blend,
			texture: emitter.texture,
		});
	}
}

const vs = `
  attribute vec3 offset;
  attribute vec2 scale;
  attribute float rotation;
  attribute vec4 color;
  attribute float blend;
  attribute float texture;

  uniform float time;

  varying vec2 vUv;
  varying vec4 vColor;
  varying float vBlend;
  varying float vTexture;

  void main() {
    vUv = uv;
    vColor = color;
    vBlend = blend;
    vTexture = texture;

    float angle = time * rotation;
    vec2 vRotated = vec2(position.x * cos(angle) - position.y * sin(angle), position.y * cos(angle) + position.x * sin(angle));

    // https://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/billboards/
    vec3 cameraRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 cameraUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec3 pos = offset + cameraRight * vRotated.x * scale.x + cameraUp * vRotated.y * scale.y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fs = `
  uniform sampler2D textures[16];

  varying vec2 vUv;
  varying vec4 vColor;
  varying float vBlend;
  varying float vTexture;

  void main() {
    if (vTexture == 0.0) gl_FragColor = texture2D(textures[0], vUv) * vColor;
    else if (vTexture == 1.0) gl_FragColor = texture2D(textures[1], vUv) * vColor;
    else if (vTexture == 2.0) gl_FragColor = texture2D(textures[2], vUv) * vColor;
    else if (vTexture == 3.0) gl_FragColor = texture2D(textures[3], vUv) * vColor;
    else if (vTexture == 4.0) gl_FragColor = texture2D(textures[4], vUv) * vColor;
    else if (vTexture == 5.0) gl_FragColor = texture2D(textures[5], vUv) * vColor;
    else if (vTexture == 6.0) gl_FragColor = texture2D(textures[6], vUv) * vColor;
    else if (vTexture == 7.0) gl_FragColor = texture2D(textures[7], vUv) * vColor;
    else if (vTexture == 8.0) gl_FragColor = texture2D(textures[8], vUv) * vColor;
    else if (vTexture == 9.0) gl_FragColor = texture2D(textures[9], vUv) * vColor;
    else if (vTexture == 10.0) gl_FragColor = texture2D(textures[10], vUv) * vColor;
    else if (vTexture == 11.0) gl_FragColor = texture2D(textures[11], vUv) * vColor;
    else if (vTexture == 12.0) gl_FragColor = texture2D(textures[12], vUv) * vColor;
    else if (vTexture == 13.0) gl_FragColor = texture2D(textures[13], vUv) * vColor;
    else if (vTexture == 14.0) gl_FragColor = texture2D(textures[14], vUv) * vColor;
    else if (vTexture == 15.0) gl_FragColor = texture2D(textures[15], vUv) * vColor;

    gl_FragColor.rgb *= gl_FragColor.a;
    gl_FragColor.a *= vBlend;
  }
`;
