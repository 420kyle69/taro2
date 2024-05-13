namespace Renderer {
	export namespace Three {
		// TODO: Now some HUD nodes inherit from Node and others from Element.
		// Streamline this to use only one base class.
		export abstract class Element extends THREE.Object3D {
			unscaledWidth: number;
			unscaledHeight: number;
			margin = 0;

			protected sprite: THREE.Sprite;
			protected canvas = document.createElement('canvas');
			protected ctx = this.canvas.getContext('2d', { willReadFrequently: true });

			private center = new THREE.Vector2(0.5, 0.5);
			private timeoutHandle: NodeJS.Timeout | null = null;

			constructor(x: number, y: number, z: number, width = 0, height = 0) {
				super();

				this.position.set(x, y, z);
				this.unscaledWidth = width;
				this.unscaledHeight = height;

				const texture = new THREE.Texture();
				texture.magFilter = gAssetManager.filter;
				texture.generateMipmaps = false;
				texture.colorSpace = THREE.SRGBColorSpace;
				const material = new THREE.SpriteMaterial({
					map: texture,
					transparent: true,
					depthWrite: false,
					depthTest: true,
				});
				this.sprite = new THREE.Sprite(material);
				this.sprite.renderOrder = 499;

				this.sprite.scale.x = Utils.pixelToWorld(width) * this.scale.x;
				this.sprite.scale.y = Utils.pixelToWorld(height) * this.scale.y;

				this.add(this.sprite);
			}

			destroy() {
				this.removeFromParent();

				const cleanMaterial = (material) => {
					material.dispose();
					for (const key of Object.keys(material)) {
						const value = material[key];
						if (value && typeof value.dispose === 'function') {
							value.dispose();
						}
					}
				};

				this.traverse((object) => {
					if (!(object as THREE.Mesh).isMesh && !(object as THREE.Sprite).isSprite) return;

					const obj = object as THREE.Mesh | THREE.Sprite;

					if ((obj as THREE.Mesh).isMesh) {
						obj.geometry.dispose();
					}

					const material = obj.material as THREE.Material;

					if (material.isMaterial) {
						cleanMaterial(obj.material);
					} else {
						for (const material of obj.material as THREE.Material[]) {
							cleanMaterial(material);
						}
					}
				});

				this.onDestroy();
			}

			onDestroy() {}

			get width() {
				return this.unscaledWidth * this.scale.x;
			}

			get height() {
				return this.unscaledHeight * this.scale.y;
			}

			set width(width: number) {
				this.unscaledWidth = width;
				this.sprite.scale.x = Utils.pixelToWorld(width) * this.scale.x;
			}

			set height(height: number) {
				this.unscaledHeight = height;
				this.sprite.scale.y = Utils.pixelToWorld(height) * this.scale.y;
			}

			setCenter(x: number, y: number) {
				this.center.set(x, y);
				this.sprite.center.set(x, 1 - y);
			}

			setCenterX(x: number) {
				this.center.x = x;
				this.sprite.center.x = x;
			}

			setCenterY(y: number) {
				this.center.y = y;
				this.sprite.center.y = 1 - y;
			}

			getCenter() {
				return { x: this.sprite.center.x, y: 1 - this.sprite.center.y };
			}

			setOffset(x: number, y: number) {
				this.sprite.center.set(this.center.x + x / this.width, 1 - (this.center.y + y / this.height));
			}

			setOffsetX(x: number) {
				this.sprite.center.x = this.center.x - x / this.width;
			}

			setOffsetY(y: number) {
				this.sprite.center.y = 1 - (this.center.y + y / this.height);
			}

			getOffset() {
				return {
					x: this.sprite.center.x * this.width - this.center.x,
					y: (1 - this.sprite.center.y) * this.height - this.center.y,
				};
			}

			getOffsetX() {
				return this.sprite.center.x * this.width - this.center.x * this.width;
			}

			getOffsetY() {
				return (1 - this.sprite.center.y) * this.height - this.center.y * this.height;
			}

			setScale(scale: number) {
				this.scale.setScalar(scale);
			}

			setRotation(rad: number) {
				this.sprite.material.rotation = rad;
			}

			setOpacity(opacity: number) {
				this.sprite.material.opacity = opacity;
			}

			showAndHideAfterDelay(delay: number) {
				this.visible = true;

				if (this.timeoutHandle) {
					clearTimeout(this.timeoutHandle);
					this.timeoutHandle = null;
				}

				if (delay > 0) {
					this.timeoutHandle = setTimeout(() => {
						this.visible = false;
					}, delay);
				}
			}

			setTextureImage(image: ImageData) {
				// Must create a new texture if new dimensions are different in 3js.
				if (this.sprite.material.map.image) {
					const w = this.sprite.material.map.image.width;
					const h = this.sprite.material.map.image.height;

					if (w !== image.width || h !== image.height) {
						const texture = new THREE.Texture();
						texture.magFilter = gAssetManager.filter;
						texture.generateMipmaps = false;
						texture.colorSpace = THREE.SRGBColorSpace;

						this.sprite.material.map.dispose();
						this.sprite.material.map = texture;
					}
				}

				this.sprite.material.map.image = image;
				this.sprite.material.map.needsUpdate = true;
			}

			renderOnTopOfEverything() {
				this.sprite.material.depthTest = false;
				this.sprite.material.depthWrite = false;
				this.sprite.renderOrder = 999;
			}

			protected createUpscaledTextureImage(
				draw: (upscaledWidth: number, upscaledHeight: number, upscaleFactor: number) => void,
				upscaleFactor = 2
			) {
				let w = this.width * upscaleFactor;
				let h = this.height * upscaleFactor;

				if (w < 1 || h < 1) {
					if (w < 1) {
						w = 1;
					}

					if (h < 1) {
						h = 1;
					}
				}

				this.canvas.width = w;
				this.canvas.height = h;

				this.ctx.clearRect(0, 0, w, h);

				// Bind in case someone passes a normal function
				draw.bind(this)(w, h, upscaleFactor);

				return this.ctx.getImageData(0, 0, w, h);
			}
		}
	}
}
