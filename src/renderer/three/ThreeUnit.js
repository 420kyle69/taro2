class ThreeUnit extends Entity {
    constructor(tex) {
        super(tex);
        // Why does every unit have a label?
        this.label = new Label();
        this.attributeBar = new ThreeAttributeBar();
        this.label.setScale(0.5);
        this.label.setOffset(new THREE.Vector3(0, this.mesh.scale.y / 2, 0));
        this.add(this.label);
        this.attributeBar.setScale(0.5);
        this.attributeBar.setOffset(new THREE.Vector3(0, -10, 0));
        this.add(this.attributeBar);
    }
    updateLabel(data) {
        this.label.update(data.text, data.color, data.bold);
    }
    showLabel() {
        this.label.visible = true;
    }
    hideLabel() {
        this.label.visible = false;
    }
}
//# sourceMappingURL=ThreeUnit.js.map