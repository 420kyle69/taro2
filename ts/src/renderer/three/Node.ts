namespace Renderer {
	export namespace Three {
		export abstract class Node extends THREE.Object3D {
			constructor() {
				super();
			}

			destroy() {
				for (const node of this.children) {
					if (node instanceof Node) node.destroy();
				}
				this.onDestroy();
				this.removeFromParent();
			}

			onDestroy() {}
		}
	}
}
