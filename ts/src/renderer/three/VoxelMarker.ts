namespace Renderer {
	export namespace Three {
		export class VoxelMarker extends Node {
			lines: MarkerLines;
			preview: THREE.Group;
			meshes: Record<number, Record<number, THREE.Mesh>>;
			commandController: CommandController;
			active: boolean;
			extrudedKey: string;

			constructor(
				//private scene: Phaser.Scene,
				//private devModeScene: DevModeScene,
				//private map: Phaser.Tilemaps.Tilemap,
				//private palette: boolean,
				//w: number,
				commandController: CommandController
			) {
				super();

				this.active = true;
				this.commandController = commandController;
				this.lines = new MarkerLines();

				//if (!palette) {
				this.preview = new THREE.Group();
				this.meshes = {};
				//}
			}

			addMesh(x: number, y: number, z: number): THREE.Mesh {
				//const map = this.map;
				console.log(x, y, z);
				const data = taro.game.data;
				const tileset = data.map.tilesets[0];
				const key = `tiles/${tileset.name}`;
				const extrudedKey = (this.extrudedKey = `extruded-${key}`);

				let width = Constants.TILE_SIZE;
				let height = Constants.TILE_SIZE;
				/*if (taro.game.data.defaultData.dontResize) {
                    width = map.tileWidth;
                    height = map.tileHeight;
                }*/

				const geometry = new THREE.BoxGeometry(1, 1, 1);
				const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
				const mesh = new THREE.Mesh(geometry, material);
				mesh.position.set(x, z, y);
				this.preview.add(mesh);
				return mesh;
			}

			removeMeshes() {
				this.preview.clear();
			}

			changeMesh(tile: number, i: number, j: number): void {}

			changePreview(): void {}

			hideMeshes(): void {
				this.preview.visible = false;
				Object.values(this.meshes).forEach((v) => {
					Object.values(v).forEach((mesh) => {
						mesh.material[0].opacity = 0;
					});
				});
			}

			showPreview(): void {
				//this.preview.visible = true;
			}
		}
	}
}
