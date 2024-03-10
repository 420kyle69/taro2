namespace Renderer {
	export namespace Three {
		export class FloatingText {
			node: Label;

			constructor(x: number, y: number, z: number, text: string, color: string, offsetX = 0, offsetY = 0) {
				this.node = new Label(text, color, true);
				this.node.position.set(x, y, z);
				this.node.setOffset(new THREE.Vector2(offsetX, offsetY));

				new TWEEN.Tween({ offsetInPixels: this.node.offset.y, opacity: 1 })
					.to({ offsetInPixels: this.node.offset.y + 40, opacity: 0.5 }, 2500)
					.onUpdate(({ offsetInPixels, opacity }) => {
						this.node.setOffset(new THREE.Vector2(0, offsetInPixels));
						this.node.setOpacity(opacity);
					})
					.onComplete(() => this.node.destroy())
					.start();
			}
		}
	}
}
