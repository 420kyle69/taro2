namespace Renderer {
	export namespace Three {
		export class Model extends Node {
			constructor(name: string) {
				super();

				const model = gAssetManager.getModel(name);
				if (model) {
					this.add(model.scene.clone());
				}
			}
		}
	}
}
