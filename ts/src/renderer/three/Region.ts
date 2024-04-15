namespace Renderer {
	export namespace Three {
		export class Region extends Node {
			gameObject: THREE.Object3D;
			mesh: THREE.Mesh;
			stats: { x: number; y: number; width: number; height: number; inside?: string; alpha?: number };
			devModeOnly: boolean;
			label = new Label({ renderOnTop: true });

			constructor(
				public taroId: string,
				public ownerId: string,
				public taroEntity?: TaroEntityPhysics
			) {
				super();
				const stats = (this.stats = taroEntity._stats.default);
				const label = this.label;
				label.visible = false;
				label.update({ text: taroEntity._stats.id });
				this.add(label);
				this.name = this.taroEntity._stats.id;
				const renderer = Three.instance();
				this.setGuiScale(1 / renderer.camera.zoom);

				const color = stats.inside ? Number(`0x${stats.inside.substring(1)}`) : 0x000000;

				const x = Utils.pixelToWorld(stats.x);
				const y = Utils.pixelToWorld(stats.y);
				const width = Utils.pixelToWorld(stats.width);
				const height = Utils.pixelToWorld(stats.height);

				label.position.set(x + Utils.pixelToWorld(label.width) / 2, 3, y + Utils.pixelToWorld(label.height / 2));
				const geometry = new THREE.BoxGeometry(1, 3, 1);
				let gameObject = this.gameObject;

				const material = new THREE.MeshBasicMaterial({
					color: color,
					opacity: stats.alpha,
					transparent: true,
				});
				const mesh = (this.mesh = new THREE.Mesh(geometry, material));
				mesh.position.set(x + width / 2, 1.5, y + height / 2);
				mesh.scale.set(width, 1, height);
				this.add(mesh);
				if (stats.inside) {
					this.devModeOnly = false;
					mesh.renderOrder = 997;
					gameObject = this.gameObject = mesh;
				} else {
					this.devModeOnly = true;
					mesh.visible = false;
					const edges = new THREE.EdgesGeometry(geometry);
					const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x11fa05 }));
					this.add(line);
					gameObject = this.gameObject = line;
					gameObject.position.set(x + width / 2, 1.5, y + height / 2);
					gameObject.scale.set(width, 1, height);
				}

				if (taro.developerMode.activeTab === 'map') {
					label.visible = true;
				}
				if ((taro.developerMode.activeTab === 'map' && this.devModeOnly) || !this.devModeOnly) {
					gameObject.visible = true;
				} else {
					gameObject.visible = false;
				}

				taroEntity.on(
					'transform',
					() => {
						mesh.position.set(
							Utils.pixelToWorld(stats.x) + Utils.pixelToWorld(stats.width) / 2,
							1.5,
							Utils.pixelToWorld(stats.y) + Utils.pixelToWorld(stats.height) / 2
						);
						mesh.scale.set(Utils.pixelToWorld(stats.width), 1, Utils.pixelToWorld(stats.height));
						if (this.devModeOnly) {
							gameObject.position.set(
								Utils.pixelToWorld(stats.x) + Utils.pixelToWorld(stats.width) / 2,
								1.5,
								Utils.pixelToWorld(stats.y) + Utils.pixelToWorld(stats.height) / 2
							);
							gameObject.scale.set(Utils.pixelToWorld(stats.width), 1, Utils.pixelToWorld(stats.height));
						}
						label.position.set(x + Utils.pixelToWorld(label.width / 2), 3, y + Utils.pixelToWorld(label.height / 2));
					},
					this
				);
			}

			show() {
				this.gameObject.visible = true;
			}

			hide() {
				if (this.devModeOnly) {
					this.gameObject.visible = false;
				}
			}

			updateLabel(name: string) {
				const label = this.label;
				label.update({ text: name });
			}

			setGuiScale(scale: number) {
				this.label.setScale(scale);
			}
		}
	}
}
