namespace Renderer {
	export namespace Three {
		export class Skybox extends Node {
			constructor() {
				super();

				const geo = new THREE.BoxGeometry(10000, 10000, 10000);
				const material = this.createMaterialArray();
				this.add(new THREE.Mesh(geo, material));
			}

			private createMaterialArray() {
				const left = gAssetManager.getTextureWithoutPlaceholder('left');
				const right = gAssetManager.getTextureWithoutPlaceholder('right');
				const top = gAssetManager.getTextureWithoutPlaceholder('top');
				const bottom = gAssetManager.getTextureWithoutPlaceholder('bottom');
				const front = gAssetManager.getTextureWithoutPlaceholder('front');
				const back = gAssetManager.getTextureWithoutPlaceholder('back');

				if (!(left && right && top && bottom && front && back)) {
					return [];
				}

				return [
					// The order is important (right handed coordinate system)
					new THREE.MeshBasicMaterial({ map: right, side: THREE.BackSide }),
					new THREE.MeshBasicMaterial({ map: left, side: THREE.BackSide }),
					new THREE.MeshBasicMaterial({ map: top, side: THREE.BackSide }),
					new THREE.MeshBasicMaterial({ map: bottom, side: THREE.BackSide }),
					new THREE.MeshBasicMaterial({ map: front, side: THREE.BackSide }),
					new THREE.MeshBasicMaterial({ map: back, side: THREE.BackSide }),
				];
			}
		}
	}
}
