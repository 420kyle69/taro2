namespace Renderer {
	export namespace Three {
		export type AnimationConfig = {
			key: string;
			textureSheetKey: string;
			frames: number[];
			fps: number;
			repeat: number;
		};

		export class AnimationManager {
			private static _instance: AnimationManager;

			animations = new Map<string, Animation>();

			private materials = new Map<string, THREE.Material>();

			static instance() {
				return this._instance || (this._instance = new this());
			}

			create(config: AnimationConfig) {
				const material = this.createOrGetMaterial(config.textureSheetKey);
				const animation = new Animation(config.frames, config.fps, config.repeat, material);
				this.animations.set(config.key, animation);
			}

			private createOrGetMaterial(key: string) {
				if (this.materials.has(key)) {
					return this.materials.get(key);
				}

				const material = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.3 });

				const spriteSheet = TextureRepository.instance().getTextureSheet(key);
				if (spriteSheet) {
					material.map = spriteSheet.texture;
				}

				this.materials.set(key, material);

				return material;
			}
		}

		export class Animation {
			constructor(
				public frames: number[],
				public fps: number,
				public repeat: number,
				public material: THREE.Material
			) {}
		}
	}
}
