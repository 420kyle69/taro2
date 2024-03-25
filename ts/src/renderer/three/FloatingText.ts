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

			static create(config: FloatingTextConfig, zOffset = 0) {
				return new FloatingText(
					Utils.pixelToWorld(config.x) - 0.5,
					// Will only look good top down orthographic currently; Need to get
					// correct height from engine when the engine uses 3D coords.
					zOffset,
					Utils.pixelToWorld(config.y) - 0.5,
					config.text,
					config.color
				);
			}
		}

		export type FloatingTextConfig = { text: string; x: number; y: number; color: string };
	}
}
