class HeightRenderComponent {
    constructor(scene, mapHeight) {
        this.scene = scene;
        this.mapHeight = mapHeight;
        this.scene.heightRenderer = this;
    }
    adjustDepth(gameObject) {
        const castGameObject = !gameObject.owner ? gameObject : gameObject.owner.gameObject;
        if (castGameObject) {
            const yPos = castGameObject.y;
            const halfHeight = castGameObject.spriteHeight2;
            if (!halfHeight) {
                gameObject.setDepth(gameObject.taroDepth);
                // console.log(gameObject, (gameObject.taroDepth + (yPos + halfHeight) / this.mapHeight), gameObject.taroDepth, yPos, halfHeight, this.mapHeight);
                return;
            }
            let depth = gameObject.taroDepth + (yPos + halfHeight) / this.mapHeight;
            // hack to always paint items on top of units
            if (castGameObject !== gameObject) {
                depth += 0.001;
            }
            depth = Number(depth.toFixed(3));
            gameObject.setDepth(depth);
        }
    }
}
//# sourceMappingURL=HeightRenderComponent.js.map