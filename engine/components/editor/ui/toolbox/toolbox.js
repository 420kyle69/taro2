var UiToolBox = TaroEventingClass.extend({
	classId: 'UiToolBox',

	init: function () {
		var self = this;

		this.tools = {};

		// Load tool scripts
		taro.requireScript(`${taroRoot}components/editor/ui/toolbox/tools/UiToolBox_ToolCreate.js`, function () {
			self.tools.UiToolBox_ToolCreate = taro.newClassInstance('UiToolBox_ToolCreate');
		});

		taro.requireScript(`${taroRoot}components/editor/ui/toolbox/tools/UiToolBox_ToolSelect.js`, function () {
			self.tools.UiToolBox_ToolSelect = taro.newClassInstance('UiToolBox_ToolSelect');
			self.select('toolSelect');
		});

		taro.requireScript(`${taroRoot}components/editor/ui/toolbox/tools/UiToolBox_ToolPan.js`, function () {
			self.tools.UiToolBox_ToolSelect = taro.newClassInstance('UiToolBox_ToolSelect');
		});

		taro.requireScript(`${taroRoot}components/editor/ui/toolbox/tools/UiToolBox_ToolTranslate.js`, function () {
			self.tools.UiToolBox_ToolTranslate = taro.newClassInstance('UiToolBox_ToolTranslate');
		});

		// Load the toolbox html into the editor DOM
		taro.editor.loadHtml(`${taroRoot}components/editor/ui/toolbox/toolbox.html`, function (html) {
			var toolbox = $(html);

			// Attach logic handlers to tools
			toolbox.find('[data-tool]').click(function () {
				var elem = $(this);

				if (!elem.hasClass('disabled')) {
					// Add selected to this tool
					self.select(elem.attr('id'));
				}
			});

			// Attach logic handlers to actions
			toolbox.find('[data-action]').click(function () {
				var elem = $(this);

				// Perform action
				self.action(elem.attr('data-action'));
			});

			// Add the html
			$('#leftBar').append(toolbox);

			// Setup tool toggle buttons
			$('.toolToggleGroup').click(function () {
				// Un-select all others in the group
				var elem = $(this);
				var group = elem.attr('data-group');

				$(`[data-group="${group}"]`).removeClass('selected');
				elem.addClass('selected');
			});
		});
	},

	action: function (actionId) {
		switch (actionId) {
			case 'play':
				taro.pause(false);
				break;

			case 'pause':
				taro.pause(true);
				break;
		}
	},

	select: function (id) {
		var self = this;
		var elem = $(`#${id}`);
		var toolClassId = elem.attr('data-tool');

		// Clear existing tool selection
		self.deselect(self._currentTool);

		if (!elem.hasClass('selected')) {
			elem.addClass('selected');
			this._currentTool = id;
		}

		// Handle tool init logic
		if (toolClassId) {
			if (!this.tools[toolClassId]) {
				if (taro.classDefined(toolClassId)) {
					this.tools[toolClassId] = this._currentToolInstance = taro.newClassInstance(toolClassId);
					this._currentToolInstance.enabled(true);
				} else {
					this.log(`No class for tool or class not defined: ${toolClassId}`, 'warning');
				}
			} else {
				this._currentToolInstance = this.tools[toolClassId];
				this._currentToolInstance.enabled(true);
			}
		}
	},

	deselect: function (id) {
		if (this._currentToolInstance) {
			this._currentToolInstance.enabled(false);
			delete this._currentToolInstance;
		}

		if (id) {
			$(`#${id}`).removeClass('selected');
		} else {
			$('.tool.toolSelect.selected').removeClass('selected');
		}

		this._currentTool = null;
	}
});

// Init
taro.editor.ui.toolbox = new UiToolBox();
