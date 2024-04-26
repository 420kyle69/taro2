namespace Renderer {
	export namespace Three {
		export abstract class Node extends THREE.Object3D {
			isNode = true;

			constructor() {
				super();
			}

			destroy() {
				this.removeFromParent();

				const cleanMaterial = (material) => {
					material.dispose();
					for (const key of Object.keys(material)) {
						const value = material[key];
						if (value && typeof value.dispose === 'function') {
							value.dispose();
						}
					}
				};

				this.traverse((object) => {
					if (!(object as THREE.Mesh).isMesh && !(object as THREE.Sprite).isSprite) return;

					const obj = object as THREE.Mesh | THREE.Sprite;

					if ((obj as THREE.Mesh).isMesh) {
						obj.geometry.dispose();
					}

					const material = obj.material as THREE.Material;

					if (material.isMaterial) {
						cleanMaterial(obj.material);
					} else {
						for (const material of obj.material as THREE.Material[]) {
							cleanMaterial(material);
						}
					}
				});

				for (const node of this.children) {
					if (node instanceof Node) node.onDestroy();
				}

				this.onDestroy();
			}

			onDestroy() {}
		}
	}
}
