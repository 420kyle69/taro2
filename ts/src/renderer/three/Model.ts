namespace Renderer {
	export namespace Three {
		export class Model extends Node {
			private scene: THREE.Group;
			private aabb = new THREE.Box3();
			private size = new THREE.Vector3();
			private center = new THREE.Vector3();
			private originalSize = new THREE.Vector3();
			private originalScale = new THREE.Vector3();

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
				console.log('size', size, this.scene.scale);
				console.warn('unit:model:setSize2D:before', x, z, size);
				console.warn('unit:model:setSize2D:before:scale', x, z, this.scene.scale);

				this.scene.scale.x = this.originalScale.x * (this.originalSize.x / x);
				this.scene.scale.z = this.originalScale.z * (this.originalSize.z / z);

				console.warn('unit:model:setSize2D:after', x, z, this.getSize());
				console.warn('unit:model:setSize2D:after:scale', x, z, this.getSize());
			}

			getCenter() {
				this.aabb.setFromObject(this.scene);
				return this.aabb.getCenter(this.center);
			}

			private scaleSceneToFitWithinUnits(units: number) {
				const size = this.getSize();
				const scale = units / Math.max(...size.toArray());
				console.log('original size', this.getSize());
				this.scene.scale.setScalar(scale);
				console.log('scale', this.scene.scale);
				this.originalSize.copy(this.getSize());
				this.originalScale.copy(this.scene.scale);
				console.warn('originalScale', this.originalScale);
				console.warn('originalSize', this.originalSize);
			}
		}
	}
}
