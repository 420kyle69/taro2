class PhaserRay {
    private gameObject: Phaser.GameObjects.Line;

    constructor (
        scene: GameScene,
        start: {
            x: number,
            y: number
        },
        end: {
            x: number,
            y: number
        },
        color: any
    ) {
        this.gameObject = scene.add.line(
            start.x, start.y,
            start.x, start.y,
            end.x, end.y,
            color,
        );

        this.gameObject.setOrigin(0,0);
        console.log(this.gameObject);
    }
}