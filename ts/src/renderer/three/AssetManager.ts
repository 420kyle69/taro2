namespace Renderer {
	export namespace Three {
		type Source = {
			name: string;
			type: string;
			src: string;
		};

		type GLTF = {
			animations: THREE.AnimationClip[];
			scene: THREE.Group;
			scenes: THREE.Group[];
			cameras: THREE.Camera[];
			asset: Object;
		};

		type Asset = THREE.Texture | GLTF;

		class AssetManager {
			filter: typeof THREE.LinearFilter | typeof THREE.NearestFilter = THREE.LinearFilter;

			private assets: Map<string, Asset> = new Map();
			private loaders: Map<string, THREE.Loader> = new Map();

			constructor() {
				const dracoLoader = new DRACOLoader();
				dracoLoader.setDecoderPath('/assets/lib/draco');

				const gltfLoader = new GLTFLoader();
				gltfLoader.setDRACOLoader(dracoLoader);

				this.loaders.set('gltf', gltfLoader);
				this.loaders.set('texture', new THREE.TextureLoader());
			}

			load(sources: Source[], loadingManager?: THREE.LoadingManager) {
				for (const source of sources) {
					const loader = this.loaders.get(source.type);
					if (loader) {
						if (loadingManager) {
							loader.manager = loadingManager;
						}

						loader.load(source.src, (asset: Asset) => {
							console.log(asset);
							this.assets.set(source.name, asset);
						});
					}
				}
			}

			get(name: string) {
				return this.assets.get(name);
			}

			set(name: string, asset: Asset) {
				this.assets.set(name, asset);
			}

			setFilter(filter: typeof THREE.LinearFilter | typeof THREE.NearestFilter) {
				this.filter = filter;
			}
		}

		export const gAssetManager = new AssetManager();
	}
}
