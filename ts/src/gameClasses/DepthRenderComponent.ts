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
                IRenderProps
    ): void {
        gameObject.setDepth(gameObject.taroDepth + gameObject.y / 1000); // 1000 temp numerator
    }
}