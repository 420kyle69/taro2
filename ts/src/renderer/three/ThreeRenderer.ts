/// <reference types="@types/google.analytics" />

// Isn't it better for the renderer to have no concept of units, projectiles, etc?
// The renderer only needs to know about things like map, sprites, labels, bars, models
// in some hierarchical manner so labels stick to certain sprites.
// And in the case of projectiles, those are just sprites with a lifetime.

// And on the server side, they shouldn't send events on the entities themselves.
// Instead send an entity ID on creation and refer to it in other events that
// require certain entities (e.g. for updating them). This allows for a more
// flat code architecture and makes it more flexible. For instance if you want
// to delete 100 entites, you now need to send 100 destroy messages to those
// entities. Instead you can send one message with 100 entity ID's. (a lot of
// assumtions here, figure out how it actually works).

class ThreeRenderer {
	private renderer: THREE.WebGLRenderer;
	private camera: THREE.Camera;
	private controls: OrbitControls;
	private scene: THREE.Scene;

	private textures: Map<string, THREE.Texture> = new Map();
	private animations: Map<string, { frames: number[]; fps: number; repeat: number }> = new Map();

	private entities: Entity[] = [];

	private pointer = new THREE.Vector2();
	private followedEntity: Entity | null = null;

	private animatedSprites: ThreeAnimatedSprite[] = [];

