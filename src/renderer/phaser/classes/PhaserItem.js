class PhaserItem extends PhaserAnimatedEntity {
    constructor(scene, entity) {
        super(scene, entity, `item/${entity._stats.cellSheet.url}`);
        this.sprite.visible = false;
        this.gameObject = this.sprite;
        const { x, y } = entity._translate;
        this.gameObject.setPosition(x, y);
        Object.assign(this.evtListeners, {
            // this event is only emitted by height-based-zindex games
            setOwnerUnit: entity.on("setOwnerUnit", this.setOwnerUnit, this),
            "update-texture": entity.on("update-texture", this.updateTexture, this),
        });
        if (scene.heightRenderer) {
            // don't waste cpu tracking owner of items on renderer
            // unless we have to (hbz)
            // this won't work for *our* units
            if (entity._stats.ownerUnitId !== undefined) {
                this.setOwnerUnit(entity._stats.ownerUnitId);
            }
            this.gameObject.spriteHeight2 = this.sprite.displayHeight / 2;
        }
        this.scene.itemList.push(this);
        this.scene.renderedEntities.push(this.sprite);
    }
    updateTexture(data) {
        if (data === "basic_texture_change") {
            this.sprite.anims.stop();
            this.key = `item/${this.entity._stats.cellSheet.url}`;
            if (!this.scene.textures.exists(this.key)) {
                this.scene.loadEntity(this.key, this.entity._stats);
                this.scene.load.on(`filecomplete-image-${this.key}`, function cnsl() {
                    if (this && this.sprite) {
                        this.sprite.setTexture(this.key);
                        this.sprite.texture.setFilter(this.scene.filter);
                        const bounds = this.entity._bounds2d;
                        this.sprite.setDisplaySize(bounds.x, bounds.y);
                    }
                }, this);
                this.scene.load.start();
            }
            else {
                this.sprite.setTexture(this.key);
                const bounds = this.entity._bounds2d;
                this.sprite.setDisplaySize(bounds.x, bounds.y);
            }
        }
    }
    depth(value) {
        const scene = this.gameObject.scene;
        this.gameObject.taroDepth = value;
        if (scene.heightRenderer) {
            scene.heightRenderer.adjustDepth(this.gameObject);
        }
        else {
            this.gameObject.setDepth(value);
        }
    }
    setOwnerUnit(unitId) {
        this.ownerUnitId = unitId;
        const phaserUnit = unitId ? this.scene.findUnit(unitId) : null;
        this.gameObject.owner = phaserUnit ? phaserUnit : null;
    }
    size(data) {
        super.size(data);
        if (data.height && this.scene.heightRenderer) {
            this.sprite.spriteHeight2 = this.sprite.displayHeight / 2;
        }
    }
    destroy() {
        this.scene.renderedEntities = this.scene.renderedEntities.filter((item) => item !== this.sprite);
        this.scene.itemList = this.scene.itemList.filter((item) => item.entity.id() !== this.entity.id());
        this.ownerUnitId = null;
        super.destroy();
    }
}
//# sourceMappingURL=PhaserItem.js.map