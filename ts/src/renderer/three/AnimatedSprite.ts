namespace Renderer {
	export namespace Three {
		export class AnimatedSprite extends Sprite {
			private playSpriteIndices: number[] = [];
			private runningTileArrayIndex = 0;
			private maxDisplayTime = 0;
			private elapsedTime = 0;
			private tileH = 1;
			private tileV = 1;
			private currentTile = 0;
			private repeat = 0;
			private cycle = 0;

			constructor(spriteSheet: Tileset) {
				super(spriteSheet.texture);

				this.tileH = spriteSheet.width / spriteSheet.tileWidth;
				this.tileV = spriteSheet.height / spriteSheet.tileHeight;

				spriteSheet.texture.repeat.set(1 / this.tileH, 1 / this.tileV);
				const offsetX = (this.currentTile % this.tileH) / this.tileH;
				const offsetY = 1 - 1 / this.tileV - (Math.floor(this.currentTile / this.tileH) % this.tileV) / this.tileV;
				spriteSheet.texture.offset.set(offsetX, offsetY);
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
				super.update(dt);

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
