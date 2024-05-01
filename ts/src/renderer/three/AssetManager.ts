namespace Renderer {
	export namespace Three {
		export type AssetSource = {
			name: string;
			type: 'gltf' | 'texture';
			src: string;
		};

		export type GLTF = {
			animations: THREE.AnimationClip[];
			scene: THREE.Group;
			scenes: THREE.Group[];
			cameras: THREE.Camera[];
			asset: Object;
		};

		export type Asset = THREE.Texture | GLTF;

		class AssetManager {
			filter: typeof THREE.LinearFilter | typeof THREE.NearestFilter = THREE.LinearFilter;

			private assets: Map<string, Asset> = new Map();
			private textures: Map<string, THREE.Texture> = new Map();
			private loaders: Map<string, THREE.Loader> = new Map();

			constructor() {
				const dracoLoader = new DRACOLoader();
				dracoLoader.setDecoderPath('/assets/lib/draco');

				const gltfLoader = new GLTFLoader();
				gltfLoader.setDRACOLoader(dracoLoader);

				this.loaders.set('gltf', gltfLoader);
				this.loaders.set('texture', new THREE.TextureLoader());
			}

			setFilter(filter: typeof THREE.LinearFilter | typeof THREE.NearestFilter) {
				this.filter = filter;
			}

			load(sources: AssetSource[], loadingManager?: THREE.LoadingManager, cb?: (name: string) => void) {
				for (const source of sources) {
					const loader = this.loaders.get(source.type);
					if (loader) {
						if (loadingManager) {
							loader.manager = loadingManager;
						}

						loader.load(source.src, (asset: Asset) => {
							if (source.type === 'texture') {
								(asset as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
								(asset as THREE.Texture).magFilter = this.filter;
								this.textures.set(source.name, asset as THREE.Texture);
							}

							this.assets.set(source.name, asset);

							if (cb) cb(source.name);
						});
					}
				}
			}

			get(name: string) {
				return this.assets.get(name);
			}

			getTexture(name: string) {
				return this.assets.get(name) as THREE.Texture;
			}

			getModel(name: string) {
				return this.assets.get(name) as GLTF;
			}

			getTexturesContaining(name: string) {
				const textures: THREE.Texture[] = [];
				for (const [key, value] of this.assets) {
					if (key.includes(name) && value instanceof THREE.Texture) {
						textures.push(value);
					}
				}
				return textures;
			}

			set(name: string, asset: Asset) {
				this.assets.set(name, asset);
			}
		}

		export const gAssetManager = new AssetManager();
	}
}
