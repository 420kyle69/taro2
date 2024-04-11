namespace Renderer {
	export namespace Three {
		// TODO: Liskov substitution principle violation, use composition instead of
		// inheritance. The Attributes class should have a private instance of Node.
		// This happens all over the place because I didn't know about this.
		export class Attributes extends Node {
			private numAttributes = 0;

			constructor() {
				super();
			}

			clear() {
				for (const child of this.children) {
					(child as Node).destroy();
				}

				super.clear();

				this.numAttributes = 0;

				return this;
			}

			addAttributes(data: { attrs: AttributeData[] }) {
				for (const attr of data.attrs) {
					this.addAttribute(attr);
				}
			}

			addAttribute(data: AttributeData) {
				const config = Mapper.ProgressBar(data);
				const bar = new ProgressBar(config);
				bar.name = data.type || data.key;
				const emptyRows = 2; // For spacing
				bar.setCenter(0.5, (this.numAttributes + 1 + emptyRows) * -1);
				this.add(bar);
				this.numAttributes++;
			}

			update(data: { attr: AttributeData; shouldRender: boolean }) {
				let barToUpdate: ProgressBar;

				for (const bar of this.children as ProgressBar[]) {
					if (bar.name === data.attr.type) {
						barToUpdate = bar;
						break;
					}
				}

				const config = Mapper.ProgressBar(data.attr);

				if (!barToUpdate) {
					this.addAttribute(data.attr);
					return;
				}

				if (!data.shouldRender) {
					barToUpdate.visible = data.shouldRender;
					return;
				}

				barToUpdate.update(config);
			}

			setOpacity(opacity: number) {
				for (const bar of this.children as ProgressBar[]) {
					bar.setOpacity(opacity);
				}
			}
		}
	}
}
