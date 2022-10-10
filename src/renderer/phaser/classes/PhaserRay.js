var PhaserRay = /** @class */ (function () {
    function PhaserRay(scene, start, end, config) {
        var _this = this;
        /* Debug draw ray */
        var v1 = new Phaser.Math.Vector2(start.x, start.y);
        var v2 = new Phaser.Math.Vector2(end.x, end.y);
        var lineStart = v1.multiply(new Phaser.Math.Vector2(0.5, 0.5));
        var lineEnd = v2.subtract(v1);
        this.line = scene.add.line(lineStart.x, lineStart.y, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y, 0xffffff);
        this.line.setOrigin(0, 0);
        this.line.setAlpha(0.85);
        scene.tweens.add({
            targets: this.line,
            duration: 400,
            props: {
                alpha: 0
            },
            onComplete: function () {
                _this.line.destroy();
                _this.line = null;
            }
        });
        console.log(this.line);
        /* End of Debug draw ray */
        if (config.projType) {
            this.sprite = scene.add.sprite(start.x, start.y, "projectile/".concat(config.projType));
            // scene.tweens.add({
            // 	targets: this.sprite,
            // 	duration: 250 * config.fraction,
            // 	props: {
            // 		x: end.x,
            // 		y: end.y
            // 	},
            // 	onComplete: () => {
            // 		setTimeout(() => {
            // 			this.sprite.destroy();
            // 			this.sprite = null;
            // 		}, 50);
            // 	}
            // });
        }
    }
    return PhaserRay;
}());
//# sourceMappingURL=PhaserRay.js.map