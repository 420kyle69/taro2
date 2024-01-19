/* eslint-disable @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars */
class PhaserEntity {
    constructor(entity) {
        this.entity = entity;
        this.evtListeners = {};
        Object.assign(this.evtListeners, {
            transform: entity.on('transform', this.transform, this),
            scale: entity.on('scale', this.scale, this),
            hide: entity.on('hide', this.hide, this),
            show: entity.on('show', this.show, this),
            layer: entity.on('layer', this.layer, this),
            depth: entity.on('depth', this.depth, this),
            dynamic: entity.on('dynamic', this.setDynamic, this),
            destroy: entity.on('destroy', this.destroy, this)
        });
        entity.phaserEntity = this;
    }
    transform(data) { }
    scale(data) { }
    hide() {
        this.gameObject.hidden = true;
    }
    show() {
        this.gameObject.hidden = false;
    }
    layer(value) {
        // use index - 1 because taro layers are indexed at 1
        const scene = this.gameObject.scene;
        scene.entityLayers[value - 1].add(this.gameObject);
    }
    depth(value) {
        const scene = this.gameObject.scene;
        this.gameObject.taroDepth = value;
        this.gameObject.setDepth(value);
    }
    //height-based renderer
    setDynamic(isDynamic) {
        this.gameObject.dynamic = isDynamic;
    }
    destroy() {
        Object.keys(this.evtListeners).forEach((key) => {
            this.entity.off(key, this.evtListeners[key]);
            delete this.evtListeners[key];
        });
        this.gameObject.destroy();
        this.gameObject = null;
        this.evtListeners = null;
        this.entity = null;
    }
}
//# sourceMappingURL=PhaserEntity.js.map