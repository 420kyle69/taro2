var UiToolBox_ToolSelect = TaroEventingClass.extend({
	classId: 'UiToolBox_ToolSelect',

	init: function () {
		var self = this;

		// Hook editor select object updates so we can keep in sync
		taro.editor.on('selectedObject', function (id) {
			taro._currentViewport.drawBounds(true);
			taro._currentViewport.drawBoundsLimitId(id);
		});

		this.menuDefinition = {
			TaroEntity: [{
				mode: [{
					id: 'select',
					icon: 'hand-top',
					text: 'Select',
					action: 'taro.editor.ui.toolbox.select(\'toolSelect\');'
				}],
				transform: [{
					sep: true,
					id: 'transform',
					icon: 'th',
					text: 'Transform',
					action: 'taro.editor.ui.toolbox.select(\'toolTransform\');'
				}, {
					id: 'translate',
					icon: 'move',
					text: 'Translate',
					action: 'taro.editor.ui.toolbox.select(\'toolTranslate\');'
				}, {
					id: 'rotate',
					icon: 'repeat',
					text: 'Rotate',
					action: 'taro.editor.ui.toolbox.select(\'toolRotate\');'
				}, {
					id: 'scale',
					icon: 'resize-full',
					text: 'Scale',
					action: 'taro.editor.ui.toolbox.select(\'toolRotate\');'
				}],
				export: [{
					sep: true,
					id: 'export',
					icon: 'download-alt',
					text: 'Export...'
				}, {
					id: 'export-tree',
					icon: 'sort-by-attributes',
					text: 'Export Composite...'
				}],
				action: [{
					sep: true,
					id: 'destroy',
					icon: 'certificate',
					text: 'Destroy',
					action: 'taro.editor.destroySelected();'
				}]
			}]
		};

		taro.editor.on('mouseUp', function (event) {
			if (event.button === 0) {
				taro.editor.ui.menus.closeAll();
			}

			if (event.button === 2 && taro.editor._selectedObject) {
				var classArr = taro.editor._selectedObjectClassList;
				var i;

				for (i = 0; i < classArr.length; i++) {

				}

				var body = $('body');
				var width = body.width();
				var height = body.height();
				var left = event.pageX;
				var top = event.pageY;

				taro.editor.ui.menus.create({
					header: {
						icon: 'th-large',
						text: `[${taro.editor._selectedObject.classId()}]` + ` ${taro.editor._selectedObject.id()}`
					},
					groups: self.menuDefinition.TaroEntity
				}, function (elem) {
					// Now position the menu
					var menuWidth = elem.width();
					var menuHeight = elem.height();

					if (left + menuWidth > width) {
						left = width - menuWidth - 10;
					}

					if (top + menuHeight > height) {
						top = height - menuHeight - 10;
					}

					elem.css('left', left)
						.css('top', top);
				});
			}
		});
	},

	enabled: function (val) {
		if (val !== undefined) {
			this._enabled = val;

			if (val) {
				taro.editor.interceptMouse(true);

				var self = this;

				// Hook the engine's input system and take over mouse interaction
				this._mouseUpHandle = taro.editor.on('mouseUp', function (event) {
					self._mouseUp(event);
				});

				this._mouseDownHandle = taro.editor.on('mouseDown', function (event) {
					self._mouseDown(event);
				});

				this._mouseMoveHandle = taro.editor.on('mouseMove', function (event) {
					self._mouseMove(event);
				});
			} else {
				taro.editor.interceptMouse(false);
				taro.editor.off('mouseUp', this._mouseUpHandle);
				taro.editor.off('mouseDown', this._mouseDownHandle);
				taro.editor.off('mouseMove', this._mouseMoveHandle);

				if (taro.editor._selectedObject) {
					taro._currentViewport.drawBoundsData(true);
					taro._currentViewport.drawBoundsLimitId(taro.editor._selectedObject.id());
				} else {
					taro._currentViewport.drawBounds(false);
					taro._currentViewport.drawBoundsLimitId('');
				}
			}
		}
	},

	/**
	 * Handles the mouseDown event.
	 * @param event
	 * @private
	 */
	_mouseDown: function (event) {
		this.emit('mouseDown', event);
	},

	/**
	 * Handles the mouse move event.
	 * @param event
	 * @private
	 */
	_mouseMove: function (event) {
		var arr = taro.mouseOverList();
		if (arr.length) {
			if (!taro.editor._selectedObject) {
				taro._currentViewport.drawBounds(true);
				taro._currentViewport.drawBoundsData(true);
				taro._currentViewport.drawBoundsLimitId(arr[0].id());
			} else {
				taro._currentViewport.drawBounds(true);
				taro._currentViewport.drawBoundsData(true);
				taro._currentViewport.drawBoundsLimitId([taro.editor._selectedObject.id(), arr[0].id()]);
			}

			this._overObject = arr[0];
		} else {
			delete this._overObject;

			if (!taro.editor._selectedObject) {
				taro._currentViewport.drawBounds(false);
				taro._currentViewport.drawBoundsData(false);
				taro._currentViewport.drawBoundsLimitId('');
			} else {
				taro._currentViewport.drawBounds(true);
				taro._currentViewport.drawBoundsData(true);
				taro._currentViewport.drawBoundsLimitId(taro.editor._selectedObject.id());
			}
		}

		this.emit('mouseMove', event);
	},

	/**
	 * Handles the mouse up event.
	 * @param event
	 * @private
	 */
	_mouseUp: function (event) {
		if (event.button === 0) {
			if (this._overObject) {
				taro.editor.selectObject(this._overObject.id());
				this.emit('selected', taro.editor._selectedObject);

				this.emit('mouseUp', event);
			}
		}
	},

	destroy: function () {
		this.enabled(false);
	}
});
