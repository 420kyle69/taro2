namespace Renderer {
	export namespace Three {
		export enum RegionMode {
			Normal,
			Development,
		}
		export class Region extends Node {
			gameObject: THREE.Object3D;
			mesh: THREE.Mesh & { region?: Region };
			stats: {
				x: number;
				y: number;
				z?: number;
				width: number;
				height: number;
				depth?: number;
				inside?: string;
				alpha?: number;
			};
			devModeOnly: boolean;
			hud = new THREE.Group();
			label = new Label({ renderOnTop: true });

			constructor(
				public taroId: string,
				public ownerId: string,
				public taroEntity?: TaroEntityPhysics
			) {
				super();

				this.add(this.hud);

				const label = this.label;
				label.visible = false;
				label.update({ text: taroEntity._stats.id });
				label.position.set(Utils.pixelToWorld(label.width) * 0.5, 0, Utils.pixelToWorld(label.height) * 0.5);
				this.hud.add(label);

				const stats = (this.stats = taroEntity._stats.default);
				this.name = this.taroEntity._stats.id;

				const color = stats.inside ? Number(`0x${stats.inside.substring(1)}`) : 0x000000;

				const x = Utils.pixelToWorld(stats.x);
				const y = Utils.pixelToWorld(stats.y);
				const z = Utils.pixelToWorld(stats.z) || 0;
				const width = Utils.pixelToWorld(stats.width);
				const height = Utils.pixelToWorld(stats.height);
				const depth = Utils.pixelToWorld(stats.depth) || 3;

				this.hud.position.set(-0.5, 0.5, -0.5);
				this.hud.scale.set(1 / width, 1 / depth, 1 / height);
				const geometry = new THREE.BoxGeometry(1, 1, 1);
				let gameObject = this.gameObject;

				const material = new THREE.MeshBasicMaterial({
					color: color,
					opacity: stats.alpha,
					transparent: true,
				});

				const mesh = (this.mesh = new THREE.Mesh(geometry, material)) as THREE.Mesh & { region?: Region };
				mesh.region = this;
				this.position.set(x + width / 2, z + depth / 2, y + height / 2);
				this.scale.set(width, depth, height);
				this.add(mesh);

				if (stats.inside) {
					this.devModeOnly = false;
					gameObject = this.gameObject = mesh;
				} else {
					this.devModeOnly = true;
					mesh.visible = false;
					const edges = new THREE.EdgesGeometry(geometry);
					const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x11fa05 }));
					this.add(line);
					gameObject = this.gameObject = line;
				}

				if (taro.developerMode.activeTab === 'map') {
					this.setDevelopmentMode();
				} else {
					this.setNormalMode();
				}

				taroEntity.on(
					'transform',
					() => {
						const x = Utils.pixelToWorld(stats.x);
						const y = Utils.pixelToWorld(stats.y);
						const z = Utils.pixelToWorld(stats.z) || 0;
						const width = Utils.pixelToWorld(stats.width);
						const height = Utils.pixelToWorld(stats.height);
						const depth = Utils.pixelToWorld(stats.depth) || 3;

						this.position.set(x + width / 2, z + depth / 2, y + height / 2);
						this.scale.set(width, depth, height);
						this.hud.scale.set(1 / width, 1 / depth, 1 / height);
					},
					this
				);
			}

			updateLabel(name: string) {
				const label = this.label;
				label.update({ text: name });
			}

			setMode(mode: RegionMode) {
				switch (mode) {
					case RegionMode.Normal: {
						this.setNormalMode();
						break;
					}
					case RegionMode.Development: {
						this.setDevelopmentMode();
						break;
					}
				}
			}

			private setNormalMode() {
				this.gameObject.visible = !this.devModeOnly;
				this.label.visible = false;
			}

			private setDevelopmentMode() {
				this.gameObject.visible = true;
				this.label.visible = true;
			}
		}
	}
}
