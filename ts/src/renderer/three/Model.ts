namespace Renderer {
	export namespace Three {
		export class Model extends Node {
			size = new THREE.Vector3();
			originalSize = new THREE.Vector3();
			originalScale = new THREE.Vector3();

			private scene: THREE.Group;
			private aabb = new THREE.Box3();
			private center = new THREE.Vector3();

			private mixer: THREE.AnimationMixer;
			private clips: THREE.AnimationClip[];

			constructor(name: string) {
				super();

				const model = gAssetManager.getModel(name);
				this.scene = SkeletonUtils.clone(model.scene);
				this.add(this.scene);

				this.originalSize.copy(this.getSize());
				this.originalScale.copy(this.scene.scale);

				const mixer = new THREE.AnimationMixer(this.scene);
				this.mixer = mixer;

				this.clips = model.animations;

				this.aabb.setFromObject(this.scene);
			}

			getSize() {
				this.aabb.setFromObject(this.scene, true);
				return this.aabb.getSize(this.size);
			}

			setSize(x: number, y: number, z: number) {
				this.scene.scale.x = this.originalScale.x * (x / this.originalSize.x);
				this.scene.scale.y = this.originalScale.y * (y / this.originalSize.y);
				this.scene.scale.z = this.originalScale.z * (z / this.originalSize.z);
			}

			setOpacity(opacity: number, time = undefined) {
				this.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						// Convert to basic material to avoid lighting
						const material = new THREE.MeshBasicMaterial();
						THREE.MeshBasicMaterial.prototype.copy.call(material, child.material);
						child.material = material;
						child.material.transparent = true;
						child.material.opacity = opacity;
						if (time !== undefined) {
							setTimeout(() => {
								child.material.opacity = 1;
							}, time);
						}
					}
				});
			}

			setColor(color: number, time = 0) {
				this.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						// Convert to basic material to avoid lighting
						const material = new THREE.MeshBasicMaterial();
						THREE.MeshBasicMaterial.prototype.copy.call(material, child.material);
						child.material = material;
						const originalColor = child.material.color.getHex();
						child.material.color.setHex(color);
						if (time > 0) {
							setTimeout(() => {
								child.material.color.setHex(originalColor);
							}, time);
						}
					}
				});
			}

			getCenter() {
				this.aabb.setFromObject(this.scene);
				return this.aabb.getCenter(this.center);
			}

			update(dt) {
				this.mixer.update(dt);
			}

			play(name: string, loopCount = 0) {
				const clip = THREE.AnimationClip.findByName(this.clips, name);
				if (!clip) return;

				this.mixer.stopAllAction();

				const action = this.mixer.clipAction(clip);
				action.setLoop(THREE.LoopRepeat, loopCount === 0 ? Infinity : loopCount);
				action.clampWhenFinished = true;
				action.play();
			}
		}
	}
}
