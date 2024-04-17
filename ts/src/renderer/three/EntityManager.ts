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
						this.maybeAddUnownedItemsToUnit(entity);
						break;
					}
					case 'item': {
						entity = Item.create(taroEntity);
						this.items.push(entity);
						this.addItemToUnitOrUnownedItems(entity);
						break;
					}
					case 'projectile': {
						entity = Unit.create(taroEntity);
						this.projectiles.push(entity);
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
			}

			scaleGui(scale: number) {
				for (const unit of this.units) {
					unit.hud.scale.setScalar(scale);
				}
			}

			private addItemToUnitOrUnownedItems(item: Item) {
				for (const unit of this.units) {
					if (item.taroId == unit.taroId) {
						unit.childSprites.push(item);
					} else {
						this.unownedItems.set(item.taroId, item);
					}
				}
			}

			private maybeAddUnownedItemsToUnit(unit: Unit) {
				for (const [taroId, item] of this.unownedItems.entries()) {
					if (unit.taroId == item.ownerUnitId) {
						this.unownedItems.delete(taroId);
						unit.childSprites.push(item);
					}
				}
			}
		}
	}
}
