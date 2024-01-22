class ThreeUnit extends Entity {
    constructor(tex) {
        super(tex);
        // Why does every unit have a label?
        this.label = new Label();
        this.add(this.label);
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