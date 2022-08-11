class DepthRenderComponent {
    constructor (public scene: GameScene) {
        this.scene.depthRenderer = this;
    }

    adjustDepth (
            gameObject:
                Phaser.GameObjects.GameObject &
                Phaser.GameObjects.Components.Transform &
                Phaser.GameObjects.Components.Visible &
                Phaser.GameObjects.Components.Depth &
                Hidden
    ): void {
        const storeDepth = gameObject.depth;
        gameObject.setDepth(Math.floor(gameObject.depth) + gameObject.y / 1000); // 1000 temp numerator
    }
}