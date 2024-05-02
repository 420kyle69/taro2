namespace Renderer {
	export namespace Three {
		export class Model extends Node {
			private scene: THREE.Group;
			private aabb = new THREE.Box3();
			private size = new THREE.Vector3();
			private center = new THREE.Vector3();

			constructor(name: string) {
				super();

				const model = gAssetManager.getModel(name);
				this.scene = model.scene.clone();
				this.add(this.scene);
			}

			getSize() {
				this.aabb.setFromObject(this.scene);
				return this.aabb.getSize(this.size);
			}

			getCenter() {
				this.aabb.setFromObject(this.scene);
				return this.aabb.getCenter(this.center);
			}
		}
	}
}
