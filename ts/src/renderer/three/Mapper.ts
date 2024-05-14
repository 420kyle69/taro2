namespace Renderer {
	export namespace Three {
		export class Mapper {
			static ProgressBar(attr: AttributeData, config: ProgressBarParams = {}) {
				if (!isNaN(attr.padding)) {
					config.padding = attr.padding;
				}

				if (attr.dimensions) {
					config.width = attr.dimensions.width;
					config.height = attr.dimensions.height;

					if (!isNaN(attr.padding)) {
						config.width += attr.padding * 2;
						config.height += attr.padding * 2;
					}
				}

				if (attr.origin) {
					config.origin = { x: attr.origin.x, y: attr.origin.y };
				}

				if (!isNaN(attr.cornerRounding)) {
					config.radius = attr.cornerRounding;
				}

				if (attr.backgroundColor) {
					config.bgColor = attr.backgroundColor;
				}

				if (attr.color) {
					config.fgColor = attr.color;
				}

				if (attr.strokeColor) {
					config.strokeColor = attr.strokeColor;
				}

				if (!isNaN(attr.strokeThickness)) {
					config.strokeThickness = attr.strokeThickness;
				}

				if (typeof attr.value === 'number') {
					config.value = attr.value;
				}

				if (!isNaN(attr.max)) {
					config.max = attr.max;
				}

				if (attr.displayValue) {
					config.displayValue = attr.displayValue;
				}

				if (!isNaN(attr.decimalPlaces)) {
					config.decimalPlaces = attr.decimalPlaces;
				}

				if (attr.trailingZeros) {
					config.trailingZeros = attr.trailingZeros;
				}

				if (!isNaN(attr.fontSize)) {
					config.fontSize = attr.fontSize;
				}

				if (!isNaN(attr.letterSpacing)) {
					config.letterSpacing = attr.letterSpacing;
				}

				if (attr.anchorPosition) {
					const isAbove = attr.anchorPosition === 'above-unit';
					config.anchorPosition = isAbove ? 'above' : 'below';
				} else {
					config.anchorPosition = 'below';
				}

				if (!isNaN(attr.margin)) {
					config.margin = attr.margin;
				}

				return config;
			}
		}
	}
}
