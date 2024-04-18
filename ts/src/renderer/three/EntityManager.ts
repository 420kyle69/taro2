namespace Renderer {
	export namespace Three {
		export class EntityManager {
			entities: (Unit | Item | Region)[] = [];
			units: Unit[] = [];
			items: Item[] = [];
			projectiles: Unit[] = [];
			regions: Region[] = [];

			private animatedSprites: AnimatedSprite[] = [];
			private unownedItems = new Map<string, Item>();

			create(taroEntity: TaroEntityPhysics, type: 'unit' | 'item' | 'projectile' | 'region') {
				let entity;

				switch (type) {
					case 'unit': {
						entity = Unit.create(taroEntity);
						this.units.push(entity);
						this.animatedSprites.push(entity);
						this.maybeAddUnownedItemsToUnit(entity);
						break;
					}
					case 'item': {
						entity = Item.create(taroEntity);
						this.items.push(entity);
						this.animatedSprites.push(entity);
						this.addItemToUnitOrUnownedItems(entity);
						break;
					}
					case 'projectile': {
						entity = Unit.create(taroEntity);
						this.projectiles.push(entity);
						this.animatedSprites.push(entity);
						break;
					}
					case 'region': {
						entity = new Region(taroEntity._id, taroEntity._stats.ownerId, taroEntity);
						this.regions.push(entity);
						break;
					}
				}

				this.entities.push(entity);

				return entity;
			}

			destroy(entity: Unit) {
				entity.destroy();

				const idx = this.entities.indexOf(entity, 0);
				if (idx === -1) return;

				this.entities.splice(idx, 1);
				this.animatedSprites.splice(this.animatedSprites.indexOf(entity as AnimatedSprite, 0), 1);
			}

			update(dt: number) {
				for (const sprite of this.animatedSprites) {
					sprite.update(dt);
				}

				if (this.unownedItems.size > 0) {
					for (const unit of this.units) {
						this.maybeAddUnownedItemsToUnit(unit);
					}
				}
			}

			scaleGui(scale: number) {
				for (const unit of this.units) {
					unit.hud.scale.setScalar(scale);
				}
			}

			private addItemToUnitOrUnownedItems(item: Item) {
				if (item.taroEntity?._stats.type === 'weapon') return;

				for (const unit of this.units) {
					if (item.ownerUnitId == unit.taroId) {
						unit.childSprites.push(item);
						item.parentedItemRenderHack = true;

						return;
					}
				}

				this.unownedItems.set(item.taroId, item);

				if (item.taroEntity) {
					item.taroEntity.on('setOwnerUnit', (unitId: string) => {
						item.ownerUnitId = unitId;
						this.maybeAddUnownedItemToUnit(item);
					});
				}
			}

			private maybeAddUnownedItemsToUnit(unit: Unit) {
				const itemsToDelete = [];

				for (const [taroId, item] of this.unownedItems.entries()) {
					if (unit.taroId == item.ownerUnitId) {
						unit.childSprites.push(item);
						item.parentedItemRenderHack = true;
						itemsToDelete.push(taroId);
					}
				}

				for (const itemTaroId of itemsToDelete) {
					this.unownedItems.delete(itemTaroId);
				}
			}

			private maybeAddUnownedItemToUnit(item: Item) {
				if (!this.unownedItems.has(item.taroId)) return;

				for (const unit of this.units) {
					if (item.ownerUnitId === unit.taroId) {
						unit.childSprites.push(item);
						item.parentedItemRenderHack = true;

						this.unownedItems.delete(item.taroId);

						return;
					}
				}
			}
		}
	}
}
