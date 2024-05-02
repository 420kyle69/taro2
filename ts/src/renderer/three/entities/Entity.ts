namespace Renderer {
	export namespace Three {
		export class Entity extends Node {
			private layer = 3;
			private zOffset = 0;

			constructor(public taroEntity: TaroEntityPhysics) {
				super();

				taroEntity.on('show', () => (this.visible = true));
				taroEntity.on('hide', () => (this.visible = false));
				taroEntity.on('scale', (data: { x: number; y: number }) => this.scale.set(data.x, 1, data.y));
				taroEntity.on('layer', (layer) => this.setLayer(layer));
				taroEntity.on('z-offset', (offset) => this.setZOffset(Utils.pixelToWorld(offset)));
				taroEntity.on('destroy', () => this.destroy());
			}

			onDestroy(): void {
				for (const [key, listener] of Object.entries(this.taroEntity.eventList())) {
					this.taroEntity.off(key, listener);
				}
			}

			private setLayer(layer: number) {
				this.layer = layer;
				this.position.y = Utils.getLayerZOffset(this.layer) + this.zOffset;
			}

			private setZOffset(offset: number) {
				this.zOffset = offset;
				this.position.y = Utils.getLayerZOffset(this.layer) + this.zOffset;
			}
		}
	}
}
