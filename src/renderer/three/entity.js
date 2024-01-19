class Entity extends THREE.Group {
    constructor(tex, unit) {
        super();
        this.unit = unit;
        this.scale.set(tex.image.width / 64, 1, tex.image.height / 64);
        this.position.set(unit._translate.x / 64, 1, unit._translate.y / 64);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);
    }
    // setPosition(x: number, y: number, z: number) {
    // 	this.lastPosition.copy(this.position);
    // 	this.currentPosition.set(x, y, z);
    // }
    render(dt = 0) {
        this.position.set(this.unit._translate.x / 64 - 0.5, 1, this.unit._translate.y / 64 - 0.5);
        this.rotation.y = -this.unit._rotate.z;
        this.scale.set(this.unit._scale.x, 1, this.unit._scale.y);
        // // const alpha = 1 / 60 / dt;
        // const alpha = 0.5;
        // this.position.copy(
        // 	this.currentPosition
        // 		.clone()
        // 		.multiplyScalar(alpha)
        // 		.add(this.lastPosition.multiplyScalar(1 - alpha))
        // );
    }
}
//# sourceMappingURL=entity.js.map