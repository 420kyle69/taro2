namespace Renderer {
	export namespace Three {
		export class EntityGizmo {
			currentCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
			control: TransformControls;
			dimension: '2d' | '3d' = '3d';
			constructor() {
				this.init();
			}
			init() {
				const renderer = Three.instance();
				const currentCamera = (this.currentCamera = renderer.camera.instance);
				const orbit = renderer.camera.controls;
				const control = (this.control = new TransformControls(currentCamera, renderer.renderer.domElement));

				control.addEventListener('dragging-changed', function (event) {
					orbit.enabled = !event.value;
					if (!event.value) {
						// drag ended
						const entityPreview: EntityPreview = control.object.entity;
						const editedAction = { actionId: entityPreview.action.actionId };
						switch (control.mode) {
							case 'translate':
								editedAction['position'] = {
									x: Renderer.Three.Utils.worldToPixel(control.object.position.x),
									y: Renderer.Three.Utils.worldToPixel(control.object.position.z),
									function: 'xyCoordinate',
								};
								break;
							case 'rotate':
								editedAction['angle'] = control.object.rotation.y;
								break;
							case 'scale':
								editedAction['width'] = control.object.scale.x * entityPreview.defaultWidth;
								editedAction['height'] = control.object.scale.z * entityPreview.defaultHeight;
								break;
						}
						if (editedAction) {
							renderer.entityEditor.selectedEntityPreview.edit(editedAction);
						}
					}
				});

				renderer.scene.add(control);

				taro.client.on('gizmo-mode', (mode: 'translate' | 'rotate' | 'scale') => {
					control.setMode(mode);
					this.updateForDimension();
				});

				window.addEventListener('keyup', function (event) {
					switch (event.key) {
						case 'Shift':
							control.setTranslationSnap(null);
							control.setRotationSnap(null);
							control.setScaleSnap(null);
							break;
					}
				});
			}

			attach(entity: AnimatedSprite | THREE.Mesh) {
				if (entity instanceof AnimatedSprite) {
					this.dimension = '2d';
					this.updateForDimension();
				} else {
					// TODO: make it 3d when taro action will support 3d
					this.dimension = '2d';
					this.updateForDimension();
				}
				this.control.attach((entity as AnimatedSprite).sprite);
			}

			updateForDimension() {
				const control = this.control;
				if (this.dimension === '2d') {
					switch (control.mode) {
						case 'translate':
							control.showX = true;
							control.showY = false;
							control.showZ = true;
							break;
						case 'rotate':
							control.showX = false;
							control.showY = true;
							control.showZ = false;
							break;
						case 'scale':
							control.showX = true;
							control.showY = false;
							control.showZ = true;
							break;
					}
				} else {
					control.showX = true;
					control.showY = true;
					control.showZ = true;
				}
			}
		}
	}
}
