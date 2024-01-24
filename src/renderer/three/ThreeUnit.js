class ThreeUnit extends Entity {
    constructor(tex) {
        super(tex);
        // Why does every unit have a label?
        this.label = new Label();
        this.attributeBars = new THREE.Group();
        this.label.setOffset(new THREE.Vector2(0, 0.75 * 64), new THREE.Vector2(0.5, 0));
        this.add(this.label);
        this.add(this.attributeBars);
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
    renderAttributes(data) {
        this.attributeBars.remove(...this.attributeBars.children);
        data.attrs.forEach((attributeData) => {
            const bar = new ThreeAttributeBar();
            bar.update(attributeData);
            const yOffset = (attributeData.index - 1) * bar.height * 1.1;
            bar.setOffset(new THREE.Vector2(0, -0.75 * 64 - yOffset), new THREE.Vector2(0.5, 1));
            this.attributeBars.add(bar);
        });
    }
}
//# sourceMappingURL=ThreeUnit.js.map