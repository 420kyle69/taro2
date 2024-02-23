class ThreeParticleSystem {
	node: THREE.Object3D;
	particles = [];
	geometry = new THREE.InstancedBufferGeometry();

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
		this.geometry.setAttribute('scale', new THREE.InstancedBufferAttribute(new Float32Array(), 2));
		this.geometry.setAttribute('quaternion', new THREE.InstancedBufferAttribute(new Float32Array(), 4));
		this.geometry.setAttribute('rotation', new THREE.InstancedBufferAttribute(new Float32Array(), 1));
		this.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(), 4));
		this.geometry.setAttribute('blend', new THREE.InstancedBufferAttribute(new Float32Array(), 1));
		this.geometry.setAttribute('texture', new THREE.InstancedBufferAttribute(new Float32Array(), 1));

		const points = new THREE.Mesh(this.geometry, material);
		points.frustumCulled = false;
		points.matrixAutoUpdate = false;
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		points.updateMatrixWorld = function () {};
		this.node = points;

		points.geometry.instanceCount = 1;

		console.log(window.innerWidth / window.innerHeight);
		console.log(window.innerHeight / window.innerWidth);
	}

	update(dt: number, time: number, camera: THREE.Camera) {
		//
	}
}

const vs = `
  varying vec2 vUv;
  vec3 localUpVector=vec3(0.0,1.0,0.0);

  vec2 scale = vec2(1.0, 1.0);
  vec3 offset = vec3(-15.828125, 2.0, -59.484375);

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
