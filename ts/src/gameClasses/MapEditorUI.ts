class MapEditorUI {
	isButtonsRendered = false;
	toolsButtons = new Map();
	brushSize = 1;
	tooltipLabelNode = null;
	tooltipTextNode = null;
	isHoveringOverMapButton = false;

	constructor() {
		taro.client.on('enterMapTab', () => {
			console.log('enterMapTab is called');
			this.showMapEditor();
		});

		taro.client.on('leaveMapTab', () => {
			this.hideMapEditor();
		});
	}

	addTooltipListenerToNode(node, { tooltipText, tooltipLabel }) {
		if (node) {
			// show tooltip
			node.onmouseover = () => {
				this.isHoveringOverMapButton = true;
				const element = taro.client.getCachedElementById('map-buttons-tooltip');
				if (element) {
					element.style.display = 'flex';
					this.tooltipLabelNode.innerText = tooltipLabel;
					this.tooltipTextNode.innerText = tooltipText;
				}
			};

			// hide tooltip
			node.onmouseout = () => {
				this.isHoveringOverMapButton = false;
				const element = taro.client.getCachedElementById('map-buttons-tooltip');
				if (element) {
					element.style.display = 'none';
				}
			};
		}
	}

	createMapButton({
		tooltipLabel,
		tooltipText,
		image = null,
		height = 25,
		width = 28,
		text = null,
		onClick = null,
		className = '',
	}) {
		// create a new button and return it.
		const button = document.createElement('button');
		button.style.width = `${width}px`;
		button.style.height = `${height}px`;

		if (onClick) {
			button.onmousedown = (e) => {
				e.preventDefault();
				e.stopPropagation();
				onClick(e);
			};
		}

		if (image) {
			const img = document.createElement('img');
			img.src = this.imageMap[image] || '';

			button.appendChild(img);
		} else if (text) {
			const textDiv = document.createElement('div');
			textDiv.className = 'map-editor-button-text';
			textDiv.innerText = text;
			button.appendChild(textDiv);
		}

		button.className = `map-editor-button ${className}`;

		this.addTooltipListenerToNode(button, { tooltipText, tooltipLabel });

		return button;
	}

	createMapButtonTitle({ title }) {
		const titleDiv = document.createElement('div');
		titleDiv.className = 'map-buttons-title';
		titleDiv.innerText = title;
		return titleDiv;
	}

	createLayerButton({ layer, index, layers, layerIndex }) {
		const layerDiv = document.createElement('div');
		layerDiv.className = 'layer-button-div visible';

		const layerEyeButton = document.createElement('button');
		layerEyeButton.className = 'layer-eye-button';

		const layerEyeImg = document.createElement('img');
		layerEyeImg.src = this.imageMap['eyeopen'];

		layerEyeButton.appendChild(layerEyeImg);

		const layerText = document.createElement('button');
		layerText.className = 'layer-text';
		const layerInnerText = document.createElement('div');
		layerInnerText.innerText = layer.name;
		layerText.appendChild(layerInnerText);

		this.addTooltipListenerToNode(layerText, {
			tooltipLabel: `Layer (${index})`,
			tooltipText: `select the ${layer.name} layer`,
		});

		const toggleLayerVisibility = () => {
			const isVisible = layerDiv.classList.contains('visible');
			const isActive = layerDiv.classList.contains('active');
			if (isVisible || isActive) {
				layerDiv.classList.remove('visible');
				layerDiv.classList.remove('active');
				layerDiv.classList.add('hidden-layer');
				layerEyeImg.src = this.imageMap['eyeclosed'];
			} else {
				layerDiv.classList.remove('hidden-layer');
				layerDiv.classList.add('visible');
				layerEyeImg.src = this.imageMap['eyeopen'];
			}
		};

		const highlightLayer = () => {
			layers.forEach(({ layerDiv: layer }) => {
				if (layer.classList.contains('active')) {
					// const isVisible
					layer.classList.remove('active');
					layer.classList.add('visible');
				}
			});
			if (layerDiv.classList.contains('hidden-layer')) {
				layerDiv.classList.remove('hidden-layer');
				layerEyeImg.src = this.imageMap['eyeopen'];
			}
			layerDiv.classList.remove('visible');
			layerDiv.classList.add('active');
		};

		layerEyeButton.onmousedown = () => {
			toggleLayerVisibility();
			// toggle layer visibility
			taro.client.emit('hide-layer', index);
		};

		layerText.onmousedown = () => {
			highlightLayer();
			// switch layer
			taro.client.emit('switch-layer', index);
		};

		layerDiv.appendChild(layerEyeButton);
		layerDiv.appendChild(layerText);

		return { layerDiv, highlightLayer, toggleLayerVisibility, index };
	}

	showMapEditor() {
		if (this.isButtonsRendered) {
			// show the buttons
			const mapEditorButtonsContainer = document.getElementById('map-buttons-container');
			if (mapEditorButtonsContainer) {
				mapEditorButtonsContainer.style.display = 'block';
			}
		} else {
			// create a new div and add buttons to it.
			this.isButtonsRendered = true;

			const gameDiv = document.getElementById('game-div');

			if (gameDiv) {
				// add mapEditorStyle to the document
				const style = document.createElement('style');
				style.textContent = this.mapEditorStyle;

				document.head.appendChild(style);

				const mapEditorButtonsContainer = document.createElement('div');
				mapEditorButtonsContainer.id = 'map-buttons-container';

				const tooltipContainer = document.createElement('div');
				tooltipContainer.id = 'map-buttons-tooltip';
				this.tooltipLabelNode = document.createElement('div');
				this.tooltipLabelNode.className = 'tooltip-label';

				this.tooltipTextNode = document.createElement('div');
				this.tooltipTextNode.className = 'tooltip-text';

				tooltipContainer.appendChild(this.tooltipLabelNode);
				tooltipContainer.appendChild(this.tooltipTextNode);

				mapEditorButtonsContainer.appendChild(tooltipContainer);

				const mapEditorButtonsDiv = document.createElement('div');
				mapEditorButtonsDiv.id = 'map-buttons-div';
				mapEditorButtonsDiv.className = 'map-buttons-div';
				mapEditorButtonsDiv.style.display = 'block';

				mapEditorButtonsDiv.appendChild(this.createMapButtonTitle({ title: 'Tools' }));

				const toolsButtonDiv = document.createElement('div');
				toolsButtonDiv.className = 'tools-button-div';

				this.toolsButtons.set(
					'stamp',
					this.createMapButton({
						tooltipLabel: 'Stamp Brush (B)',
						tooltipText: 'LMB: place selected tiles. RMB: copy tiles',
						image: 'stamp',
						className: 'tool-button',
						onClick: () => this.highlightToolsButton('stamp', 'brush'),
					})
				);

				this.toolsButtons.set(
					'eraser',
					this.createMapButton({
						tooltipLabel: 'Eraser (E)',
						tooltipText: 'delete tiles from selected layer',
						image: 'eraser',
						className: 'tool-button',
						onClick: () => this.highlightToolsButton('eraser', 'empty-tile'),
					})
				);

				this.toolsButtons.set(
					'fill',
					this.createMapButton({
						tooltipLabel: 'Bucket Fill (F)',
						tooltipText: 'fill an area with the selected tile',
						image: 'fill',
						className: 'tool-button',
						onClick: () => this.highlightToolsButton('fill', 'fill'),
					})
				);
				this.toolsButtons.set(
					'cursor',
					this.createMapButton({
						tooltipLabel: 'Cursor Tool (C)',
						tooltipText: 'interact with regions and entities',
						image: 'cursor',
						className: 'tool-button active',
						onClick: () => this.highlightToolsButton('cursor', 'cursor'),
					})
				);
				this.toolsButtons.set(
					'region',
					this.createMapButton({
						tooltipLabel: 'Region Tool (R)',
						tooltipText: 'draw new region',
						image: 'region',
						className: 'tool-button',
						onClick: () => this.highlightToolsButton('region', 'draw-region'),
					})
				);
				this.toolsButtons.set(
					'entity',
					this.createMapButton({
						tooltipLabel: 'Entities Tool (A)',
						tooltipText: 'LMB: Place selected Entity on the Map',
						image: 'entity',
						className: 'tool-button',
						onClick: () => this.highlightToolsButton('entity', 'add-entities'),
					})
				);
				this.toolsButtons.set(
					'clear',
					this.createMapButton({
						tooltipLabel: 'Clear Layer (L)',
						tooltipText: 'clear selected layer',
						image: 'clear',
						className: 'tool-button',
						onClick: () => this.taroEmit('clear'),
					})
				);
				this.toolsButtons.set(
					'save',
					this.createMapButton({
						tooltipLabel: 'Save Map (S)',
						tooltipText: 'save all changes',
						image: 'save',
						// className: 'tool-button',
						onClick: () => this.taroEmit('save'),
					})
				);

				this.toolsButtons.forEach((button) => {
					toolsButtonDiv.appendChild(button);
				});

				const blankSpace = document.createElement('div');
				blankSpace.style.width = '100%';
				// black space
				toolsButtonDiv.appendChild(blankSpace);

				toolsButtonDiv.appendChild(
					this.createMapButton({
						tooltipLabel: 'Undo (ctrl-z)',
						tooltipText: 'undo',
						image: 'undo',
						width: 43,
						onClick: () => this.taroEmit('undo'),
					})
				);
				toolsButtonDiv.appendChild(
					this.createMapButton({
						tooltipLabel: 'Redo (ctrl-shift-z | ctrl-y)',
						tooltipText: 'redo',
						image: 'redo',
						width: 43,
						onClick: () => this.taroEmit('redo'),
					})
				);

				mapEditorButtonsDiv.appendChild(toolsButtonDiv);

				const brushSizeDivTitle = this.createMapButtonTitle({ title: 'Brush Size' });
				brushSizeDivTitle.style.marginTop = '4px';
				mapEditorButtonsDiv.appendChild(brushSizeDivTitle);
				const brushSizeDiv = document.createElement('div');
				brushSizeDiv.className = 'brush-size-div';

				brushSizeDiv.appendChild(
					this.createMapButton({
						tooltipLabel: 'Decrease Brush Size',
						tooltipText: 'decrease brush size',
						text: '-',
						onClick: () => {
							this.brushSize = Math.max(this.brushSize - 1, 1);
							const currentBrushSize = document.querySelector(
								'.current-brush-size > .map-editor-button-text'
							) as HTMLDivElement;
							if (currentBrushSize) {
								currentBrushSize.innerText = this.brushSize.toString();
							}
							this.taroEmit('decrease-brush-size');
						},
					})
				);
				brushSizeDiv.appendChild(
					this.createMapButton({
						tooltipLabel: 'Current Brush Size',
						tooltipText: 'current brush size',
						text: '1',
						className: 'current-brush-size',
					})
				);
				brushSizeDiv.appendChild(
					this.createMapButton({
						tooltipLabel: 'Increase Brush Size',
						tooltipText: 'increase brush size',
						text: '+',
						onClick: () => {
							this.brushSize = Math.min(this.brushSize + 1, 50);
							const currentBrushSize = document.querySelector(
								'.current-brush-size > .map-editor-button-text'
							) as HTMLDivElement;
							if (currentBrushSize) {
								currentBrushSize.innerText = this.brushSize.toString();
							}
							this.taroEmit('increase-brush-size');
						},
					})
				);

				mapEditorButtonsDiv.appendChild(brushSizeDiv);

				const layersSectionTitle = this.createMapButtonTitle({ title: 'Layers' });
				layersSectionTitle.style.marginTop = '4px';
				mapEditorButtonsDiv.appendChild(layersSectionTitle);

				// scene.gameScene.tilemapLayers.forEach((layer, index) => {
				// 	if (taro.game.data.map.layers[index].type === 'tilelayer' && taro.game.data.map.layers[index].data) {
				// 		this.layerButtonSection.addButton(new DevToolButton(this, layer.name, `Layer (${index})`, `select the ${layer.name} layer`, null, w * 0.7, (h * 0.75 + s) * (layersCount - 1 - layerIndex), w * 2.5, h * 0.75, toolButtonsContainer, this.switchLayer.bind(this), index), this.layerButtons);
				// 		this.layerButtonSection.addButton(new DevToolButton(this, '', `Layer visibility (shift-${index})`, `show/hide ${layer.name} layer`, 'eyeopen', 0, (h * 0.75 + s) * (layersCount - 1 - layerIndex), w, h * 0.75, toolButtonsContainer, this.hideLayer.bind(this), index), this.layerHideButtons);
				// 		layerIndex++;
				// 	} else {
				// 		this.layerButtons.push(null);
				// 		this.layerHideButtons.push(null);
				// 	}
				// });
				const layersSectionDiv = document.createElement('div');
				layersSectionDiv.className = 'layers-section-div';

				// taro.renderer.scene.scenes[0].tilemapLayers
				if (taro.game.data.map.layers?.length) {
					const layers = [];
					let layerIndex = 0;

					for (let i = taro.game.data.map.layers.length - 1; i >= 0; i--) {
						const layer = taro.game.data.map.layers[i];
						if (layer.type === 'tilelayer' && layer.data) {
							// layersSectionDiv.appendChild(this.createLayerButton({ layer, index: i }));
							layers.push(this.createLayerButton({ layer, index: i, layers, layerIndex }));
							layerIndex++;
						}
					}

					layers.forEach((layer) => {
						const { layerDiv } = layer;
						layersSectionDiv.appendChild(layerDiv);
					});

					const lastLayer = layers.at(-1);
					if (lastLayer) {
						lastLayer.highlightLayer();
					}
				}

				mapEditorButtonsDiv.appendChild(layersSectionDiv);

				mapEditorButtonsContainer.appendChild(mapEditorButtonsDiv);

				gameDiv.appendChild(mapEditorButtonsContainer);
			}
		}
	}

	taroEmit(name) {
		if (name) {
			taro.client.emit(name);
		}
	}

	hideMapEditor() {
		const mapEditorButtonsContainer = document.getElementById('map-buttons-container');
		if (mapEditorButtonsContainer) {
			mapEditorButtonsContainer.style.display = 'none';
		}
	}

	highlightToolsButton = (key, eventName) => {
		this.highlightModeButton(key);
		this.taroEmit(eventName);
	};

	highlightModeButton(key) {
		// highlight the mode button
		this.toolsButtons.forEach((button) => {
			button.classList.remove('active');
		});
		this.toolsButtons.get(key).classList.add('active');
	}

	imageMap = {
		cursor: 'https://cache.modd.io/asset/spriteImage/1666276041347_cursor.png',
		entity: 'https://cache.modd.io/asset/spriteImage/1686840222943_cube.png',
		region: 'https://cache.modd.io/asset/spriteImage/1666882309997_region.png',
		stamp: 'https://cache.modd.io/asset/spriteImage/1666724706664_stamp.png',
		eraser: 'https://cache.modd.io/asset/spriteImage/1666276083246_erasergap.png',
		eyeopen: 'https://cache.modd.io/asset/spriteImage/1669820752914_eyeopen.png',
		eyeclosed: 'https://cache.modd.io/asset/spriteImage/1669821066279_eyeclosed.png',
		fill: 'https://cache.modd.io/asset/spriteImage/1675428550006_fill_(1).png',
		clear: 'https://cache.modd.io/asset/spriteImage/1681917489086_layerClear.png',
		save: 'https://cache.modd.io/asset/spriteImage/1681916834218_saveIcon.png',
		redo: 'https://cache.modd.io/asset/spriteImage/1686899810953_redo.png',
		undo: 'https://cache.modd.io/asset/spriteImage/1686899853748_undo.png',
		settings: 'https://cache.modd.io/asset/spriteImage/1707131801364_download.png',
	};

	mapEditorStyle = `
		#map-buttons-container {
			position: fixed;
			top: 0px;
			right: 150px;
		  	font-family: 'Rubik';
		}
		.map-buttons-div {
			position: absolute;
			top: 145px;
			// right: 20px;
			right: 150px;	
			width: 90px;
			height: 100%;
		}
		.map-buttons-title {
			color: black;
			background-color: #bababa;
			font-size: 14px;
			border-radius: 4px;
			text-align: center;
			font-weight: 700;
			margin-bottom: 1px;
		}
	
		.map-editor-button {
			border: 1px solid black;
			padding: 2px;
			background: white;
			border-radius: 4px;
		}
	
		.map-editor-button img, .layer-eye-button img  {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
	
		.tools-button-div, .brush-size-div {
			display: flex;
			flex-wrap: wrap;
			gap: 2px;
			justify-content: space-between;
		}

		.tool-button.active {
			background: #6690FF;
		}

		.layers-section-div {
			display: flex;
			flex-direction: column;
			gap: 2px;
			width: 100%;
		}

		.layer-button-div {
			display: flex;
			background: white;
			border: 1px solid black;
			border-radius: 4px;
			gap: 2px;
			width: 100%;
			height: 20px;
			border-radius: 6px;
    		overflow: hidden;
		}

		.layer-button-div.visible {
			background: white;
		}

		.layer-button-div.active {
			background: #6690FF;
		}

		.layer-button-div.hidden-layer {
			background: #949494;
		}

		.layer-eye-button {
			padding: 0px 4px;
			border: 1px solid black;
			border-radius: 4px;
			background: inherit;
		}

		.layer-text {
			flex: 1;
			display: flex;
			align-items: center;
			font-size: 14px;
			font-weight: 500;
			border-width: 0px;
			background: inherit;
		}

		#map-buttons-tooltip {
			position: absolute;
			top: 37px;
			right: 160px;

			display: none;
			flex-direction: column;
			align-items: center;
			gap: 3px;

			width: max-content;
			height: max-content;

			background: white;
			color: black;
			padding: 15px 14px;
		}

		.tooltip-label {
			font-weight: 700;
    		font-size: 15px;
		}

		.tooltip-text {
			font-size: 14px;
		}
	`;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = MapEditorUI;
}
