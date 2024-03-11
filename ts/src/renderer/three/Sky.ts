namespace Renderer {
	export namespace Three {
		export class Sky extends Node {
			constructor() {
				super();

				const geo = new THREE.BoxGeometry(10000, 10000, 10000);
				const material = this.createMaterialArray();
				this.add(new THREE.Mesh(geo, material));
			}

			private createMaterialArray() {
				const textureRepository = TextureRepository.instance();
				const left = textureRepository.get('left');
				const right = textureRepository.get('right');
				const top = textureRepository.get('top');
				const bottom = textureRepository.get('bottom');
				const front = textureRepository.get('front');
				const back = textureRepository.get('back');

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
