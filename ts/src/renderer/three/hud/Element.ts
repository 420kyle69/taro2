namespace Renderer {
	export namespace Three {
		export abstract class Element extends THREE.Object3D {
			unscaledWidth: number;
			unscaledHeight: number;
			padding: THREE.Vector2;
			margin: THREE.Vector2;

			protected sprite: THREE.Sprite;
			protected canvas = document.createElement('canvas');
			protected ctx = this.canvas.getContext('2d');

			constructor(x: number, y: number, z: number, width = 0, height = 0) {
				super();

				this.position.set(x, y, z);
				this.unscaledWidth = width;
				this.unscaledHeight = height;

				const texture = new THREE.Texture();
				texture.magFilter = TextureRepository.instance().filter;
				texture.generateMipmaps = false;
				texture.needsUpdate = true;
				texture.colorSpace = THREE.SRGBColorSpace;
				const material = new THREE.SpriteMaterial({
					map: texture,
					transparent: true,
					depthWrite: false,
					depthTest: true,
				});
				this.sprite = new THREE.Sprite(material);
				this.sprite.renderOrder = 999;

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
				this.sprite.scale.x = Utils.pixelToWorld(width) * this.scale.x;
			}

			set height(height: number) {
				this.sprite.scale.y = Utils.pixelToWorld(height) * this.scale.y;
			}

			setCenter(x: number, y: number) {
				this.sprite.center.set(x, 1.0 - y);
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

			setTextureImage(image: ImageData) {
				this.sprite.material.map.image = image;
				this.sprite.material.map.needsUpdate = true;
			}

			protected createUpscaledTextureImage(
				draw: (upscaledWidth: number, upscaledHeight: number, upscaleFactor: number) => void,
				upscaleFactor = 8
			) {
				const w = this.width * upscaleFactor;
				const h = this.height * upscaleFactor;

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
