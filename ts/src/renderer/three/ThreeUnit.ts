class ThreeUnit extends ThreeAnimatedSprite {
	label = new ThreeLabel();

	cameraConfig = {
		pointerLock: false,
		pitchRange: { min: -90, max: 90 },
		offset: { x: 0, y: 0, z: 0 },
	};

	private guiScale = 1;
	private attributeBars = new THREE.Group();
	private chat: ThreeChatBubble;

	constructor(
		public taroId: string,
		tex: THREE.Texture
	) {
		super(tex);

		this.add(this.label);

		this.add(this.attributeBars);
	}

	renderChat(text: string): void {
		if (this.chat) {
			this.chat.update(text);
		} else {
			this.chat = new ThreeChatBubble(text);
			this.chat.setOffset(new THREE.Vector2(0, 1.5 * 64), new THREE.Vector2(0.5, 0));
			this.add(this.chat);
		}
	}

	renderAttributes(data) {
		this.attributeBars.remove(...this.attributeBars.children);
		data.attrs.forEach((attributeData) => this.attributeBars.add(this.createAttributeBar(attributeData)));
	}

	updateAttribute(data: { attr: AttributeData; shouldRender: boolean }) {
		let barToUpdate: ThreeAttributeBar;

		// Refactor attributeBars into map (name -> bar)
		for (const bar of this.attributeBars.children) {
			if (bar.name === data.attr.type) {
				barToUpdate = bar as ThreeAttributeBar;
				break;
			}
		}

		if (!data.shouldRender) {
			if (barToUpdate) {
				barToUpdate.visible = data.shouldRender;
			}

			return;
		}

		if (barToUpdate) {
			barToUpdate.update(data.attr);
		} else {
			this.attributeBars.add(this.createAttributeBar(data.attr));
		}
	}

	setScale(sx: number, sy: number) {
		super.setScale(sx, sy);

		// NOTE(nick): Place label at the top of sprite + spacing equal to label height.
		this.label.setOffset(new THREE.Vector2(0, Utils.worldToPixel(sy * 0.5)), new THREE.Vector2(0.5, -1));

		for (const [idx, bar] of this.attributeBars.children.entries()) {
			const height = (bar as ThreeAttributeBar).height;
			const yOffset = idx * height * 1.1;
			(bar as ThreeAttributeBar).setOffset(
				new THREE.Vector2(
					0,
					// NOTE(nick): Mostly taken from the Phaser renderer and trial and error.
					-(Utils.worldToPixel(this.scaleUnflipped.y * 0.5) + height * (1 / 1.1) + 16 * this.guiScale + yOffset)
				)
			),
				new THREE.Vector2(0.5, 1);
		}
	}

	setGuiScale(scale: number) {
		this.guiScale = scale;

		this.label.setScale(scale);

		for (const bar of this.attributeBars.children) {
			(bar as ThreeAttributeBar).setScale(scale);
		}

		if (this.chat) {
			this.chat.setScale(scale);
		}
	}

	private createAttributeBar(data) {
		const bar = new ThreeAttributeBar();
		bar.update(data);
		const yOffset = (data.index - 1) * bar.height * 1.1;

		bar.setOffset(
			new THREE.Vector2(
				0,
				-(Utils.worldToPixel(this.scaleUnflipped.y * 0.5) + bar.height * (1 / 1.1) + 16 * this.guiScale + yOffset)
			)
		),
			new THREE.Vector2(0.5, 1);

		bar.setScale(this.guiScale);
		return bar;
	}
}
