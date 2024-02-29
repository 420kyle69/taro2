class MapEditorUI {
	isButtonsRendered = false;
	toolsButtons = new Map();
	brushSize = 1;
	tooltipLabelNode = null;
	tooltipTextNode = null;
	isHoveringOverMapButton = false;
	layers = new Map();
	activeTool = 'cursor';

	constructor() {
		taro.client.on('enterMapTab', () => {
			this.showMapEditor();
		});

		taro.client.on('leaveMapTab', () => {
			this.hideMapEditor();
		});

		taro.client.on('update-tooltip', ({ label, text }) => {
			if (!this.isHoveringOverMapButton) {
				const element = taro.client.getCachedElementById('map-buttons-tooltip');
				if (element) {
					element.style.display = 'flex';
					this.tooltipLabelNode.innerText = label;
					this.tooltipTextNode.innerText = text;
				}
			}
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

	showLayer(layerDiv, layerEyeImg) {
		layerDiv.classList.remove('hidden-layer');
		layerDiv.classList.add('visible');
		layerEyeImg.src = this.imageMap['eyeopen'];
	}

	createLayerButton({ layer, index, layerIndex }) {
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
			let state = false;
			const isVisible = layerDiv.classList.contains('visible');
			const isActive = layerDiv.classList.contains('active');
			if (isVisible || isActive) {
				layerDiv.classList.remove('visible');
				layerDiv.classList.remove('active');
				layerDiv.classList.add('hidden-layer');
				layerEyeImg.src = this.imageMap['eyeclosed'];
				state = true;
			} else {
				this.showLayer(layerDiv, layerEyeImg);
				state = false;
			}

			taro.client.emit('hide-layer', { index, state });
		};

		const switchLayer = () => {
			this.layers.forEach(({ layerDiv: layer }) => {
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
		};

		layerText.onmousedown = () => {
			switchLayer();
			// switch layer
			taro.client.emit('switch-layer', index);
		};

		layerDiv.appendChild(layerEyeButton);
		layerDiv.appendChild(layerText);

		return { layerDiv, layerEyeImg, switchLayer, toggleLayerVisibility, index };
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

				this.activeTool = 'cursor';

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
							this.decreaseBrushSize(true);
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
							this.increaseBrushSize(true);
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
					let layerIndex = 0;
					let lastKey = -1;

					for (let i = taro.game.data.map.layers.length - 1; i >= 0; i--) {
						const layer = taro.game.data.map.layers[i];
						if (layer.type === 'tilelayer' && layer.data) {
							// layersSectionDiv.appendChild(this.createLayerButton({ layer, index: i }));
							this.layers.set(i, this.createLayerButton({ layer, index: i, layerIndex }));
							layerIndex++;
							lastKey = i;
						}
					}

					this.layers.forEach((layer) => {
						const { layerDiv } = layer;
						layersSectionDiv.appendChild(layerDiv);
					});

					const lastLayer = this.layers.get(lastKey);
					if (lastLayer) {
						lastLayer.switchLayer();
					}
				}

				mapEditorButtonsDiv.appendChild(layersSectionDiv);

				const switchDiv = document.createElement('div');
				switchDiv.className = 'map-switch-div';
				switchDiv.style.marginTop = '8px';

				switchDiv.appendChild(
					this.createMapButton({
						tooltipLabel: 'Palette',
						tooltipText: 'show/hide palette',
						text: 'palette',
						onClick: () => taro.client.emit('palette-toggle'),
						width: 60,
					})
				);

				switchDiv.appendChild(
					this.createMapButton({
						tooltipLabel: 'Settings',
						tooltipText: 'open map settings',
						image: 'settings',
						onClick: () => taro.client.emit('setting'),
					})
				);

				mapEditorButtonsDiv.appendChild(switchDiv);

				mapEditorButtonsContainer.appendChild(mapEditorButtonsDiv);

				const changePaletteDiv = document.createElement('div');
				changePaletteDiv.className = 'change-palette-div';

				changePaletteDiv.appendChild(
					this.createMapButton({
						tooltipLabel: '+',
						tooltipText: 'zoom in (+)',
						text: '+',
						onClick: () => taro.client.emit('palette-zoom', -1),
					})
				);

				changePaletteDiv.appendChild(
					this.createMapButton({
						tooltipLabel: '-',
						tooltipText: 'zoom out (-)',
						text: '-',
						onClick: () => taro.client.emit('palette-zoom', +1),
					})
				);

				mapEditorButtonsContainer.appendChild(changePaletteDiv);

				gameDiv.appendChild(mapEditorButtonsContainer);

				this.addKeyBindings();
			}
		}
	}

	decreaseBrushSize = (emit) => {
		this.brushSize = Math.max(this.brushSize - 1, 1);
		const currentBrushSize = document.querySelector('.current-brush-size > .map-editor-button-text') as HTMLDivElement;
		if (currentBrushSize) {
			currentBrushSize.innerText = this.brushSize.toString();
		}

		if (emit) {
			this.taroEmit('decrease-brush-size');
		}
	};

	increaseBrushSize = (emit) => {
		this.brushSize = Math.min(this.brushSize + 1, 50);
		const currentBrushSize = document.querySelector('.current-brush-size > .map-editor-button-text') as HTMLDivElement;
		if (currentBrushSize) {
			currentBrushSize.innerText = this.brushSize.toString();
		}

		if (emit) {
			this.taroEmit('increase-brush-size');
		}
	};

	addKeyBindings() {
		window.addEventListener('keydown', (event) => {
			if (taro.developerMode.active && taro.developerMode.activeTab === 'map') {
				if (event.key === 'Tab') {
					const isInputModalPresent = taro.developerMode.checkIfInputModalPresent();
					if (!isInputModalPresent) {
						event.preventDefault();
						this.taroEmit('palette-toggle');
					}
				}
				if (event.key === '+') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.increaseBrushSize(true);
					}
				}
				if (event.key === '-') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.decreaseBrushSize(true);
					}
				}
				if (event.key === 'c') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.highlightToolsButton('cursor', 'cursor');
					}
				}
				if (event.key === 'r') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.highlightToolsButton('region', 'draw-region');
					}
				}
				if (event.key === 'b') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.highlightToolsButton('stamp', 'brush');
					}
				}
				if (event.key === 'e') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.highlightToolsButton('eraser', 'empty-tile');
					}
				}
				if (event.key === 'f') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.highlightToolsButton('fill', 'fill');
					}
				}
				if (event.key === 'l') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.taroEmit('clear');
					}
				}
				if (event.key === 's') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.taroEmit('save');
					}
				}
				if (event.key === 'a') {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.highlightToolsButton('entity', 'add-entities');
					}
				}
				['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((value) => {
					if (event.key === value) {
						if (!taro.developerMode.checkIfInputModalPresent()) {
							const layer = this.layers.get(parseInt(value));
							if (layer) {
								layer.switchLayer();
								taro.client.emit('switch-layer', parseInt(value));
							}
						}
					}
				});

				if (event.key === 'z' && event.ctrlKey) {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.taroEmit('undo');
					}
				}
				if ((event.key === 'z' && event.ctrlKey && event.shiftKey) || (event.key === 'y' && event.ctrlKey)) {
					if (!taro.developerMode.checkIfInputModalPresent()) {
						this.taroEmit('redo');
					}
				}
			}
		});

		window.addEventListener('wheel', (event) => {
			if (taro.developerMode.active && taro.developerMode.activeTab === 'map') {
				const isInputModalPresent = taro.developerMode.checkIfInputModalPresent();
				if (!isInputModalPresent) {
					if (event.altKey && this.activeTool !== 'fill') {
						if (event.deltaY > 0) {
							this.decreaseBrushSize(true);
						} else if (event.deltaY < 0) {
							this.increaseBrushSize(true);
						}
					}
				}
			}
		});
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

		this.layers.forEach(({ layerDiv, layerEyeImg }) => {
			this.showLayer(layerDiv, layerEyeImg);
		});
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
		this.activeTool = key;
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
		
	`;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = MapEditorUI;
}
