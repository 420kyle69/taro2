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
        const v1 = new Phaser.Math.Vector2(start.x, start.y);
        const v2 = new Phaser.Math.Vector2(end.x, end.y);

        const realEnd = v2.subtract(v1);
        this.gameObject = scene.add.line(
            start.x, start.y,
            start.x, start.y,
            realEnd.x, realEnd.y,
            color,
        );

        this.gameObject.setOrigin(0,0);
        console.log(this.gameObject);
    }
}