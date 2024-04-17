namespace Renderer {
	export namespace Three {
		export class MarkerLines extends Node {
			lines: THREE.LineSegments<THREE.EdgesGeometry<THREE.BoxGeometry>, THREE.LineBasicMaterial>;
			sideLength: number;
			scaleSidesX: number;
			scaleSidesY: number;
			scaleSidesZ: number;
			constructor() {
				super();
				//we should have currentLayerIndex property inside VoxelEditor.ts
				const currentLayerIndex = 0;
				this.lines = new THREE.LineSegments(
					new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 0.5 + 1 * currentLayerIndex, 1)),
					new THREE.LineBasicMaterial({ color: 0x000000 })
				);
				this.scaleSides(1, 1);
				this.add(this.lines);
				this.visible = false;

				/*if (taro.game.data.defaultData.dontResize || palette) {
                    this.sideLength = map.tileWidth;
                } else {
                    this.sideLength = Constants.TILE_SIZE;
                }*/
			}

			scaleSides(x: number, y: number) {
				const lines = this.lines;
				//we should have currentLayerIndex property inside VoxelEditor.ts
				const currentLayerIndex = 0;

				this.scaleSidesX = x;
				this.scaleSidesY = y;

				lines.position.set(
					Utils.pixelToWorld(x * this.sideLength - this.sideLength),
					1.5,
					Utils.pixelToWorld(y * this.sideLength - this.sideLength)
				);
				lines.scale.set(Utils.pixelToWorld(x), 0.5 + 1 * currentLayerIndex, Utils.pixelToWorld(y));
			}
		}
	}
}
