namespace Renderer {
	export namespace Three {
		export class EntityPreview {
			entityEditor: EntityEditor;
			action: ActionData;
			editedAction: ActionData;
			preview: Renderer.Three.AnimatedSprite & { entity: EntityPreview };
			defaultWidth: number;
			defaultHeight: number;

			dragMode: 'position' | 'angle' | 'scale';
			startDragX: number;
			startDragY: number;
			rotation: number;
			scale: number;
			scaleX: number;
			scaleY: number;
			displayWidth: number;
			displayHeight: number;
			x: number;
			y: number;

			constructor(action: ActionData, type?: 'unit' | 'item' | 'projectile') {
				this.action = action;
				let key: string;
				let entityTypeData: Record<string, any>;

				for (let typeName of ['unit', 'item', 'projectile'].values()) {
					const iterTypes = `${typeName}Types`;
					const iterType = `${typeName}Type`;
					if (action.entityType === iterTypes || type === typeName) {
						entityTypeData = taro.game.data[iterTypes] && taro.game.data[iterTypes][action.entity ?? action[iterType]];
						if (!entityTypeData) return;
						key = `${entityTypeData.cellSheet.url}`;
					}
				}
				this.defaultWidth = entityTypeData.bodies?.default?.width;
				this.defaultHeight = entityTypeData.bodies?.default?.height;

				// TODO: add preview here
				const renderer = Renderer.Three.instance();
				const textureMgr = TextureManager.instance();
				const preview = (this.preview = new Renderer.Three.AnimatedSprite(
					textureMgr.getTextureSheetShallowCopy(key)
				) as Renderer.Three.AnimatedSprite & { entity: EntityPreview });
				preview.entity = this;
				if (!isNaN(action.angle)) preview.rotateY(action.angle);
				if (!isNaN(action.width) && !isNaN(action.height))
					preview.scale.set(action.width / this.defaultWidth, 1, action.height / this.defaultHeight);
				if (taro.developerMode.active && taro.developerMode.activeTab === 'map') {
					preview.visible = true;
				} else {
					preview.visible = false;
				}
				preview.position.set(
					action.position?.x,
					Renderer.Three.getVoxels().calcLayersHeight(0) + 0.1,
					action.position?.y
				);
				renderer.entityPreviewLayer.add(preview);
				let lastTime = 0;
				let editedAction: ActionData = (this.editedAction = { actionId: action.actionId });

				//TODO: add select here
				// 	image.on('pointerdown', () => {
				// 		if (this.devModeTools.activeButton !== 'cursor') return;
				// 		if (entityEditor.selectedEntityImage !== this) {
				// 			entityEditor.selectEntityImage(this);
				// 		}

				// 		//double click
				// 		let clickDelay = taro._currentTime - lastTime;
				// 		lastTime = taro._currentTime;
				// 		if (clickDelay < 350) {
				// 			if (inGameEditor && inGameEditor.showScriptForEntity) {
				// 				inGameEditor.showScriptForEntity(action.actionId);
				// 			}
				// 		}

				// 		this.startDragX = image.x;
				// 		this.startDragY = image.y;
				// 		this.scale = image.scale;
				// 		if (!devModeTools.altKey.isDown && !devModeTools.shiftKey.isDown) {
				// 			this.dragMode = 'position';
				// 		} else if (devModeTools.altKey.isDown) {
				// 			this.dragMode = 'angle';
				// 			image.rotation = 0;
				// 			editedAction.angle = image.angle;
				// 		} else if (devModeTools.shiftKey.isDown) {
				// 			this.dragMode = 'scale';
				// 			if (!isNaN(this.defaultWidth) && !isNaN(this.defaultHeight)) {
				// 				image.setDisplaySize(this.defaultWidth, this.defaultHeight);
				// 				editedAction.width = this.defaultWidth;
				// 				editedAction.height = this.defaultHeight;
				// 			}
				// 		}
				// 		this.updateOutline();
				// 	});

				// 	const outlineHover = entityEditor.outlineHover;

				// 	image.on('pointerover', () => {
				// 		scene.input.setTopOnly(true);
				// 		if (this.devModeTools.activeButton !== 'cursor' || entityEditor.activeHandler) return;
				// 		this.updateOutline();
				// 	});

				// 	image.on('pointerout', () => {
				// 		if (entityEditor.selectedEntityImage === this) return;
				// 		outlineHover.clear();
				// 	});
			}

			edit(action: ActionData): void {
				if (!this.action.wasEdited || !action.wasEdited) {
					this.action.wasEdited = true;
					action.wasEdited = true;
				}
				taro.network.send<any>('editInitEntity', action);
			}

