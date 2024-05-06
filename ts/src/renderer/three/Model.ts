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

				this.scaleSceneToFitWithinUnits(1);
			}

			getSize() {
				this.aabb.setFromObject(this.scene);
				return this.aabb.getSize(this.size);
			}

			setSize(x: number, y: number, z: number) {
				const size = this.getSize();
				this.scene.scale.set(
					(this.scene.scale.x / size.x) * x,
					(this.scene.scale.y / size.y) * y,
					(this.scene.scale.z / size.z) * z
				);
			}

			setSize2D(x: number, z: number) {
				const size = this.getSize();
				console.warn('unit:model:setSize2D:before', x, z, size);
				this.scene.scale.x = (this.scene.scale.x / size.x) * x;
				this.scene.scale.z = (this.scene.scale.z / size.z) * z;
				console.warn('unit:model:setSize2D:after', x, z, this.scene.scale);
			}

			getCenter() {
				this.aabb.setFromObject(this.scene);
				return this.aabb.getCenter(this.center);
			}

			private scaleSceneToFitWithinUnits(units: number) {
				const size = this.getSize();
				const scale = units / Math.max(...size.toArray());
				this.scene.scale.setScalar(scale);
			}
		}
	}
}
