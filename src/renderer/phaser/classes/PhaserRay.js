var PhaserRay = /** @class */ (function () {
    function PhaserRay(scene, start, end, color, type) {
        // const v1 = new Phaser.Math.Vector2(start.x, start.y);
        // const v2 = new Phaser.Math.Vector2(end.x, end.y);
        var _this = this;
        // const realEnd = v2.subtract(v1);
        // this.line = scene.add.line(
        // 	start.x, start.y,
        // 	start.x, start.y,
        // 	realEnd.x, realEnd.y,
        // 	color,
        // );
        this.sprite = scene.add.sprite(start.x, start.y, "projectile/".concat(type));
        scene.tweens.add({
            targets: this.sprite,
            duration: 2000,
            props: {
                x: end.x,
                y: end.y
            },
            onComplete: function () {
                setTimeout(function () {
                    _this.sprite.destroy();
                    _this.sprite = null;
                }, 100);
            }
        });
        // this.line.setOrigin(0,0);
        // console.log(this.line);
    }
    return PhaserRay;
}());
//# sourceMappingURL=PhaserRay.js.map