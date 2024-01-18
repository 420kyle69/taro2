/// <reference types="@types/google.analytics" />

class ThreeRenderer {
	private renderer: THREE.WebGLRenderer;
	private camera: THREE.Camera;
	private controls: OrbitControls;
	private scene: THREE.Scene;

	private textures: Map<string, THREE.Texture> = new Map();

	private units: Unit[] = [];
	private entities: THREE.Mesh[] = [];

	constructor() {
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.querySelector('#game-div')?.appendChild(renderer.domElement);
		this.renderer = renderer;

		const width = window.innerWidth;
		const height = window.innerHeight;
		this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);

		// this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.y = 20;
		this.camera.position.z = 20;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.target = new THREE.Vector3(0, 0, 10);

		this.scene = new THREE.Scene();

		THREE.DefaultLoadingManager.onLoad = () => {
			console.log(this.textures);
			this.init();
			this.setupInputListeners();
			taro.client.rendererLoaded.resolve();
			requestAnimationFrame(this.render.bind(this));
		};

		this.loadTextures();
	}

	private loadTextures() {
		const textureLoader = new THREE.TextureLoader();
		const data = taro.game.data;

		data.map.tilesets.forEach((tileset) => {
			const key = tileset.image;
			const url = Utils.patchAssetUrl(key);
			textureLoader.load(url, (tex) => {
				tex.colorSpace = THREE.SRGBColorSpace;
				this.textures.set(key, tex);
			});
		});

		for (let type in data.unitTypes) {
			const cellSheet = data.unitTypes[type].cellSheet;
			if (!cellSheet) continue;
			const key = cellSheet.url;
			const url = Utils.patchAssetUrl(key);
			textureLoader.load(url, (tex) => {
				tex.colorSpace = THREE.SRGBColorSpace;
				this.textures.set(key, tex);
			});
		}

		for (let type in data.projectileTypes) {
			const cellSheet = data.projectileTypes[type].cellSheet;
			if (!cellSheet) continue;
			const key = cellSheet.url;
			const url = Utils.patchAssetUrl(key);
			textureLoader.load(url, (tex) => {
				tex.colorSpace = THREE.SRGBColorSpace;
				this.textures.set(key, tex);
			});
		}

		for (let type in data.particleTypes) {
			const key = data.particleTypes[type].url;
			const url = Utils.patchAssetUrl(key);
			textureLoader.load(url, (tex) => {
				tex.colorSpace = THREE.SRGBColorSpace;
				this.textures.set(key, tex);
			});
		}
	}

	private init() {
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ transparent: true });
		const cube = new THREE.Mesh(geometry, material);

		taro.game.data.map.tilesets.forEach((tileset) => {
			const tex = this.textures.get(tileset.image);
			tex.minFilter = THREE.NearestFilter;
			tex.magFilter = THREE.NearestFilter;
			tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

			cube.material.map = tex;
			cube.material.needsUpdate = true;

			const map = new THREE.Group();
			map.translateX(-taro.game.data.map.width / 2);
			map.translateZ(-taro.game.data.map.height / 2);
			this.scene.add(map);

			const tileSize = 64;
			const texWidth = tex.image.width;
			const texHeight = tex.image.height;
			const tilesInRow = texWidth / tileSize;

			const xStep = tileSize / texWidth;
			const yStep = tileSize / texHeight;

			taro.game.data.map.layers.forEach((layer) => {
				if (layer.name === 'floor') {
					for (let z = 0; z < layer.height; z++) {
						for (let x = 0; x < layer.width; x++) {
							const newCube = cube.clone();
							newCube.position.set(x, 0, z);
							newCube.material = newCube.material.clone();

							const tileIdx = layer.data[z * layer.width + x];
							const xIdx = (tileIdx % tilesInRow) - 1;
							const yIdx = Math.floor(tileIdx / tilesInRow);

							newCube.material.map = newCube.material.map.clone();
							newCube.material.map.repeat.set(tileSize / texWidth, tileSize / texHeight);
							newCube.material.map.offset.x = xStep * xIdx;
							newCube.material.map.offset.y = 1 - yStep * yIdx - yStep;

							map.add(newCube);
						}
					}
				}

				if (layer.name === 'walls') {
					for (let z = 0; z < layer.height; z++) {
						for (let x = 0; x < layer.width; x++) {
							if (layer.data[z * layer.width + x] !== 0) {
								const newCube = cube.clone();
								newCube.position.set(x, 1, z);
								newCube.material = newCube.material.clone();

								const tileIdx = layer.data[z * layer.width + x];
								const xIdx = (tileIdx % tilesInRow) - 1;
								const yIdx = Math.floor(tileIdx / tilesInRow);

								newCube.material.map = newCube.material.map.clone();
								newCube.material.map.repeat.set(tileSize / texWidth, tileSize / texHeight);
								newCube.material.map.offset.x = xStep * xIdx;
								newCube.material.map.offset.y = 1 - yStep * yIdx - yStep;

								map.add(newCube);
							}
						}
					}
				}
			});
		});

		const entities = new THREE.Group();
		entities.translateX(-taro.game.data.map.width / 2);
		entities.translateZ(-taro.game.data.map.height / 2);
		this.scene.add(entities);

		taro.client.on('create-unit', (unit: Unit) => {
			console.log(unit);
			console.log(unit._stats.cellSheet.url);

			unit.on(
				'transform',
				(data: { x: number; y: number; rotation: number }) => {
					unit._translate.x = data.x;
					unit._translate.y = data.y;
					unit._rotate.z = data.rotation;
				},
				this
			);

			this.units.push(unit);

			const tex = this.textures.get(unit._stats.cellSheet.url);
			const newCube = cube.clone();
			newCube.scale.set(tex.image.width / 64, 1, tex.image.height / 64);
			newCube.position.set(unit._translate.x / 64, 2, unit._translate.y / 64);
			newCube.rotateY(-unit._rotate.z);
			newCube.material = newCube.material.clone();
			newCube.material.map = this.textures.get(unit._stats.cellSheet.url);
			entities.add(newCube);

			this.entities.push(newCube);

			this;
		});
	}

	private setupInputListeners(): void {
		// Ask the input component to set up any listeners it has
		taro.input.setupListeners(this.renderer.domElement);
	}

	getViewportBounds() {
		// return this.scene.getScene('Game').cameras.main.worldView;
		return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
	}

	getCameraWidth(): number {
		// return this.scene.getScene('Game').cameras.main.displayWidth;
		return window.innerWidth;
	}

	getCameraHeight(): number {
		// return this.scene.getScene('Game').cameras.main.displayHeight;
		return window.innerHeight;
	}

	render() {
		requestAnimationFrame(this.render.bind(this));

		if (this.units.length > 0) {
			for (let i = 0; i < this.units.length; i++) {
				const u = this.units[i];
				this.entities[i].position.set(u._translate.x / 64 - 0.5, 2, u._translate.y / 64 - 0.5);
				this.entities[i].rotation.y = -u._rotate.z;
			}
		}

		this.controls.update();
		this.renderer.render(this.scene, this.camera);

		taro.client.emit('tick');
	}
}
