var PhaserRay = /** @class */ (function () {
    function PhaserRay(scene, start, end, color) {
        var v1 = new Phaser.Math.Vector2(start.x, start.y);
        var v2 = new Phaser.Math.Vector2(end.x, end.y);
        var realEnd = v2.subtract(v1);
        this.gameObject = scene.add.line(start.x, start.y, start.x, start.y, realEnd.x, realEnd.y, color);
        this.gameObject.setOrigin(0, 0);
        console.log(this.gameObject);
    }
    return PhaserRay;
}());
//# sourceMappingURL=PhaserRay.js.map