	constructor() {
		const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });
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
		this.scene.translateX(-taro.game.data.map.width / 2);
		this.scene.translateZ(-taro.game.data.map.height / 2);

		THREE.DefaultLoadingManager.onStart = () => {
			this.forceLoadUnusedCSSFonts();
		};

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
				tex.userData.numColumns = cellSheet.columnCount || 1;
				tex.userData.numRows = cellSheet.rowCount || 1;
				tex.userData.key = key;
				this.textures.set(key, tex);
			});

			// Add animations
			for (let animationsKey in data.projectileTypes[type].animations) {
				console.log(key);
				const animation = data.projectileTypes[type].animations[animationsKey];
				const frames = animation.frames;
				const animationFrames: number[] = [];

				// Correction for 0-based indexing
				for (let i = 0; i < frames.length; i++) {
					animationFrames.push(frames[i] - 1);
				}

				// Avoid crash by giving it frame 0 if no frame data provided
				if (animationFrames.length === 0) {
					animationFrames.push(0);
				}

				if (this.animations.has(`${key}/${animationsKey}`)) {
					this.animations.delete(`${key}/${animationsKey}`);
				}

				this.animations.set(`${key}/${animationsKey}`, {
					frames: animationFrames,
					fps: animation.framesPerSecond || 15,
					repeat: animation.loopCount - 1, // correction for loop/repeat values
				});
			}
		}

		for (let type in data.itemTypes) {
			const cellSheet = data.itemTypes[type].cellSheet;
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

	private forceLoadUnusedCSSFonts() {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		ctx.font = 'normal 4px Verdana';
		ctx.fillText('text', 0, 8);
		ctx.font = 'bold 4px Verdana';
		ctx.fillText('text', 0, 8);
	}

	private init() {
		const layers = {
			floor: new THREE.Group(),
			walls: new THREE.Group(),
			entities: new THREE.Group(),
		};

		layers.floor.renderOrder = -10;
		layers.walls.position.y = 1;
		layers.entities.position.y = 1;

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

			for (const layer of Object.values(layers)) {
				this.scene.add(layer);
			}

			const tileSize = 64;
			const texWidth = tex.image.width;
			const texHeight = tex.image.height;
			const tilesInRow = texWidth / tileSize;

			const xStep = tileSize / texWidth;
			const yStep = tileSize / texHeight;

			// Create map class

			const createCube = (tile: number) => {
				const newCube = cube.clone();
				newCube.material = newCube.material.clone();

				const xIdx = (tile % tilesInRow) - 1;
				const yIdx = Math.floor(tile / tilesInRow);

				newCube.material.map = newCube.material.map.clone();
				newCube.material.map.repeat.set(tileSize / texWidth, tileSize / texHeight);
				newCube.material.map.offset.x = xStep * xIdx;
				newCube.material.map.offset.y = 1 - yStep * yIdx - yStep;

				return newCube;
			};

			taro.game.data.map.layers.forEach((layer) => {
				if (['floor', 'walls'].includes(layer.name)) {
					for (let z = 0; z < layer.height; z++) {
						for (let x = 0; x < layer.width; x++) {
							const cube = createCube(layer.data[z * layer.width + x]);
							cube.position.set(x, 0, z);
							cube.renderOrder = 1;
							layers[layer.name].add(cube);
						}
					}
				}
			});
		});

		const createEntity = (entity: Unit | Item | Projectile) => {
			const tex = this.textures.get(entity._stats.cellSheet.url);

			const createEntity = () => {
				// TODO: Make all entities sprites, not a 3D mesh. Only the map is 3D?
				// Uhm what about furniture? They need to be 3D but we don't have proper
				// models for them yet.
				if (entity instanceof Unit) {
					const e = new ThreeUnit(tex.clone());
					this.animatedSprites.push(e);
					return e;
				} else if (entity instanceof Projectile) {
					const e = new ThreeUnit(tex.clone());
					this.animatedSprites.push(e);
					return e;
				}
				return new Entity(tex);
			};

			const ent = createEntity();
			layers.entities.add(ent);
			this.entities.push(ent);

			const transformEvtListener = entity.on(
				'transform',
				(data: { x: number; y: number; rotation: number }) => {
					ent.position.set(data.x / 64 - 0.5, 0, data.y / 64 - 0.5);
					ent.rotation.y = -data.rotation;
				},
				this
			);

			const sizeEvtListener = entity.on(
				'size',
				(data: { width: number; height: number }) => {
					ent.mesh.scale.set(data.width / 64, data.height / 64, data.height / 64);
					(ent as ThreeUnit).sprite?.scale.set(data.width / 64, data.height / 64);
				},
				this
			);

			const scaleEvtListener = entity.on(
				'scale',
				(data: { x: number; y: number }) => {
					ent.scale.set(data.x, 1, data.y);
				},
				this
			);

			const showEvtListener = entity.on(
				'show',
				() => {
					ent.visible = true;
				},
				this
			);

			const hideEvtListener = entity.on(
				'hide',
				() => {
					ent.visible = false;
				},
				this
			);

			const followEvtListener = entity.on(
				'follow',
				() => {
					this.followedEntity = ent;
				},
				this
			);

			// Label
			const updateLabelEvtListener = entity.on('update-label', (data) => {
				(ent as ThreeUnit).showLabel();
				(ent as ThreeUnit).updateLabel(data);
			});

			const showLabelEvtListener = entity.on('show-label', () => {
				(ent as ThreeUnit).showLabel();
			});

			const hideLabelEvtListener = entity.on('hide-label', () => {
				(ent as ThreeUnit).hideLabel();
			});

			// Attributes
			const renderAttributesEvtListener = entity.on('render-attributes', (data) => {
				(ent as ThreeUnit).renderAttributes(data);
			});

			const updateAttributeEvtListener = entity.on('update-attribute', (data) => {
				(ent as ThreeUnit).updateAttribute(data);
			});

			const renderChatBubbleEvtListener = entity.on('render-chat-bubble', (text) => {
				(ent as ThreeUnit).renderChat(text);
			});

			// Animation
			const playAnimationEvtListener = entity.on('play-animation', (id) => {
				if (entity instanceof Projectile) {
					const animation = this.animations.get(`${tex.userData.key}/${id}`);
					(ent as ThreeUnit).loop(animation.frames, animation.fps, animation.repeat);
				}
			});

			const destroyEvtListener = entity.on(
				'destroy',
				() => {
					const idx = this.entities.indexOf(ent, 0);
					if (idx > -1) {
						layers.entities.remove(ent);
						this.entities.splice(idx, 1);

						// Why do I have to call this on the client on destroy?
						// Does the server not auto cleanup event emitters?
						entity.off('transform', transformEvtListener);
						entity.off('size', sizeEvtListener);
						entity.off('scale', scaleEvtListener);
						entity.off('show', showEvtListener);
						entity.off('hide', hideEvtListener);
						entity.off('follow', followEvtListener);
						entity.off('destroy', destroyEvtListener);

						entity.off('update-label', updateLabelEvtListener);
						entity.off('show-label', showLabelEvtListener);
						entity.off('hide-label', hideLabelEvtListener);

						entity.off('render-attributes', renderAttributesEvtListener);
						entity.off('update-attribute', updateAttributeEvtListener);

						entity.off('render-chat-bubble', renderChatBubbleEvtListener);

						entity.off('play-animation', playAnimationEvtListener);
					}
				},
				this
			);
		};

		taro.client.on('create-unit', (u: Unit) => createEntity(u), this);
		taro.client.on('create-item', (i: Item) => createEntity(i), this);
		taro.client.on('create-projectile', (p: Projectile) => createEntity(p), this);

		this.renderer.domElement.addEventListener('mousemove', (evt: MouseEvent) => {
			this.pointer.set((evt.clientX / window.innerWidth) * 2 - 1, -(evt.clientY / window.innerHeight) * 2 + 1);
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
		taro.client.emit('tick');

		if (this.followedEntity) {
			const pointer = new THREE.Vector3(this.pointer.x, this.pointer.y, 0.5);
			pointer.unproject(this.camera);
			taro.input.emit('pointermove', [
				{
					x: (pointer.x + taro.game.data.map.width / 2 + 0.5) * 64,
					y: (pointer.z + taro.game.data.map.height / 2 + 0.5) * 64,
				},
			]);

			// const followedEntityWorldPos = new THREE.Vector3();
			// this.followedEntity.getWorldPosition(followedEntityWorldPos);
			// this.camera.position.set(followedEntityWorldPos.x, this.camera.position.y, followedEntityWorldPos.z);
			// this.controls.target.set(followedEntityWorldPos.x, this.controls.target.y, followedEntityWorldPos.z);
		}

		for (const sprite of this.animatedSprites) {
			sprite.update(1 / 60);
		}

		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}
}
