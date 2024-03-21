namespace Renderer {
	export namespace Three {
		export class EntityManager {
			entities: Unit[] = [];
			units: Unit[] = [];
			items: Unit[] = [];
			projectiles: Unit[] = [];

			private animatedSprites: AnimatedSprite[] = [];

			constructor() {}

			create(taroEntity: TaroEntityPhysics, type: 'unit' | 'item' | 'projectile') {
				const entity = Unit.create(taroEntity);
				this.entities.push(entity);
				this.animatedSprites.push(entity);

				switch (type) {
					case 'unit':
						this.units.push(entity);
						break;
					case 'item':
						this.items.push(entity);
						break;
					case 'projectile':
						this.projectiles.push(entity);
						break;
				}

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
				for (const entity of this.entities) {
					entity.setGuiScale(scale);
				}
			}
		}
	}
}
