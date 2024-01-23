class ThreeUnit extends Entity {
    constructor(tex) {
        super(tex);
        // Why does every unit have a label?
        this.label = new Label();
        this.attributeBar = new ThreeAttributeBar();
        this.label.setOffset(new THREE.Vector2(0, 0.75 * 64), new THREE.Vector2(0.5, 0));
        this.add(this.label);
        this.attributeBar.setOffset(new THREE.Vector2(0, -0.75 * 64), new THREE.Vector2(0.5, 1));
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