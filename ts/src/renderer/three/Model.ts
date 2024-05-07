namespace Renderer {
	export namespace Three {
		export class Model extends Node {
			private scene: THREE.Group;
			private aabb = new THREE.Box3();
			private size = new THREE.Vector3();
			private center = new THREE.Vector3();
			private originalSize = new THREE.Vector3();
			private originalScale = new THREE.Vector3();

			private mixer: THREE.AnimationMixer;
			private clips: THREE.AnimationClip[];

			constructor(name: string) {
				super();

				const model = gAssetManager.getModel(name);
				this.scene = SkeletonUtils.clone(model.scene);
				this.add(this.scene);

				this.scaleSceneToFitWithinUnits(1);

				const mixer = new THREE.AnimationMixer(this.scene);
				this.mixer = mixer;

				this.clips = model.animations;
			}

			getSize() {
				this.aabb.setFromObject(this.scene);
				return this.aabb.getSize(this.size);
			}

			setSize2D(x: number, z: number) {
				this.scene.scale.x = this.originalScale.x * (x / this.originalSize.x);
				this.scene.scale.z = this.originalScale.z * (z / this.originalSize.z);
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

			private scaleSceneToFitWithinUnits(units: number) {
				const size = this.getSize();
				const scale = units / Math.max(...size.toArray());
				this.scene.scale.setScalar(scale);
				this.originalSize.copy(this.getSize());
				this.originalScale.copy(this.scene.scale);
			}
		}
	}
}
