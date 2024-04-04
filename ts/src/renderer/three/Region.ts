namespace Renderer {
	export namespace Three {
		export class Region extends Node {
			devModeOnly: boolean;
			gameObject: THREE.Object3D;
			constructor(
				public taroId: string,
				public ownerId: string,
				private taroEntity?: TaroEntityPhysics
			) {
				super();
				//const textCanvas = document.createElement('canvas');

				//const ctx = textCanvas.getContext('2d');
				const stats = taroEntity._stats.default;
				const color = stats.inside ? Number(`0x${stats.inside.substring(1)}`) : 0x000000;

				const x = Utils.pixelToWorld(stats.x);
				const y = Utils.pixelToWorld(stats.y);
				const width = Utils.pixelToWorld(stats.width);
				const height = Utils.pixelToWorld(stats.height);

				const geometry = new THREE.BoxGeometry(width, 3, height);

				if (stats.inside) {
					this.devModeOnly = false;
					const material = new THREE.MeshBasicMaterial({
						color: color,
						opacity: stats.alpha,
						transparent: true,
					});
					const mesh = new THREE.Mesh(geometry, material);
					mesh.renderOrder = 997;
					mesh.position.set(x + width / 2, 1.5, y + height / 2);
					this.add(mesh);
					this.gameObject = mesh;
				} else {
					this.devModeOnly = true;
					const edges = new THREE.EdgesGeometry(geometry);
					const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x11fa05 }));
					line.position.set(x + width / 2, 1.5, y + height / 2);
					this.add(line);
					this.gameObject = line;
				}

				const gameObject = this.gameObject;

				taroEntity.on(
					'transform',
					() => {
						gameObject.position.x = Utils.pixelToWorld(stats.x) + width / 2;
						gameObject.position.z = Utils.pixelToWorld(stats.y) + height / 2;
					},
					this
				);
			}

			show() {
				this.gameObject.visible = true;

				/*const label = this.label;
				const rt = this.rtLabel;
		
				label && (label.visible = true);
				rt && (rt.visible = true);*/
			}

			hide() {
				if (this.devModeOnly) {
					this.gameObject.visible = false;
				}
				/*const label = this.label;
				const rt = this.rtLabel;
		
				label && (label.visible = false);
				rt && (rt.visible = false);*/
			}

			transform() {}
		}
	}
}
