namespace Renderer {
	export namespace Three {
		export class Sprite extends Node {
			sprite: THREE.Mesh;
			billboard = false;
			scaleUnflipped = new THREE.Vector2(1, 1);
			childSprites: Sprite[] = []; // Children already used by node/3js. Probably should move to composition to avoid name clashes.
			parentedItemRenderHack = false;

			private layer = 3;
			private depth = 1;
			private flipX = 1;
			private flipY = 1;
			private zOffset = 0;
			private angleOffset = 0;

			constructor(protected tex: THREE.Texture) {
				super();

				const geometry = new THREE.PlaneGeometry(1, 1);
				geometry.rotateX(-Math.PI / 2);
				const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
				this.sprite = new THREE.Mesh(geometry, material);
				this.add(this.sprite);

				const renderer = Renderer.Three.instance();
				renderer.camera.onChange(() => {
					if (this.billboard) {
						this.faceCamera(renderer.camera);
						this.correctZOffsetBasedOnCameraAngle();
					}
				});
			}

			setBillboard(billboard: boolean, camera: Camera) {
				this.billboard = billboard;
				if (this.billboard) {
					this.faceCamera(camera);
					this.correctZOffsetBasedOnCameraAngle();
				}
			}

			setScale(sx: number, sy: number) {
				this.scaleUnflipped.set(sx, sy);
				this.sprite.scale.set(this.scaleUnflipped.x * this.flipX, 1, this.scaleUnflipped.y * this.flipY);
			}

			setRotationY(rad: number) {
				this.sprite.rotation.y = rad;
			}

			setLayer(layer: number) {
				this.layer = layer;
				this.calcRenderOrder();
			}

			setDepth(depth: number) {
				this.depth = depth;
				this.calcRenderOrder();
			}

			setZOffset(offset: number) {
				this.zOffset = offset;
				this.calcRenderOrder();
				this.correctZOffsetBasedOnCameraAngle();
			}

			setTexture(tex: THREE.Texture) {
				(this.sprite.material as THREE.MeshBasicMaterial).map = tex;
			}

			setFlip(x: boolean, y: boolean) {
				this.flipX = x ? -1 : 1;
				this.flipY = y ? -1 : 1;
				this.setScale(this.scaleUnflipped.x, this.scaleUnflipped.y);
			}

			getSize() {
				return { width: this.scaleUnflipped.x, height: this.scaleUnflipped.y };
			}

			getSizeInPixels() {
				return { width: Utils.worldToPixel(this.scaleUnflipped.x), height: Utils.worldToPixel(this.scaleUnflipped.y) };
			}

			update(_dt: number) {
				if (this.billboard) {
					// HACK: Part of the hack below, so it renders clothes
					// correctly on start.
					this.faceCamera(Three.instance().camera);
					this.correctZOffsetBasedOnCameraAngle();
				}
			}

			private calcRenderOrder() {
				this.sprite.renderOrder = this.layer * 100 + this.depth;
				this.position.y = Utils.getLayerZOffset(this.layer) + Utils.getDepthZOffset(this.depth) + this.zOffset;
			}

			private faceCamera(camera: Camera) {
				this.rotation.setFromRotationMatrix(camera.instance.matrix);
				this.rotateX(Math.PI * 0.5);
			}

			private correctZOffsetBasedOnCameraAngle() {
				let angle = Math.abs(Renderer.Three.instance().camera.getElevationAngle());
				angle = Math.PI * 0.5 - angle;
				let halfHeight = this.scaleUnflipped.y * 0.5;
				const adj = Math.cos(angle) * halfHeight;
				this.angleOffset = Math.tan(angle) * adj;
				const offset = this.zOffset + this.angleOffset;

				// HACK: Render items that are not weapons, like clothes,
				// correctly. This is a temporary fix until we refactor how
				// items work. They should have a hierarchical architecture.
				// For weapons, only the parent and an angle should be
				// communicated. Right now the renderer only gets positional
				// data, resulting in these hacks. The other one is in the
				// EntityManager.ts file, where it says it should not add
				// weapons as children to their parent unit. The engine/renderer
				// currently makes no distinction between dropped and wielded
				// items. They should be split up, so that dropped items are
				// normal entities (like Units), and wielded items work
				// hierarchically (moving/rotating) depending on the parent.
				// This also allows for lower detail items on the floor and
				// higher detail items when equipped.
				if (!this.parentedItemRenderHack) {
					this.position.y = Utils.getLayerZOffset(this.layer) + Utils.getDepthZOffset(this.depth) + offset;
				}

				for (const child of this.childSprites) {
					child.position.copy(this.position);

					//@ts-ignore
					if (child.taroEntity) {
						//@ts-ignore
						const x = Utils.pixelToWorld(child.taroEntity._stats.currentBody.unitAnchor.x);
						//@ts-ignore
						let y = -Utils.pixelToWorld(child.taroEntity._stats.currentBody.unitAnchor.y);

						child.sprite.position.x = x;
						child.sprite.position.z = y;
					}
				}
			}
		}
	}
}
