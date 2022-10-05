var PhaserRay = /** @class */ (function () {
    function PhaserRay(scene, start, end) {
        this.gameObject = scene.add.line(start.x, start.y, start.x, start.y, end.x, end.y, 0xffffff);
        this.gameObject.setOrigin(0, 0);
        console.log(this.gameObject);
    }
    return PhaserRay;
}());
//# sourceMappingURL=PhaserRay.js.map