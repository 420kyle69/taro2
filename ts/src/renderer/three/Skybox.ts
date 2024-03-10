namespace Renderer {
	export namespace Three {
		export class Skybox {
			scene: THREE.Object3D;

			constructor() {
				const geo = new THREE.BoxGeometry(10000, 10000, 10000);
				const material = this.createMaterialArray();
				const skybox = new THREE.Mesh(geo, material);
				this.scene = skybox;
			}

			private createMaterialArray() {
				const textureManager = TextureManager.instance();

				const left = textureManager.textureMap.get('left');
				const right = textureManager.textureMap.get('right');
				const top = textureManager.textureMap.get('top');
				const bottom = textureManager.textureMap.get('bottom');
				const front = textureManager.textureMap.get('front');
				const back = textureManager.textureMap.get('back');

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
