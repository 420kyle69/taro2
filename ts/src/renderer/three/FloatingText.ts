namespace Renderer {
	export namespace Three {
		export class FloatingText extends Node {
			constructor(x: number, y: number, z: number, text: string, color: string, offsetX = 0, offsetY = 0) {
				super();

				const label = new Label(text, color, true);
				label.position.set(x, y, z);
				label.setOffset(new THREE.Vector2(offsetX, offsetY));
				this.add(label);

				new TWEEN.Tween({ offsetInPixels: label.offset.y, opacity: 1 })
					.to({ offsetInPixels: label.offset.y + 40, opacity: 0.5 }, 2500)
					.onUpdate(({ offsetInPixels, opacity }) => {
						label.setOffset(new THREE.Vector2(0, offsetInPixels));
						label.setOpacity(opacity);
					})
					.onComplete(() => this.destroy())
					.start();
			}
		}
	}
}
