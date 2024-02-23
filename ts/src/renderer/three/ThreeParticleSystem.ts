class ThreeParticleSystem {
	node: THREE.Object3D;
	particles = [];
	geometry = new THREE.InstancedBufferGeometry();
	particleEmitters = [];

	constructor() {
		const uniforms = {
			diffuseTexture: {
				value: ThreeTextureManager.instance().textureMap.get(
					'https://cache.modd.io/asset/spriteImage/1706669285561_Tree_(1)_(2).png'
				),
			},
		};

		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader: vs,
			fragmentShader: fs,
			transparent: true,
			depthWrite: false,
			blending: THREE.CustomBlending,
			blendEquation: THREE.AddEquation,
			blendSrc: THREE.OneFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor,
		});

		this.geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(
				[-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0],
				3
			)
		);
		this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0], 2));
		this.geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(), 3));

		const points = new THREE.Mesh(this.geometry, material);
		points.frustumCulled = false;
		points.matrixAutoUpdate = false;
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		points.updateMatrixWorld = function () {};
		this.node = points;

		this.particleEmitters.push({
			position: { x: -15.828125, y: 2.0, z: -59.484375 },
			radius_1: 0.02,
			radius_2: 1,
			radius_height: 5,
			add_time: 0.1,
			elapsed: 0,
			live_time_from: 7,
			live_time_to: 7.5,
			opacity_decrease: 0.008,
			rotation_from: 0.5,
			rotation_to: 1,
			speed_from: 0.005,
			speed_to: 0.01,
			scale_from: 0.2,
			scale_increase: 0.004,
			color_from: [2, 2, 2],
			color_to: [0, 0, 0],
			color_speed_from: 0.4,
			color_speed_to: 0.4,
			brightness_from: 1,
			brightness_to: 1,
			opacity: 1,
			blend: 0.8,
			texture: 0,

			color: [0, 0, 0],
		});
	}

	update(dt: number, time: number, camera: THREE.Camera) {
		this.particleEmittersUpdate(dt);

		var count = this.particles.length;
		var x = camera.position.x;
		var y = camera.position.y;
		var z = camera.position.z;

		for (var n = 0; n < count; n++) {
			const offset = this.particles[n].offset;
			this.particles[n].d = Math.sqrt(
				Math.pow(x - offset[0], 2) + Math.pow(y - offset[1], 2) + Math.pow(z - offset[2], 2)
			);
		}

		this.particles.sort((a, b) => b.d - a.d);

		const offset = new Float32Array(count * 3);

		for (var n = 0; n < count; n++) {
			const particle = this.particles[n];

			let p = n * 3;
			let one = p + 1;
			let two = p + 2;
			const i_offset = particle.offset;
			offset[p] = i_offset[0];
			offset[one] = i_offset[1];
			offset[two] = i_offset[2];
		}

		const attributes = this.geometry.attributes;
		attributes.offset = new THREE.InstancedBufferAttribute(offset, 3).setUsage(THREE.DynamicDrawUsage);

		// Why doesn instanceCount not work? Look into InstancedMesh
		this.geometry._maxInstanceCount = count;
	}

	particleEmittersUpdate(delta) {
		for (let n = 0; n < this.particleEmitters.length; n++) {
			const emitter = this.particleEmitters[n];
			emitter.elapsed += delta;
			let add = Math.floor(emitter.elapsed / emitter.add_time);
			emitter.elapsed -= add * emitter.add_time;
			if (add > (0.016 / emitter.add_time) * 60 * 1) {
				emitter.elapsed = 0;
				add = 0;
			}

			while (add--) {
				this.particleEmitterEmit(emitter);
			}
		}

		const alive = new Array(this.particles.length);
		let i = 0;

		for (let n = 0; n < this.particles.length; n++) {
			const particle = this.particles[n];

			const wind_x = 0;
			const wind_y = 0;
			const wind_z = 0;

			particle.offset[0] += particle.quaternion[0] + wind_x;
			particle.offset[1] += particle.quaternion[1] + wind_y;
			particle.offset[2] += particle.quaternion[2] + wind_z;

			if (particle.live > 0) {
				particle.live -= delta;

				alive[i] = particle;
				i++;
			}
		}

		alive.length = i;
		this.particles = alive;
	}

	particleEmitterEmit(emitter) {
		const radius_1 = emitter.radius_1 * Math.sqrt(Math.random());
		let theta = 2 * Math.PI * Math.random();
		const x_1 = emitter.position.x + radius_1 * Math.cos(theta);
		const z_1 = emitter.position.z + radius_1 * Math.sin(theta);

		const radius_2 = emitter.radius_2 * Math.sqrt(Math.random());
		theta = 2 * Math.PI * Math.random();
		const x_2 = x_1 + radius_2 * Math.cos(theta);
		const z_2 = z_1 + radius_2 * Math.sin(theta);

		let direction_x = x_2 - x_1;
		let direction_y = emitter.radius_height;
		let direction_z = z_2 - z_1;

		const speed = Math.random() * (emitter.speed_to - emitter.speed_from) + emitter.speed_from;

		const divide =
			(1 / Math.sqrt(direction_x * direction_x + direction_y * direction_y + direction_z * direction_z)) * speed;
		direction_x *= divide;
		direction_y *= divide;
		direction_z *= divide;

		this.particles.push({
			offset: [x_1, emitter.position.y, z_1],
			quaternion: [direction_x, direction_y, direction_z, 3],
			live: Math.random() * (emitter.live_time_to - emitter.live_time_from) + emitter.live_time_from,
		});
	}
}

const vs = `
  attribute vec3 offset;

  varying vec2 vUv;
  vec3 localUpVector=vec3(0.0,1.0,0.0);

  vec2 scale = vec2(1.0, 1.0);

  void main() {
    vUv = uv;

    // https://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/billboards/
    vec3 cameraRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 cameraUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec3 pos = offset + cameraRight * position.x * scale.x + cameraUp * position.y * scale.y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fs = `
  uniform sampler2D diffuseTexture;
  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(diffuseTexture, vUv);
  }
`;
