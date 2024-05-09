namespace Renderer {
	export namespace Three {
		// TODO: Liskov substitution principle violation, use composition instead of
		// inheritance. The Attributes class should have a private instance of Node.
		// This happens all over the place because I didn't know about this.
		export class Attributes extends Node {
			private numAttributesBelow = 0;
			private numAttributesAbove = 0;
			private margin = 0;

			constructor() {
				super();
			}

			clear() {
				for (const child of this.children as Node[]) {
					if (child.isNode) {
						child.destroy();
					}
				}

				super.clear();

				this.numAttributesBelow = 0;
				this.numAttributesAbove = 0;

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
				const marginInBarHeights = this.margin / Utils.pixelToWorld(bar.height);

				if (config.anchorPosition === 'below') {
					bar.setCenter(0.5, -marginInBarHeights + (this.numAttributesBelow + 1) * -1);
					this.add(bar);
					this.numAttributesBelow++;
				} else {
					bar.setCenter(0.5, marginInBarHeights + this.numAttributesAbove + 2);
					this.add(bar);
					this.numAttributesAbove++;
				}
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

				if (!data.shouldRender) {
					if (barToUpdate) {
						barToUpdate.visible = data.shouldRender;
					}

					return;
				}

				if (barToUpdate) {
					barToUpdate.update(config);

					if (
						(data.attr.showWhen instanceof Array && data.attr.showWhen.indexOf('valueChanges') > -1) ||
						data.attr.showWhen === 'valueChanges'
					) {
						barToUpdate.showAndHideAfterDelay(1000);
					}
				} else {
					this.addAttribute(data.attr);
				}
			}

			setOpacity(opacity: number) {
				for (const bar of this.children as ProgressBar[]) {
					bar.setOpacity(opacity);
				}
			}

			setMargin(margin: number) {
				this.margin = margin;
			}
		}
	}
}
