namespace Renderer {
	export namespace Three {
		export class AnimatedSprite extends Sprite {
			protected static animations: Map<string, { frames: number[]; fps: number; repeat: number }> = new Map();

			private playSpriteIndices: number[] = [];
			private runningTileArrayIndex = 0;
			private maxDisplayTime = 0;
			private elapsedTime = 0;
			private tileH = 1;
			private tileV = 1;
			private currentTile = 0;
			private repeat = 0;
			private cycle = 0;

			constructor(tex: THREE.Texture) {
				super(tex);

				if (tex.userData.numColumns && tex.userData.numRows) {
					this.tileH = tex.userData.numColumns;
					this.tileV = tex.userData.numRows;
				}

				tex.repeat.set(1 / this.tileH, 1 / this.tileV);
				const offsetX = (this.currentTile % this.tileH) / this.tileH;
				const offsetY = 1 - 1 / this.tileV - (Math.floor(this.currentTile / this.tileH) % this.tileV) / this.tileV;
				tex.offset.set(offsetX, offsetY);
			}

			static createAnimations(entity: EntityData) {
				const cellSheet = entity.cellSheet;
				if (!cellSheet) return;
				const key = cellSheet.url;
				const tex = TextureRepository.instance().get(key);
				tex.userData.numColumns = cellSheet.columnCount || 1;
				tex.userData.numRows = cellSheet.rowCount || 1;
				tex.userData.key = key;

				// Add animations
				for (let animationsKey in entity.animations) {
					const animation = entity.animations[animationsKey];
					const frames = animation.frames;
					const animationFrames: number[] = [];

					// Correction for 0-based indexing
					for (let i = 0; i < frames.length; i++) {
						animationFrames.push(+frames[i] - 1);
					}

					// Avoid crash by giving it frame 0 if no frame data provided
					if (animationFrames.length === 0) {
						animationFrames.push(0);
					}

					if (this.animations.has(`${key}/${animationsKey}/${entity.id}`)) {
						this.animations.delete(`${key}/${animationsKey}/${entity.id}`);
					}

					this.animations.set(`${key}/${animationsKey}/${entity.id}`, {
						frames: animationFrames,
						fps: +animation.framesPerSecond || 15,
						repeat: +animation.loopCount - 1, // correction for loop/repeat values
					});
				}
			}

			loop(playSpriteIndices: number[], fps: number, repeat = 0) {
				this.playSpriteIndices = playSpriteIndices;
				this.runningTileArrayIndex = 0;
				this.currentTile = playSpriteIndices[this.runningTileArrayIndex];
				this.maxDisplayTime = 1 / fps;
				this.repeat = repeat;
				this.cycle = 0;
				this.elapsedTime = 0;
				const offsetX = (this.currentTile % this.tileH) / this.tileH;
				const offsetY = 1 - 1 / this.tileV - (Math.floor(this.currentTile / this.tileH) % this.tileV) / this.tileV;
				this.tex.offset.set(offsetX, offsetY);
			}

			update(dt: number) {
				this.elapsedTime += dt;

				if (this.repeat !== -1 && this.cycle >= this.repeat + 1) {
					return;
				}

				if (this.maxDisplayTime > 0 && this.elapsedTime >= this.maxDisplayTime) {
					this.elapsedTime = 0;
					this.runningTileArrayIndex = (this.runningTileArrayIndex + 1) % this.playSpriteIndices.length;
					this.currentTile = this.playSpriteIndices[this.runningTileArrayIndex];

					if (this.runningTileArrayIndex === 0) {
						this.cycle += 1;
						if (this.cycle === this.repeat + 1) return;
					}

					const offsetX = (this.currentTile % this.tileH) / this.tileH;
					const offsetY = 1 - 1 / this.tileV - (Math.floor(this.currentTile / this.tileH) % this.tileV) / this.tileV;
					this.tex.offset.set(offsetX, offsetY);
				}
			}

			setTexture(tex: THREE.Texture) {
				super.setTexture(tex);

				this.tex = tex;

				if (tex.userData.numColumns && tex.userData.numRows) {
					this.tileH = tex.userData.numColumns;
					this.tileV = tex.userData.numRows;
				}

				tex.repeat.set(1 / this.tileH, 1 / this.tileV);
				const offsetX = (this.currentTile % this.tileH) / this.tileH;
				const offsetY = 1 - 1 / this.tileV - (Math.floor(this.currentTile / this.tileH) % this.tileV) / this.tileV;
				tex.offset.set(offsetX, offsetY);
			}
		}
	}
}
