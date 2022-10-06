var PhaserRay = /** @class */ (function () {
    function PhaserRay(scene, start, end, color) {
        this.gameObject = scene.add.line(start.x, start.y, start.x, start.y, end.x, end.y, color);
        this.gameObject.setOrigin(0, 0);
        console.log(this.gameObject);
    }
    return PhaserRay;
}());
//# sourceMappingURL=PhaserRay.js.map