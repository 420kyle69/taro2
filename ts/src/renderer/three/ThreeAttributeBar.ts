class ThreeAttributeBar extends THREE.Group {
	private sprite;
	private scaleScalar = 1;

	private center = new THREE.Vector2(0.5, 0.5);
	private offset = new THREE.Vector2();

	private timeout;

	constructor(
		public width = 97,
		public height = 16,
		public radius = 7
	) {
		super();

		this.sprite = this.createBar(this.width, this.height, this.radius, 'yellow', 100, 100);
		this.add(this.sprite);
	}

	update(data: AttributeData) {
		const { color, max, displayValue, showWhen, decimalPlaces, value } = data;

		this.name = data.type || data.key;

		this.remove(this.sprite);
		this.sprite = this.createBar(
			this.width,
			this.height,
			this.radius,
			color,
			+(+value).toFixed(decimalPlaces),
			max,
			displayValue
		);
		this.add(this.sprite);

		this.visible = true;

		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}

		if ((showWhen instanceof Array && showWhen.indexOf('valueChanges') > -1) || showWhen === 'valueChanges') {
			this.timeout = setTimeout(() => {
				this.visible = false;
			}, 1000);
		}
	}

	setOffset(offset: THREE.Vector2, center = new THREE.Vector2(0.5, 0.5)) {
		this.center.copy(center);
		this.offset.copy(offset);

		if (this.sprite) {
			const width = this.sprite.material.map.image.width;
			const height = this.sprite.material.map.image.height;
			this.sprite.center.set(center.x - offset.x / width, center.y - offset.y / height);
		}
	}

	setScale(scale: number) {
		this.scaleScalar = scale;
		this.sprite.scale.setScalar(scale);
	}

	private createBar(
		width: number,
		height: number,
		radius: number,
		color: string,
		value: number,
		max: number,
		displayValue = true
	) {
		const textCanvas = document.createElement('canvas');

		const ctx = textCanvas.getContext('2d');
		const font = `bold 14px Verdana`;

		const padding = 4;

		var x = padding / 2;
		var y = padding / 2;

		const text = value.toString();

		ctx.font = font;
		const metrics = ctx.measureText(text);
		const textWidth = metrics.width;
		const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
		textCanvas.width = width + padding;
		textCanvas.height = height + padding;

		fillRoundedRect(ctx, x, y, Math.max((width * value) / max, radius * 1.5), height, radius, color);
		strokeRoundedRect(ctx, x, y, width, height, radius, '#000000');

		if (displayValue) {
			ctx.font = font;
			ctx.fillStyle = '#000';
			ctx.fillText(text, textCanvas.width / 2 - textWidth / 2, textCanvas.height / 2 + textHeight / 2);
		}

		const spriteMap = new THREE.Texture(ctx.getImageData(0, 0, textCanvas.width, textCanvas.height));
		spriteMap.minFilter = THREE.LinearFilter;
		spriteMap.magFilter = THREE.NearestFilter;
		spriteMap.generateMipmaps = false;
		spriteMap.needsUpdate = true;

		const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
		spriteMaterial.depthTest = false;

		const sprite = new THREE.Sprite(spriteMaterial);
		sprite.renderOrder = 999;
		sprite.scale.set(this.scaleScalar * (textCanvas.width / 64), this.scaleScalar * (textCanvas.height / 64), 1);

		sprite.center.set(
			this.center.x - this.offset.x / textCanvas.width,
			this.center.y - this.offset.y / textCanvas.height
		);

		return sprite;
	}
}

function fillRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
	color: string
) {
	var tl = radius;
	var tr = radius;
	var bl = radius;
	var br = radius;

	const fillColor = new THREE.Color(color).getHex();
	const fillAlpha = 1;
	const red = (fillColor & 0xff0000) >>> 16;
	const green = (fillColor & 0xff00) >>> 8;
	const blue = fillColor & 0xff;
	ctx.fillStyle = `rgba(${red},${green},${blue},${fillAlpha})`;

	ctx.beginPath();
	ctx.moveTo(x + tl, y);
	ctx.lineTo(x + width - tr, y);
	ctx.arc(x + width - tr, y + tr, tr, -(Math.PI * 0.5), 0);
	ctx.lineTo(x + width, y + height - br);
	ctx.arc(x + width - br, y + height - br, br, 0, Math.PI * 0.5);
	ctx.lineTo(x + bl, y + height);
	ctx.arc(x + bl, y + height - bl, bl, Math.PI * 0.5, Math.PI);
	ctx.lineTo(x, y + tl);
	ctx.arc(x + tl, y + tl, tl, -Math.PI, -(Math.PI * 0.5));
	ctx.fill();
}

function strokeRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
	color: string
) {
	var tl = radius;
	var tr = radius;
	var bl = radius;
	var br = radius;

	const lineWidth = 2;
	const lineColor = new THREE.Color(color).getHex();
	const lineAlpha = 1;
	const red = (lineColor & 0xff0000) >>> 16;
	const green = (lineColor & 0xff00) >>> 8;
	const blue = lineColor & 0xff;
	ctx.strokeStyle = `rgba(${red},${green},${blue},${lineAlpha})`;
	ctx.lineWidth = lineWidth;

	ctx.beginPath();
	ctx.moveTo(x + tl, y);
	ctx.lineTo(x + width - tr, y);
	ctx.moveTo(x + width - tr, y);
	ctx.arc(x + width - tr, y + tr, tr, -(Math.PI * 0.5), 0);
	ctx.lineTo(x + width, y + height - br);
	ctx.moveTo(x + width, y + height - br);
	ctx.arc(x + width - br, y + height - br, br, 0, Math.PI * 0.5);
	ctx.lineTo(x + bl, y + height);
	ctx.moveTo(x + bl, y + height);
	ctx.arc(x + bl, y + height - bl, bl, Math.PI * 0.5, Math.PI);
	ctx.lineTo(x, y + tl);
	ctx.moveTo(x, y + tl);
	ctx.arc(x + tl, y + tl, tl, -Math.PI, -(Math.PI * 0.5));
	ctx.stroke();
}
