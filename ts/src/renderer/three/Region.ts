namespace Renderer {
	export namespace Three {
		export class Region extends Node {
			gameObject: THREE.Object3D;
			devModeOnly: boolean;
			label = new Label('', 'white', false, true);
			private labelVisible;
			private guiScale = 1;

			constructor(
				public taroId: string,
				public ownerId: string,
				private taroEntity?: TaroEntityPhysics
			) {
				super();
				const label = this.label;
				label.visible = false;
				this.labelVisible = label.visible;
				label.update(taroEntity._stats.id);
				this.add(label);

				const renderer = Three.instance();
				this.setGuiScale(1 / renderer.camera.zoom);

				const stats = taroEntity._stats.default;
				const color = stats.inside ? Number(`0x${stats.inside.substring(1)}`) : 0x000000;

				const x = Utils.pixelToWorld(stats.x);
				const y = Utils.pixelToWorld(stats.y);
				const width = Utils.pixelToWorld(stats.width);
				const height = Utils.pixelToWorld(stats.height);

				label.position.set(x + Utils.pixelToWorld(label.size.x) / 2, 3, y + Utils.pixelToWorld(label.size.y / 2));
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
					this.gameObject.visible = false;
				}

				const gameObject = this.gameObject;

				taroEntity.on(
					'transform',
					() => {
						gameObject.position.x = Utils.pixelToWorld(stats.x) + width / 2;
						gameObject.position.z = Utils.pixelToWorld(stats.y) + height / 2;
						label.position.set(x + Utils.pixelToWorld(label.size.x) / 2, 3, y + Utils.pixelToWorld(label.size.y / 2));
					},
					this
				);

				taroEntity.on('update-label', (data) => {
					label.visible = true;
					this.labelVisible = true;
					label.update(data.text, data.color, data.bold);
				});
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

			setGuiScale(scale: number) {
				this.guiScale = scale;
				this.label.setScale(scale);
			}
		}
	}
}
