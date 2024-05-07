namespace Renderer {
	export namespace Three {
		export class EntityPreview extends Node {
			entityEditor: EntityEditor;
			action: ActionData;
			editedAction: ActionData;
			preview: Renderer.Three.AnimatedSprite & { entity: EntityPreview };
			defaultWidth: number;
			defaultHeight: number;
			isBillboard = false;
			constructor(action: ActionData, type?: 'unit' | 'item' | 'projectile') {
				super();
				this.action = action;
				let key: string;
				let cols: number;
				let rows: number;
				let entityTypeData: Record<string, any>;

				for (let typeName of ['unit', 'item', 'projectile'].values()) {
					const iterTypes = `${typeName}Types`;
					const iterType = `${typeName}Type`;
					if (action.entityType === iterTypes || type === typeName) {
						entityTypeData = taro.game.data[iterTypes] && taro.game.data[iterTypes][action.entity ?? action[iterType]];
						if (!entityTypeData) return;
						key = `${entityTypeData.cellSheet.url}`;
						cols = entityTypeData.cellSheet.columnCount || 1;
						rows = entityTypeData.cellSheet.rowCount || 1;
					}
				}
				this.defaultWidth = entityTypeData.bodies?.default?.width;
				this.defaultHeight = entityTypeData.bodies?.default?.height;
				this.isBillboard = entityTypeData?.isBillboard ?? false;
				// TODO: add preview here
				const renderer = Renderer.Three.instance();
				const tex = gAssetManager.getTexture(key).clone();
				const frameWidth = tex.image.width / cols;
				const frameHeight = tex.image.height / rows;
				const texture = new TextureSheet(key, tex, frameWidth, frameHeight);
				const preview = (this.preview = new Renderer.Three.AnimatedSprite(texture) as Renderer.Three.AnimatedSprite & {
					entity: EntityPreview;
				});
				preview.entity = this;
				(preview.sprite as THREE.Mesh & { entity: EntityPreview }).entity = this;
				console.log(action.angle);
				if (!isNaN(action.angle)) this.rotation.y = action.angle;

				if (!isNaN(action.width) && !isNaN(action.height))
					this.scale.set(action.width / this.defaultWidth, 1, action.height / this.defaultHeight);
				if (taro.developerMode.active && taro.developerMode.activeTab === 'map') {
					preview.visible = true;
				} else {
					preview.visible = false;
				}
				this.add(this.preview);
				this.position.set(
					Utils.pixelToWorld(action.position?.x),
					Renderer.Three.getVoxels().calcLayersHeight(0) + 0.1,
					Utils.pixelToWorld(action.position?.y)
				);
				this.preview.setBillboard(entityTypeData.isBillboard, renderer.camera);
				renderer.entityPreviewLayer.add(this);
				renderer.entityManager.entityPreviews.push(preview);
			}

			edit(action: ActionData): void {
				if (!this.action.wasEdited || !action.wasEdited) {
					this.action.wasEdited = true;
					action.wasEdited = true;
				}
				taro.network.send<any>('editInitEntity', action);
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
					this.position.x = Utils.pixelToWorld(action.position.x);
					this.position.z = Utils.pixelToWorld(action.position.y);
				}
				if (!isNaN(this.action.angle) && !isNaN(action.angle)) {
					this.action.angle = action.angle;
					this.rotation.y = action.angle;
				}
				if (!isNaN(this.action.width) && !isNaN(action.width)) {
					this.action.width = action.width;
					this.scale.setX(action.width / this.defaultWidth);
				}
				if (!isNaN(this.action.height) && !isNaN(action.height)) {
					this.action.height = action.height;
					this.scale.setZ(action.height / this.defaultHeight);
				}
				if (action.wasDeleted) {
					this.destroy();
					this.action.wasDeleted = true;
				}
				// if (this === this.entityEditor.selectedEntityImage) this.updateOutline();
			}

			hide(): void {
				this.visible = false;
				//this.updateOutline(true);
			}

			delete(): void {
				//this.hide();
				let editedAction: ActionData = { actionId: this.action.actionId, wasDeleted: true };
				this.edit(editedAction);
				this.destroy();
			}
		}
	}
}