			updateOutline(hide?: boolean): void {
				// const outline = this.entityEditor.outline;
				// const outlineHover = this.entityEditor.outlineHover;
				// const selectionContainer = this.entityEditor.selectionContainer;
				// if (hide) {
				// 	outline.clear();
				// 	outlineHover.clear();
				// 	selectionContainer.setVisible(false);
				// 	return;
				// }
				// const handlers = this.entityEditor.handlers;
				// const image = this.image;
				// if (this.entityEditor.selectedEntityImage === this) {
				// 	outline.clear();
				// 	outlineHover.clear();
				// 	outline.lineStyle(6, 0x036ffc, 0.3);
				// 	selectionContainer.setVisible(true);
				// 	selectionContainer.x = image.x;
				// 	selectionContainer.y = image.y;
				// 	selectionContainer.angle = image.angle;
				// 	const smallDistance = 20 / this.scene.cameras.main.zoom;
				// 	const largeDistance = 25 / this.scene.cameras.main.zoom;
				// 	handlers.topLeft.setPosition(
				// 		-image.displayWidth / 2 - smallDistance,
				// 		-image.displayHeight / 2 - smallDistance
				// 	);
				// 	handlers.topLeftRotate.setPosition(
				// 		-image.displayWidth / 2 - largeDistance,
				// 		-image.displayHeight / 2 - largeDistance
				// 	);
				// 	handlers.top.setPosition(0, -image.displayHeight / 2 - smallDistance);
				// 	handlers.topRight.setPosition(
				// 		image.displayWidth / 2 + smallDistance,
				// 		-image.displayHeight / 2 - smallDistance
				// 	);
				// 	handlers.topRightRotate.setPosition(
				// 		image.displayWidth / 2 + largeDistance,
				// 		-image.displayHeight / 2 - largeDistance
				// 	);
				// 	handlers.right.setPosition(image.displayWidth / 2 + smallDistance, 0);
				// 	handlers.bottomRight.setPosition(
				// 		image.displayWidth / 2 + smallDistance,
				// 		image.displayHeight / 2 + smallDistance
				// 	);
				// 	handlers.bottomRightRotate.setPosition(
				// 		image.displayWidth / 2 + largeDistance,
				// 		image.displayHeight / 2 + largeDistance
				// 	);
				// 	handlers.bottom.setPosition(0, image.displayHeight / 2 + smallDistance);
				// 	handlers.bottomLeft.setPosition(
				// 		-image.displayWidth / 2 - smallDistance,
				// 		image.displayHeight / 2 + smallDistance
				// 	);
				// 	handlers.bottomLeftRotate.setPosition(
				// 		-image.displayWidth / 2 - largeDistance,
				// 		image.displayHeight / 2 + largeDistance
				// 	);
				// 	handlers.left.setPosition(-image.displayWidth / 2 - smallDistance, 0);
				// 	outline.strokeRect(
				// 		-image.displayWidth / 2,
				// 		-image.displayHeight / 2,
				// 		image.displayWidth,
				// 		image.displayHeight
				// 	);
				// 	outline.x = image.x;
				// 	outline.y = image.y;
				// 	outline.angle = image.angle;
				// } else {
				// 	outlineHover.clear();
				// 	outlineHover.lineStyle(2, 0x036ffc, 1);
				// 	outlineHover.strokeRect(
				// 		-image.displayWidth / 2,
				// 		-image.displayHeight / 2,
				// 		image.displayWidth,
				// 		image.displayHeight
				// 	);
				// 	outlineHover.x = image.x;
				// 	outlineHover.y = image.y;
				// 	outlineHover.angle = image.angle;
				// }
			}

			update(action: ActionData): void {
				//update action in editor
				if (inGameEditor && inGameEditor.updateAction) {
					inGameEditor.updateAction(action);
				}
				if (action.wasEdited) this.action.wasEdited = true;
				if (
					this.action.position &&
					!isNaN(this.action.position.x) &&
					!isNaN(this.action.position.y) &&
					action.position &&
					!isNaN(action.position.x) &&
					!isNaN(action.position.y)
				) {
					this.action.position = action.position;
					this.preview.position.x = action.position.x;
					this.preview.position.y = action.position.y;
				}
				if (!isNaN(this.action.angle) && !isNaN(action.angle)) {
					this.action.angle = action.angle;
					// TODO: handle the ratation
					this.preview.rotation.set(action.angle, 0, 0);
				}
				if (!isNaN(this.action.width) && !isNaN(action.width)) {
					this.action.width = action.width;
					this.preview.scale.setX(action.width);
				}
				if (!isNaN(this.action.height) && !isNaN(action.height)) {
					this.action.height = action.height;
					this.preview.scale.setY(action.height);
				}
				if (action.wasDeleted) {
					this.hide();
					this.action.wasDeleted = true;
				}
				// if (this === this.entityEditor.selectedEntityImage) this.updateOutline();
			}

			hide(): void {
				this.preview.visible = false;
				this.updateOutline(true);
			}

			delete(): void {
				this.hide();
				let editedAction: ActionData = { actionId: this.action.actionId, wasDeleted: true };
				this.edit(editedAction);
			}
		}
	}
}
