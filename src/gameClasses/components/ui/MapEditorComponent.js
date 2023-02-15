var MapEditorComponent = TaroEntity.extend({
	classId: 'MapEditorComponent',
	componentId: 'mapEditor',

	init: function () {
		// map editor global variables
		var self = this;
		lastCurSelectedTileIndex = 1;
		curSelectedTileIndex = 0;
		showAllLayers = false;
		curLayerPainting = 'floor';
		addNewRegion = false;
		mouseIsDown = false;
		this.mouseDownOnMiniMap = false;
		addRegionCordinates = {};
		rightMouseKey = 3;
		this.lastXPosition = 0;
		this.lastYPosition = 0;
		this.counter = 0;
		this.isAddEntitiesEnabled = false;
		this.isMapChangeAndNotSaved = false;
		self.selectEntities = true;
		this.entity = {
			height: 100,
			width: 100,
			type: 'unitTypes',
			entity: '',
			rotation: 0,
			x: 0,
			y: 0
		};
		this.undo = [];
		this.redo = [];

		// scale percentage in proportion to the world
		var miniMapScale = 0.05;

		$(document).on('click', function (e) {
			var sandboxKeys = ['map-settings', ',map-save'];

			if (sandboxKeys.includes(e.target.id)) {
				self.removeSelectedClass();
				e.preventDefault();
			}
		});

		$(document).on('keydown', function (e) {
			var isModalOpened = $('.modal').hasClass('show');
			var isAnyInputFocused = $('input').is(':focus');
			// only change shortcuts when map tab is selected and no modal is in open state
			if ($('#mapEditor').hasClass('active') && !isModalOpened && !isAnyInputFocused) {
				var enterChar = String.fromCharCode(e.keyCode).toString();
				enterChar = enterChar.toLowerCase();
				self.mapShortcuts(e, enterChar);
			}
		});

		$('#entity-delete').on('click', function (e) {
			e.preventDefault();
			var index = $('[name=entity-index]').val();
			self.upsertMapEntities({}, parseInt(index), 'delete');
		});
		$('#entities-form').on('submit', function (e) {
			e.preventDefault();
			var formValue = $(this).serializeArray();
			var entity = {};
			formValue.forEach(function (input) {
				var name = input.name.replace('entity-', '');
				entity[name] = input.value;
			});
			if (entity.isEdit === 'true') {
				self.upsertMapEntities(entity, parseInt(entity.index));
			} else {
				self.entity = entity;
			}
			$('#entities-modal').modal('hide');
		});

		this.listeners = {
			eraser: function (e, entity) {
				entity = entity || this;
				addNewRegion = false;
				self.isAddEntitiesEnabled = false;
				self.selectEntities = false;
				if (curSelectedTileIndex != 0) {
					lastCurSelectedTileIndex = curSelectedTileIndex;
				}
				curSelectedTileIndex = 0;

				self.addSelectedClass(entity, true);
				self.removeSelectedClass('eraser');
			},
			brush: function (e, entity) {
				entity = entity || this;
				addNewRegion = false;
				self.isAddEntitiesEnabled = false;
				self.selectEntities = false;
				curSelectedTileIndex = lastCurSelectedTileIndex;

				self.addSelectedClass(entity, true);
				self.removeSelectedClass('brush');
			},
			'clear-layer': function (e, entity) {
				entity = entity || this;
				addNewRegion = false;
				self.isAddEntitiesEnabled = false;
				self.selectEntities = false;

				var promise = swal({
					text: 'Are you sure you want to clear current selected layer?',
					type: 'warning',
					showCancelButton: true,
					confirmButtonText: 'Yes'
				});

				promise.then((result) => {
					if (result.value) {
						var lIndex = undefined;
						var currentLayer = taro.game.data.map.layers.find(function (layer, key) {
							lIndex = key;
							return layer.name == curLayerPainting;
						});

						for (let i = 0; i < taro.map.data.layers[lIndex].data.length; i++) {
							taro.map.data.layers[lIndex].data[i] = 0;
						}

						taro.layersById[curLayerPainting].clearMap();
						taro.layersById[curLayerPainting].cacheForceFrame();
						if (autoSave) {
							taro.mapEditor.isMapChangeAndNotSaved = true;
						} else {
							window.updateSandboxMapLayers(lIndex, taro.map.data.layers[lIndex].data);
						}
					}
				});
			},
			mapsave: function (e, entity) {
				entity = entity || this;
				taro.isMapUpdated = false;
				self.isAddEntitiesEnabled = false;
				self.selectEntities = false;
				taro.mapEditor.isMapChangeAndNotSaved = false;
				var map = _.cloneDeep(taro.map.data);
				map.tilewidth = taro.scaleMapDetails.originalTileWidth;
				map.tileheight = taro.scaleMapDetails.originalTileHeight;
				window.saveMap(map);
			},
			add_region: function (e, entity) {
				entity = entity || this;
				addNewRegion = !addNewRegion;
				self.isAddEntitiesEnabled = false;
				self.selectEntities = false;

				self.addSelectedClass(entity);
				self.removeSelectedClass('add_region');
			},
			fill: function (e, entity) {
				entity = entity || this;
				addNewRegion = false;
				self.isAddEntitiesEnabled = false;
				self.selectEntities = false;
				curSelectedTileIndex = lastCurSelectedTileIndex;
				if (!curSelectedTileIndex) {
					curSelectedTileIndex = 1;
				}

				self.addSelectedClass(entity, true);
				self.removeSelectedClass('fill');
			},
			add_entities: function (e, entity) {
				entity = entity || this;
				self.isAddEntitiesEnabled = true;
				addNewRegion = false;
				self.selectEntities = false;

				self.addSelectedClass(entity, true);
				self.removeSelectedClass('add_entities');
				self.openEntitiesModal(self.entity);
			},
			select_entity: function (e, entity) {
				entity = entity || this;
				self.selectEntities = true;
				addNewRegion = false;
				self.isAddEntitiesEnabled = false;

				self.addSelectedClass(entity, true);
				self.removeSelectedClass('select_entity');
			}
		};

		window.addEventListener('beforeunload', function (event) {
			if (autoSave && taro.mapEditor.isMapChangeAndNotSaved) {
				event.returnValue = 'You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?';
				return true;
			}
		});
	},
	undoMap (e) {
		var mapData = this.undo.pop();
		if (!mapData) return;

		taro.mapEditor.redo.push(JSON.parse(JSON.stringify(taro.map.data)));
		mapData = JSON.parse(JSON.stringify(mapData));
		taro.map.data = JSON.parse(JSON.stringify(mapData));

		this.applyDataToMap(taro.map.data);
		if (autoSave) {
			taro.mapEditor.isMapChangeAndNotSaved = true;
		} else {
			window.updateSandboxMapLayers(lIndex, taro.map.data.layers[lIndex].data);
		}
	},
	redoMap () {
		var mapData = taro.mapEditor.redo.pop();
		if (!mapData) return;

		taro.mapEditor.undo.push(JSON.parse(JSON.stringify(taro.map.data)));
		mapData = JSON.parse(JSON.stringify(mapData));
		taro.map.data = JSON.parse(JSON.stringify(mapData));

		this.applyDataToMap(taro.map.data);
		if (autoSave) {
			taro.mapEditor.isMapChangeAndNotSaved = true;
		} else {
			window.updateSandboxMapLayers(lIndex, taro.map.data.layers[lIndex].data);
		}
	},
	applyDataToMap (mapData) {
		var mapHeight = mapData.height;
		var mapWidth = mapData.width;
		var z;

		for (var layer in taro.layersById) {
			var layerIndex = this.getLayerIndexFromName(layer);
			layerData = mapData.layers[layerIndex];
			layerData = layerData.data;

			if (taro.layersById[layer].type === 'tilelayer') {
				for (y = 0; y < mapHeight; y++) {
					for (x = 0; x < mapWidth; x++) {
						z = x + (y * mapWidth);

						if (layerData[z] > 0 && layerData[z] !== 2147483712) {
							if (taro.isClient) {
								// Paint the tile
								currentTexture = layerData[z];
								if (currentTexture) {
									taro.layersById[layer].paintTile(x, y, this.getTilesheetData().tindex, currentTexture);
									var tileIndex = (x) + ((y) * taro.map.data.width);
									taro.map.data.layers[layerIndex].data[tileIndex] = currentTexture;
								}
							}
						}
					}
				}
				taro.layersById[layer].cacheForceFrame();
			}
		}
	},
	drawTile () {
		// main canvas tile
		taro.mapEditor.tileMap = new TaroTileMap2d()
			.id('Tile_Map')
			.tileWidth(taro.scaleMapDetails.originalTileWidth)
			.tileHeight(taro.scaleMapDetails.originalTileHeight)
			.gridSize(taro.game.data.map.width, taro.game.data.map.height)
			.hoverColor('#6000ff70' || '#6000ff')
			.layer(5)
			.depth(5)
			.drawGrid(1)
			.drawBounds(false)
			.mount(taro.client.objectScene);

		this.generateTilesheet();
	},
	generateTilesheet: function () {
		taro.mapEditor.tilesheet = new TaroTileMap2d()
			.id('Tilesheet_Map')
			.layer(10)
			.drawGrid(true)
			.drawMouse(true)
			.hoverColor('#6000ff70' || '#6000ff')
			.highlightOccupied(true)
			.drawMouse(true)
			.mouseUp(function () {
				if (taro.game.data.isDeveloper) {
					var tilePosition = taro.mapEditor.tilesheet.pointToTile(taro.client.vp2.mousePos());
					var gridX = taro.mapEditor.tilesheet._gridSize.x;

					tileIndex = tilePosition.x + (tilePosition.y * gridX) + 1;

					curSelectedTileIndex = tileIndex;
					lastCurSelectedTileIndex = curSelectedTileIndex;
				}
			})
			.mount(taro.client.tilesheetScene);

		var callbackForTexture = function () {
			// console.log(taro.client.tilesheetTexture._sizeX, taro.client.tilesheetTexture._sizeY)
			var width = taro.client.tilesheetTexture._sizeX / 4;
			var height = taro.client.tilesheetTexture._sizeY / 4;
			if (taro.client.tilesheetTexture._sizeX < 400 && taro.client.tilesheetTexture._sizeX < 400) {
				width = taro.client.tilesheetTexture._sizeX;
				height = taro.client.tilesheetTexture._sizeY;
			}

			taro.mapEditor.texture = new TaroEntity()
				.texture(taro.client.tilesheetTexture)
				.drawMouse(true)
				.mount(taro.client.tilesheetScene);

			taro.mapEditor.texture
				.width(taro.client.tilesheetTexture._sizeX)
				.height(taro.client.tilesheetTexture._sizeY)
				.scaleTo(width / taro.client.tilesheetTexture._sizeX, height / taro.client.tilesheetTexture._sizeY, 0);

			taro.mapEditor.tilesheet
				.tileWidth(taro.game.data.map.tilewidth * taro.mapEditor.texture._scale.x)
				.tileHeight(taro.game.data.map.tileheight * taro.mapEditor.texture._scale.y)
				.gridSize(taro.client.tilesheetTexture._sizeX / taro.game.data.map.tilewidth, taro.client.tilesheetTexture._sizeY / taro.game.data.map.tileheight);

			taro.client.vp2
				.width(width)
				.height(height)
				.camera.translateTo(width / 2, height / 2, 0);

			taro.mapEditor.texture.translateTo(width / 2, height / 2, 0);
		};

		taro.client.tilesheetTexture = new TaroTexture(taro.game.data.map.tilesets[0].image, callbackForTexture);
	},
	mapShortcuts: function (e, char) {
		if (!taro.game.data.isDeveloper) return;
		switch (char) {
			case 'a':
				this.listeners.add_entities(e, $('#add_entities'));
				break;
			case 'b':
				this.listeners.brush(e, $('#brush'));
				break;
			case 'c':
				this.listeners['clear-layer'](e, $('#clear-layer'));
				break;
			case 'e':
				this.listeners.eraser(e, $('#eraser'));
				break;
			case 'f':
				this.listeners.fill(e, $('#fill'));
				break;
			case 'r':
				this.listeners.add_region(e, $('#add_region'));
				break;
			case 's':
				this.listeners.select_entity(e, $('#select_entity'));
				break;
			case 'z':
				if (e.ctrlKey) {
					this.undoMap(e);
				}
				break;
			case 'y':
				if (e.ctrlKey) {
					this.redoMap(e);
				}
				break;
		}
	},
	createMiniMap: function () {
		// scale percentage in proportion to the world
		var miniMapScale = 0.05;
		var self = this;
		self.divExcludedFromPaintingTileIds = ['eraser', 'brush', 'add_region', 'fill', 'gameEditor_buttons', 'gameEditor_menu', 'editor-div', 'layer_menu'];
		self.layersIds = ['li_trees_list', 'li_walls_list', 'li_floor2_list', 'li_floor_list', 'layer_menu', 'li_floor', 'li_trees', 'li_walls', 'li_floor2'];
		taro.client.minimapVp = new TaroViewport()
			.id('minimapVp')
			.layer(7)
			.width(200)
			.height(200)
			.autoSize(false)
			.scene(taro.client.mainScene)
			.drawBounds(true)
			.mouseDown(function (event, evc) {
				// console.log(self.checkIfClickedMiniMap(event.pageX, event.pageY))
				if (self.checkIfClickedMiniMap(event.pageX, event.pageY)) {
					self.mouseDownOnMiniMap = true;
					self.positionViewPortRect();
				}
			})
			.mouseMove(function (event, evc) {
				if (self.mouseDownOnMiniMap && event.which === 1) {
					self.positionCameraOnMiniClick(event.pageX, event.pageY);
				}
			})
			.mouseUp(function () {
				self.mouseDownOnMiniMap = false;
			})
			.borderColor('#0bcc38')
			.borderWidth('4px')
			.mount(taro);

		taro.client.minimapVp.camera._scale.x = miniMapScale;
		taro.client.minimapVp.camera._scale.y = miniMapScale;

		// position when the window resizes
		$(window).resize(function () {
			self.positionMiniMap(miniMapScale);
			self.positionViewPortRect();
		});

		$(document).on('mousemove', function (event) {
			self.updateWorldXYCoords(event.pageX, event.pageY);
			var drawMouse = false;
			if (self.selectEntities || self.divExcludedFromPaintingTileIds.includes(event.target.id) || self.layersIds.includes(event.target.id)) {
				// do nothing
			} else {
				if (($('#mapEditor').hasClass('active')) && (self.checkBrushToolSelected() || $('#add_region').hasClass('editordiv-hover'))) {
					if (taro.game.data.isDeveloper && !addNewRegion) {
						self.positionCurTextureBox(event);
						drawMouse = true;
					} else {
						var target = event.target;
						if (event.which === 1 && !self.mouseDownOnMiniMap &&
							target.tagName.toLowerCase() == 'canvas' &&
							target.parentElement.id == 'game-div') {
							self.drawingRegion = true;
							self.drawNewRegion(event);
						}
						drawMouse = false;
					}
				} else {
					drawMouse = false;
				}
			}
			if (taro.mapEditor.tileMap && drawMouse != taro.mapEditor.tileMap._drawMouse) {
				taro.mapEditor.tileMap.drawMouse(drawMouse);
			}
		});

		$(document).on('mouseup', function (event) {
			if (self.selectEntities) {
				return;
			}
			this.lastXPosition = event.pageX;
			this.lastYPosition = event.pageY;
			mouseIsDown = false;
			if (addNewRegion) {
				self.drawingRegion = false;
				self.saveNewRegion(event);
			}
		});

		$('canvas').on('mousedown', function (event) {
			if (($('#mapEditor').hasClass('active')) && self.checkBrushToolSelected() && !self.layersIds.includes(event.target.id)) {
				if (taro._selectedViewport.id() === 'vp1' && event.which === 1 && !taro.mapEditor.checkIfClickedMiniMap(event.pageX, event.pageY)) {
					taro.mapEditor.undo.push(JSON.parse(JSON.stringify(taro.map.data)));
				}
			}
		});

		$('canvas').on('click', function (event) {
			if (self.selectEntities) {
				return;
			}
			if (self.isAddEntitiesEnabled) {
				self.entity.x = self.mouseCoordinatesWRTVp.x;
				self.entity.y = self.mouseCoordinatesWRTVp.y;
				let bodies = taro.game.data[self.entity.type] && taro.game.data[self.entity.type][self.entity.entity].bodies;
				if (bodies) {
					let defaultBody = _.find(bodies, function (value, key) {
						if (key.toLowerCase() === 'default' || value.name.toLowerCase() === 'default')
							return true;
						return false;
					}) || {};
					self.entity.width = defaultBody.width || 100;
					self.entity.height = defaultBody.height || 100;
				}
				self.upsertMapEntities(self.entity);
				return;
			}
			mouseIsDown = true;
			if (($('#mapEditor').hasClass('active')) && mouseIsDown) {
				if (addNewRegion) {
					if (!self.checkIfClickedMiniMap(event.pageX, event.pageY) && event.target.parentElement.id == 'game-div') {
						self.drawNewRegion(event);
					}
				} else {
					// && !$('#tile-selection-modal').hasClass('show')
					if (($('#mapEditor').hasClass('active')) && self.checkBrushToolSelected() && !self.layersIds.includes(event.target.id)) {
						taro.mapEditor.mouseDown = true;
						self.mouseDownEditor(event);
					}
				}
			}
		});
	},
	checkBrushToolSelected: function () {
		return $('#brush').hasClass('editordiv-hover') || $('#open-pallet').hasClass('editordiv-hover') || $('#eraser').hasClass('editordiv-hover') || $('#fill').hasClass('editordiv-hover');
	},
	updateSaveButtonForMap: function (isAutoSave) {
		autoSave = isAutoSave;

		var html = '';
		if (taro.game.data.isDeveloper) {
			if ($('#map-edit-buttons').length === 0) {
				html += '<div id="editor-div" class="z-index11 p-2"><table id="map-edit-buttons">';
			}
			html += '<tr><td><i id="select_entity" class="fas fa-mouse-pointer text-muted" title="Select Entity(S)" aria-hidden="true"></i></td><td><i id="add_entities" class="fas fa-cube text-muted" title="Add Entities(A)" aria-hidden="true"></i></td></tr>';
			if (isAutoSave) {
				html += '<tr><td><i id="mapsave" class="fa fa-floppy-o text-muted" title="save map" aria-hidden="true"></i></td><td><i id="add_region" class="far fa-object-ungroup text-muted" title="Add Region(R)" aria-hidden="true"></i></td></tr>';
			} else {
				html += '<tr><td><i id="add_region" class="far fa-object-ungroup text-muted" title="Add Region(R)" aria-hidden="true"></i></td><td></td></tr>';
			}
			html += '<tr><td><i id="brush" class="fa fa-paint-brush text-muted" title="Brush(B)" aria-hidden="true"></i></td><td><i id="fill" class="fas fa-fill-drip text-muted" title="fill(F)"></i></td></tr>' +
                '<tr><td><i id="eraser" class="fa fa-eraser text-muted" title="Eraser(E)" aria-hidden="true"></i></td><td><i id="clear-layer" class="fas fa-window-close  text-muted" class="text-muted" title="clear selected layer(C)"></i></td></tr>';
			if ($('#map-edit-buttons').length === 0) {
				html += '</table></div>';
				$('body').append(html);
			} else {
				$('#map-edit-buttons').html(html);
			}
			this.addMapEditorlisteners();
			if (this.selectEntities) {
				this.addSelectedClass($('#select_entity'));
			}
		}
	},
	addMapEditorlisteners: function () {
		var self = this;

		for (var key in self.listeners) {
			$(`#${key}`).off();
			$(`#${key}`).on('click', self.listeners[key]);
		}
	},
	customEditor: function () {
		var self = this;
		this.positionMiniMap(0.05);
		var moveCameraInc = 50;
		cameraPos = new TaroPoint3d();

		// need to match where the camera will move after map is loaded
		taro.client.vp1.camera.translateTo((taro.map.data.width * taro.map.data.tilewidth) / 2, (taro.map.data.height * taro.map.data.tileheight) / 2, 0);

		cameraPos.x = taro.client.vp1.camera._translate.x;
		cameraPos.y = taro.client.vp1.camera._translate.y;

		$(window).keydown(function (event) {
			// don't process arrow key input if in a modal window and typing stuff in
			if (($('input,textarea').is(':focus'))) {
				return true;
			}

			var key = event.which;
			var allowedKeys = [38, 39, 37, 40];

			if (!allowedKeys.includes(key)) return;

			$('input:radio').blur();
			var hitArrow = false;

			if (key == 38) { // up
				cameraPos.y -= moveCameraInc;
				hitArrow = true;
			}
			if (key == 39) {
				cameraPos.x += moveCameraInc;
				hitArrow = true;
			}

			if (key == 37) {
				cameraPos.x -= moveCameraInc;
				hitArrow = true;
			}
			if (key == 40) {
				cameraPos.y += moveCameraInc;
				hitArrow = true;
			}

			taro.client.vp1.camera._translate.x = cameraPos.x;
			taro.client.vp1.camera._translate.y = cameraPos.y;

			self.positionViewPortRect();

			if (hitArrow) {
				return false;
			}
		});
	},

	showHideMapEditorUI: function (show) {
		// toggle show map editor current tile hovered over
		if (show) {
			$('#texture_pal_cont').show();
			$('#layer_menu').show();
		} else {
			$('#texture_pal_cont').hide();
			$('#layer_menu').hide();
		}
	},

	scanMapLayers: function () {
		var defaultLayers = ['floor', 'floor2', 'trees', 'walls'];
		for (var i in taro.layersById) {
			if (!defaultLayers.includes(i)) {
				alert(`invalid layer name ${i} detected`);
				return;
			}
		}
	},
	getTilesheetData: function () {
		//  gets the texture used for the tile layer. if not named appropriately, gets the last texture in the list
		if (taro.layersById.floor) {
			for (var i = 0; i < taro.layersById.floor._textureList.length; i++) {
				var string = taro.layersById.floor._textureList[i]._id;
				var substring = 'tilesheet';

				if (string.indexOf(substring) !== -1) {
					taro.layersById.floor._textureList[i].tindex = i;
					return taro.layersById.floor._textureList[i];
				}
			}
			taro.layersById.floor._textureList[taro.layersById.floor._textureList.length - 1].tindex = (taro.layersById.floor._textureList.length - 1);

			return taro.layersById.floor._textureList[taro.layersById.floor._textureList.length - 1];
		}
	},

	positionCameraOnMiniClick: function (relX, relY) {
		// translates coordinates from screen to world relative to the position clicked on the mini map
		if (!this.checkIfClickedMiniMap(relX, relY)) {
			return;
		}
		var miniWinRelY = (taro.client.minimapVp._translate.y * 2); // position of mini map relative to window y
		var worldX = relX / 0.05;
		var worldY = (relY - miniWinRelY) / 0.05;
		taro.client.vp1.camera._translate.x = worldX;
		taro.client.vp1.camera._translate.y = worldY;

		cameraPos.x = taro.client.vp1.camera._translate.x;
		cameraPos.y = taro.client.vp1.camera._translate.y;

		this.positionViewPortRect();
	},
	positionCameraOnRightClick: function (relX, relY) {
		var miniWinRelY = (taro.client.minimapVp._translate.y * 2); // position of mini map relative to window y
		var worldX = relX;
		var worldY = relY;
		var height = taro.client.vp1.camera._translate.y - this.lastYPosition;
		var width = taro.client.vp1.camera._translate.x - this.lastXPosition;

		taro.client.vp1.camera._translate.x = taro.client.vp1.camera._translate.x + width;
		taro.client.vp1.camera._translate.y = -(taro.client.vp1.camera._translate.y + height);

		cameraPos.x = taro.client.vp1.camera._translate.x;
		cameraPos.y = taro.client.vp1.camera._translate.y;

		this.positionViewPortRect();
	},
	createLayerMenu: function () {
		// create the HTML for the layer toggle visibility and toggle draw to layer box.
		if ($('#layer_menu').length > 1) {
			return;
		}

		var layerMenuHTML = '<div id="layer_menu" class="z-index11"><div>Layers</div><ul class="list-group">';
		var layersByOrder = {
			trees: '',
			walls: '',
			floor2: '',
			floor: ''
		};
		for (var key in layersByOrder) {
			var id = `li_${key}`;
			layerMenuHTML += `<li id="${id}_list" data-layer="${key}" class="not_current list-group-item"><i id="${id}" data-layer="${key}" data-vis="0" class="fa fa-eye" aria-hidden="true"></i>${key}</li>`;
		}
		layerMenuHTML += '</ul></div>';

		$('body').append(layerMenuHTML);

		$('#li_floor_list').addClass('active');

		$('#all_layers_checkbox').on('change', function () {
			showAllLayers = (!showAllLayers);
			for (var key in taro.layersById) {
				if (key == curLayerPainting) {
					var val = 1;
				} else {
					var val = 0;
				}
				if (showAllLayers) {
					val = 1;
				}

				if (typeof taro.layersById[key].opacity === 'function') {
					taro.layersById[key].opacity(val);
				} else {
					taro.layersById[key].opacity = val;
				}
			}
		});

		for (var key in taro.layersById) {
			var id = `li_${key}`;

			$(`#${id}_list`).on('click', function () {
				$(this).siblings().removeClass('active');
				$(this).addClass('active');
				var layer = $(this).data('layer');
				$('#eraser').removeClass('hidden');
				$('#brush').removeClass('hidden');
				$('#fill').removeClass('hidden');
				curLayerPainting = layer;
			});

			$(`#${id}`).on('click', function () {
				var val = $(this).data('vis');
				if (val == 0) {
					$(this).data('vis', 1);
					$(this).removeClass('fa-eye');
					$(this).addClass('fa-eye-slash');
				} else {
					$(this).data('vis', 0);
					$(this).removeClass('fa-eye-slash');
					$(this).addClass('fa-eye');
				}

				var layer = $(this).data('layer');
				if (typeof taro.layersById[layer].opacity === 'function') {
					taro.layersById[layer].opacity(val);
				} else {
					taro.layersById[layer].opacity = val;
				}
			});
		}
	},
	updateWorldXYCoords: function (screenX, screenY) {
		// translates screen coordinates to world coordinates
		var vp = taro.client.vp1;
		var mp = vp.mousePos();
		taro.mapEditor.mouseCoordinatesWRTVp = {
			x: mp.x,
			y: mp.y
		};
		$('#mouse_coords #x').text(taro.mapEditor.mouseCoordinatesWRTVp.x);
		$('#mouse_coords #y').text(taro.mapEditor.mouseCoordinatesWRTVp.y);
	},
	checkIfClickedMiniMap: function (relX, relY) {
		// determines if the user clicks the mini map based on relative position of the mouse
		var self = this;
		var miniHeight = taro.client.minimapVp.height();
		var miniWidth = taro.client.minimapVp.width();
		var miniWinRelY = (taro.client.minimapVp._translate.y * 2); // position of mini map relative to window y

		if ((relX > miniWidth) || (relY > (miniWinRelY + miniHeight)) || (relY < miniWinRelY) || self.drawingRegion) {
			// exclude clicks outside the mini map area
			return false;
		} else {
			return true;
		}
	},
	makeMap: function (layer) {
		for (var i = 0; i < taro.map.data.width * taro.map.data.height; i++) {
			if (layer[i] === undefined) {
				layer[i] = 0;
			}
		}
	},
	floodFil: function (layer, x, y, previousTile, NewTile) {
		// console.log(this.counter++,' ',x,' ',y)
		var self = this;
		if (x < 0 || y < 0 || x >= taro.map.data.width || y >= taro.map.data.height)
			return;

		var tileIndex = (x) + ((y) * taro.map.data.width);
		if (layer[tileIndex] === undefined) {
			this.makeMap(layer);
		}
		if (layer[tileIndex] != previousTile || NewTile == previousTile)
			return;

		if (this.counter > taro.map.data.width * taro.map.data.height) {
			return;
		}

		layer[tileIndex] = NewTile;
		taro.layersById[curLayerPainting].paintTile(x, y, this.getTilesheetData().tindex, NewTile);

		// setTimeout(function () {
		//     self.floodFil(layer, x + 1, y, previousTile, NewTile)
		// }, 0);
		// setTimeout(function () {
		//     self.floodFil(layer, x - 1, y, previousTile, NewTile);
		// }, 0);
		// setTimeout(function () {
		//     self.floodFil(layer, x, y + 1, previousTile, NewTile);
		// }, 0);
		// setTimeout(function () {
		//     self.floodFil(layer, x, y - 1, previousTile, NewTile);
		// }, 0);
		this.floodFil(layer, x + 1, y, previousTile, NewTile);
		this.floodFil(layer, x - 1, y, previousTile, NewTile);
		this.floodFil(layer, x, y + 1, previousTile, NewTile);
		this.floodFil(layer, x, y - 1, previousTile, NewTile);
	},

	mouseDownEditor: function (e) {
		// input handler for placing a tile
		// console.log('mouse down called');
		if (e.which !== 1) return;
		if (this.checkIfClickedMiniMap(e.pageX, e.pageY)) {
			$('#world_cur_tile').hide();
			return;
		}

		if (taro._selectedViewport && taro._selectedViewport.id() !== 'vp1') return;

		// $('#world_cur_tile').show();

		var winWidth = $(window).width();
		var winHeight = $(window).height();
		var cellWidth = this.getTilesheetData()._cellWidth;
		var cellHeight = this.getTilesheetData()._cellHeight;

		var camX = taro.client.vp1.camera._translate.x;
		var camY = taro.client.vp1.camera._translate.y;

		var worldX = taro.mapEditor.mouseCoordinatesWRTVp.x;
		var worldY = taro.mapEditor.mouseCoordinatesWRTVp.y;

		var tileX = Math.floor(worldX / cellWidth);
		var tileY = Math.floor(worldY / cellHeight);
		console.log(tileX, tileY, cellWidth, cellHeight, worldX, worldY);
		if (tileX < 0 || tileY < 0 || tileX >= taro.map.data.width || tileY >= taro.map.data.height) {
			return;
		}
		if (curSelectedTileIndex != undefined) {
			if (taro.layersById[curLayerPainting].paintTile == undefined) {
				return;
			}
			var lIndex = this.getLayerIndexFromName(curLayerPainting);
			taro.isMapUpdated = true;
			var tileIndex = (tileX) + ((tileY) * taro.map.data.width);
			var forceRendering = false;
			if ($('#fill').hasClass('editordiv-hover')) {
				var currentTile = taro.map.data.layers[lIndex].data[tileIndex];
				this.counter = 0;
				this.floodFil(taro.map.data.layers[lIndex].data, tileX, tileY, currentTile || 0, curSelectedTileIndex);
				forceRendering = true;
			} else {
				if ($('#eraser').hasClass('editordiv-hover')) {
					taro.layersById[curLayerPainting].clearTile(tileX, tileY);
					forceRendering = true;
				} else if ($('#brush').hasClass('editordiv-hover')) {
					taro.layersById[curLayerPainting].paintTile(tileX, tileY, this.getTilesheetData().tindex, curSelectedTileIndex);
					forceRendering = true;
				}
			}
			console.log(lIndex);

			taro.map.data.layers[lIndex].data[tileIndex] = curSelectedTileIndex;
			taro.layersById[curLayerPainting].cacheForceFrame();
			if (autoSave) {
				taro.mapEditor.isMapChangeAndNotSaved = true;
			} else {
				window.updateSandboxMapLayers(lIndex, taro.map.data.layers[lIndex].data);
			}
		}
	},
	drawNewRegion: function (e) {
		var vpWidth = taro.client.vp1.width();
		var vpHeight = taro.client.vp1.height();
		if (mouseIsDown) {
			var mx = taro.mapEditor.mouseCoordinatesWRTVp.x;
			var my = taro.mapEditor.mouseCoordinatesWRTVp.y;
			if (!addRegionCordinates.startX && !addRegionCordinates.startY) {
				addRegionCordinates.startX = mx;
				addRegionCordinates.startY = my;
				addRegionCordinates.mouseStartX = e.pageX;
				addRegionCordinates.mouseStartY = e.pageY;
				$('#draw-new-region').css({
					position: 'absolute',
					left: e.pageX,
					top: e.pageY,
					border: '1px solid blue'
				});
			} else {
				addRegionCordinates.endX = mx;
				addRegionCordinates.endY = my;
				addRegionCordinates.mouseEndX = e.pageX;
				addRegionCordinates.mouseEndY = e.pageY;
				$('#draw-new-region').css({
					position: 'absolute',
					left: (e.pageX - addRegionCordinates.mouseStartX < 0) ? `${e.pageX}px` : `${addRegionCordinates.mouseStartX}px`,
					top: (e.pageY - addRegionCordinates.mouseStartY < 0) ? `${e.pageY}px` : `${addRegionCordinates.mouseStartY}px`,
					height: `${Math.abs(e.pageY - addRegionCordinates.mouseStartY)}px`,
					width: `${Math.abs(e.pageX - addRegionCordinates.mouseStartX)}px`,
					border: '1px solid blue'
				});
			}
		}
	},
	saveNewRegion: function (event) {
		if (addNewRegion && addRegionCordinates.startX) {
			var regionKey = `Region${parseInt(Math.random() * 10000)}`;
			var x = addRegionCordinates.endX - addRegionCordinates.startX < 0 ? addRegionCordinates.endX : addRegionCordinates.startX;
			var y = addRegionCordinates.endY - addRegionCordinates.startY < 0 ? addRegionCordinates.endY : addRegionCordinates.startY;
			var height = Math.abs(addRegionCordinates.endY - addRegionCordinates.startY);
			var width = Math.abs(addRegionCordinates.endX - addRegionCordinates.startX);

			var newRegion = {
				dataType: 'region',
				default: {
					x: x + (Math.abs(width) / 2),
					y: y + (Math.abs(height) / 2),
					height: height,
					width: width
				}
			};
			taro.regionManager.openRegionModal(newRegion, regionKey, true);
			addRegionCordinates = {};
			$('#draw-new-region').css({
				border: '',
				height: '',
				left: '',
				top: '',
				width: ''
			});

			addNewRegion = false;
			// this.removeSelectedClass('add_region');
			$('#add_region').removeClass('editordiv-hover').addClass('text-muted');
		}
	},
	snapToGrid: function (val, gridSize) {
		var snap = gridSize * Math.floor(val / gridSize);

		return snap;
	},

	positionViewPortRect: function () {
		// adds the viewport rect
		if ($('#view_rect').length < 1) {
			$('body').append('<div id="view_rect"></div>');
		}

		var vpWidth = taro.client.vp1.width() * 0.05;
		var vpHeight = taro.client.vp1.height() * 0.05;
		$('#view_rect').width(vpWidth);
		$('#view_rect').height(vpHeight);

		var relY = ((taro.client.minimapVp._translate.y * 2) + (taro.client.vp1.camera._translate.y * 0.05)) - (vpHeight / 2);
		var relX = (taro.client.vp1.camera._translate.x * 0.05) - (vpWidth / 2);

		$('#view_rect').css({
			top: relY,
			left: relX,
			zIndex: 0
		});
	},

	positionMiniMap: function (miniMapScale) {
		// positions mini map so it is flush to the bottom left of the screen
		var worldWidth = taro.map.data.width * taro.map.data.tileheight;
		var worldHeight = taro.map.data.height * taro.map.data.tileheight;
		var padding = 0;
		taro.client.minimapVp.width((worldWidth * 0.05) + padding);
		taro.client.minimapVp.height((worldHeight * 0.05) + padding);

		taro.client.minimapVp.camera._translate.x = worldWidth / 2;
		taro.client.minimapVp.camera._translate.y = worldHeight / 2;

		taro.client.minimapVp._translate.x = ((taro.client.vp1.width() / 2) * -1) + ((worldWidth * miniMapScale) / 2);
		taro.client.minimapVp._translate.y = ((taro.client.vp1.height() / 2) * 1) - ((worldHeight * miniMapScale) / 2);
	},

	getLayerIndexFromName: function (name) {
		var i = 0;
		for (var key in taro.layersById) {
			if (key == name) {
				return i;
			}
			i++;
		}
	},
	positionCurTextureBox: function (e) {
		// positions the white current selected tile box relative to the screen
		if (taro.layersById == undefined || taro.layersById.floor == undefined) {
			return;
		}
		var imgWidth = $('#texture_pal').width();
		var imgHeight = $('#texture_pal').height();
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		var cellWidth = this.getTilesheetData()._cellWidth;
		var cellHeight = this.getTilesheetData()._cellHeight;

		// var isHover = e.target.id === 'texture_pal';
		var isHover = ((e.pageX > (winWidth - imgWidth)) && (e.pageY > (winHeight - imgHeight)));
		var isAnimating = ($('#texture_pal_cont').is(':animated'));

		if (!isHover) {
			$('#cur_texture_box').css({
				display: 'none'

			});
		} else {
			$('#cur_texture_box').css({
				display: 'block'

			});
		}

		if (isHover) {
			if (!isAnimating) {
				// $('#texture_pal_cont').animate({
				//     'width': '30%'
				// }, 200);

				//     $('#layer_menu').hide();
			}
		} else {
			if (!isAnimating) {
				// $('#texture_pal_cont').animate({
				//     'width': '20%'
				// }, 200);

				//      $('#layer_menu').show();
			}

			// var camX = taro.client.vp1.camera._translate.x;
			// var camY = taro.client.vp1.camera._translate.y;

			// var worldX = taro.mapEditor.mouseCoordinatesWRTVp.x;
			// var worldY = taro.mapEditor.mouseCoordinatesWRTVp.y;
			// var tileX = Math.floor(worldX / cellWidth);
			// var tileY = Math.floor(worldY / cellHeight);

			// cellWidth = cellWidth * taro.client.vp1.camera._scale.x;
			// cellHeight = cellHeight * taro.client.vp1.camera._scale.y;
			// // console.log(cellWidth, cellHeight)
			// tileX = tileX * cellWidth;
			// tileY = tileY * cellHeight;

			// $('#world_cur_tile').css({
			//     'left': tileX,
			//     'top': tileY,
			//     'width': cellWidth,
			//     'height': cellHeight,

			// });

			if (mouseIsDown) {
				this.mouseDownEditor(e);
			}

			return;
		}
		var boxWidth = imgWidth / this.getTilesheetData()._cellColumns;
		var boxHeight = imgHeight / this.getTilesheetData()._cellRows;

		$('#cur_texture_box').width(boxWidth);
		$('#cur_texture_box').height(boxHeight);

		var parentOffset = $('#texture_pal_cont').offset();
		var relX = this.snapToGrid((e.pageX - parentOffset.left) - boxWidth / 2, boxWidth);
		var relY = this.snapToGrid((e.pageY - parentOffset.top) - boxHeight / 2, boxHeight);
		$('#cur_texture_box').css({
			left: relX, // + $('#texture_pal_cont')[0].scrollLeft
			top: relY // + $('#texture_pal_cont')[0].scrollTop
		});

		// curSelectedTileIndex = Math.round(((relX / boxWidth) + 1) + (((relY / boxHeight))) * this.getTilesheetData()._cellColumns);
		// console.log(curSelectedTileIndex);
	},

	animateOpacity: function (element, num) {
		// causes the current selected tile box to animate in opacity
		element.animate({
			opacity: num
		}, 3000, undefined, function () {
			if (num == 0.4) {
				num = 0.8;
			} else {
				num = 0.4;
			}
			this.animateOpacity(element, num);
		});
	},
	addSelectedClass: function (self, value) {
		if ($(self).hasClass('editordiv-hover') && !value) {
			$(self).removeClass('editordiv-hover');
			$(self).addClass('text-muted');
		} else {
			$('.fa.editordiv-hover').removeClass('editordiv-hover').addClass('text-muted');
			$('.material-icons.editordiv-hover').removeClass('editordiv-hover').addClass('text-muted');
			$(self).removeClass('text-muted');
			$(self).addClass('editordiv-hover');
		}
	},
	addUI: function () {
		var self = this;

		var textureURL = this.getTilesheetData()._url;
		if (taro.game.data.isDeveloper) {
			this.updateSaveButtonForMap(autoSave);
		}
		$('body').append('<div id="draw-new-region" class="z-index11"></div>');
		$('body').append('<div id="mouse_coords">X:<span id="x"></span> Y:<span id="y"></span></div>');
		// $('body').append('<div id="world_cur_tile" class="z-index11"></div><div id="texture_pal_cont" class="z-index11"><img id="texture_pal" src="' + textureURL + '" /><div id="cur_texture_box"></div></div>');

		//     animateOpacity($('#world_cur_tile'), .4);
		$('#texture_pal_cont').on('click', function (e) {
			var imgWidth = $('#texture_pal').width();
			var imgHeight = $('#texture_pal').height();

			var boxWidth = imgWidth / self.getTilesheetData()._cellColumns;
			var boxHeight = imgHeight / self.getTilesheetData()._cellRows;

			var parentOffset = $('#texture_pal_cont').offset();
			var relX = self.snapToGrid((e.pageX - parentOffset.left) - boxWidth / 2, boxWidth);
			var relY = self.snapToGrid((e.pageY - parentOffset.top) - boxHeight / 2, boxHeight);

			curSelectedTileIndex = Math.round(((relX / boxWidth) + 1) + (((relY / boxHeight))) * self.getTilesheetData()._cellColumns);
			lastCurSelectedTileIndex = curSelectedTileIndex;
		});
		this.createLayerMenu();
		this.showHideMapEditorUI(true);
	},
	removeSelectedClass: function (type) {
		if (type != 'brush') {
			$('#brush').removeClass('editordiv-hover').addClass('text-muted');
		}
		if (type != 'fill') {
			$('#fill').removeClass('editordiv-hover').addClass('text-muted');
		}
		if (type != 'eraser') {
			$('#eraser').removeClass('editordiv-hover').addClass('text-muted');
		}
		if (type != 'add_region') {
			addNewRegion = false;
			$('#add_region').removeClass('editordiv-hover').addClass('text-muted');
		}
		// if (type != 'open-pallet') {
		//     $('#open-pallet').removeClass('editordiv-hover').addClass('text-muted');
		// }
		if (type != 'add_entities') {
			$('#add_entities').removeClass('editordiv-hover').addClass('text-muted');
		}
		if (type != 'select_entity') {
			$('#select_entity').removeClass('editordiv-hover').addClass('text-muted');
		}
	},
	openEntitiesModal: function (entity, isEdit) {
		var self = this;
		var generateList = function (type) {
			var html = '';// '<option value="">Select entity</option>';
			var entityKeys = Object.keys(entity);

			_.map(taro.game.data[type], function (entity, key) {
				html += `<option value='${key}'>${entity.name}</option>`;
			});

			if (entityKeys.length === 0) {
				html = '<option value="">This game has no entity</option>';
				document.getElementById('entities-list').value = '';
			} else {
				if (!isEdit) {
					document.getElementById('entities-list').value = entityKeys[0];
					self.entity.entity = entityKeys[0];
				}
			}

			$('#entities-list').html(html);
		};
		var generatePlayerTypeList = function (type) {
			if (type === 'unitTypes') {
				$('#player-list-div').removeClass('d-none');
				document.getElementById('player-list').required = true;
			} else {
				$('#player-list-div').hasClass('d-none') ? null : $('#player-list-div').addClass('d-none');
				document.getElementById('player-list').required = false;
				return;
			}
			var html = '';// '<option value=""> Select Player </option>';
			var availablePlayers = [];
			_.map(taro.game.data.variables, function (variable, key) {
				if (variable && variable.dataType === 'player') {
					html += `<option value="${key}">${key}</option>`;
					availablePlayers.push(key);
				}
			});
			if (availablePlayers.length === 0) {
				html = '<option value="">This game has no player global variable in Environment</option>';
				document.getElementById('player-list').value = '';
			} else {
				if (!isEdit) {
					document.getElementById('player-list').value = availablePlayers[0];
				}
			}

			$('#player-list').html(html);
		};
		$('#entity-type').on('change', function () {
			generateList(this.value);
			generatePlayerTypeList(this.value);
		});
		generateList(entity.type);
		generatePlayerTypeList(entity.type);
		$('#entity-type').val(entity.type);
		$('[name=entity-x').val(entity.x);
		$('[name=entity-y').val(entity.y);
		$('[name=entity-rotation').val(entity.rotation);
		$('[name=entity-height').val(entity.height);
		$('[name=entity-width').val(entity.width);

		if (isEdit) {
			$('[name=entity-player').val(entity.player);
			$('[name=entity').val(entity.entity);

			$('[name=entity-index').val(entity.index);
			$('[name=entity-isEdit').val('true');
			$('.entity-hidden').removeClass('d-none');
			$('#entity-modal-title').html('Edit entity');
			$('#entity-save').html('<i class=\'fa fa-save\'></i> Save');
		} else {
			$('[name=entity-index').val('none');
			$('[name=entity-isEdit').val('false');
			$('.entity-hidden').addClass('d-none');
			$('#entity-modal-title').html('Select entity to place on the map');
			$('#entity-save').html('Select');
		}

		$('#entities-modal').modal({
			show: true,
			keyboard: true
		});
	},
	upsertMapEntities: function (entity, index = (taro.game.data.scripts.initialize && taro.game.data.scripts.initialize.actions.length || 0), action = 'upsert') {
		if ((!entity.type || !entity.entity) && action != 'delete') {
			return;
		}
		var self = this;
		document.body.style.cursor = 'wait';
		window.modifyMapEntity(index, entity.type, entity.entity, entity.x, entity.y, entity.height, entity.width, entity.rotation, entity.player, action)
			.then((game) => {
				taro.game.data.scripts = game.data.scripts;
				if (taro.game.createdEntities.length > 0) {
					for (var i = 0; i < taro.game.createdEntities.length; i++) {
						taro.game.createdEntities[i].destroy();
					}
					taro.game.createdEntities = [];
				}
				taro.script.runScript('initialize', {});
				document.body.style.cursor = 'default';
				$('#entities-modal').modal('hide');
			});
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = MapEditorComponent;
}
