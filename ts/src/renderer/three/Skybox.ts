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
				const textureMgr = TextureManager.instance();

				const left = textureMgr.get('left');
				const right = textureMgr.get('right');
				const top = textureMgr.get('top');
				const bottom = textureMgr.get('bottom');
				const front = textureMgr.get('front');
				const back = textureMgr.get('back');

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
