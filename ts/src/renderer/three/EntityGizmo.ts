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
				//const cameraPersp
				//renderer.setPixelRatio(window.devicePixelRatio);
				//renderer.setSize(window.innerWidth, window.innerHeight);
				//document.body.appendChild(renderer.renderer.domElement);

				/*const aspect = window.innerWidth / window.innerHeight;

				const frustumSize = 5;*/

				/*const cameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
				const cameraOrtho = new THREE.OrthographicCamera(
					-frustumSize * aspect,
					frustumSize * aspect,
					frustumSize,
					-frustumSize,
					0.1,
					100
				);*/
				const currentCamera = (this.currentCamera = renderer.camera.instance);

				//currentCamera.position.set(5, 2.5, 5);

				/*scene = new THREE.Scene();
				scene.add(new THREE.GridHelper(5, 10, 0x888888, 0x444444));

				const ambientLight = new THREE.AmbientLight(0xffffff);
				scene.add(ambientLight);

				const light = new THREE.DirectionalLight(0xffffff, 4);
				light.position.set(1, 1, 1);
				scene.add(light);

				const texture = new THREE.TextureLoader().load('textures/crate.gif', render);
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

				const geometry = new THREE.BoxGeometry();
				const material = new THREE.MeshLambertMaterial({ map: texture });*/

				/*const orbit = new OrbitControls(currentCamera, renderer.renderer.domElement);
				orbit.update();
				orbit.addEventListener('change', this.render);*/
				const orbit = renderer.camera.controls;

				const control = (this.control = new TransformControls(currentCamera, renderer.renderer.domElement));
				console.log(control);
				//control.visible = true;

				//control.addEventListener('change', this.render);

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

				/*const mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);

				control.attach(mesh);*/
				renderer.scene.add(control);

				//window.addEventListener('resize', this.onWindowResize);

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

			/*onWindowResize() {
				const aspect = window.innerWidth / window.innerHeight;

				const camera = this.currentCamera;
				if (camera.isPerspectiveCamera) {
					camera.aspect = aspect;
					camera.updateProjectionMatrix();
				} else {
					camera.left = camera.bottom * aspect;
					camera.right = camera.top * aspect;
					camera.updateProjectionMatrix();
				}

				this.renderer.setSize(window.innerWidth, window.innerHeight);
			}*/
		}
	}
}
