var UiToolBox_ToolCreate = TaroEventingClass.extend({
	classId: 'UiToolBox_ToolCreate',
	editorOptions: {
		hide: true
	},

	init: function () {
		this.menuDefinition = [{
			group: []
		}];

		var sortArr = []; var i;

		for (i in taroClassStore) {
			if (taroClassStore.hasOwnProperty(i)) {
				if (!taroClassStore[i].prototype.editorOptions || !taroClassStore[i].prototype.editorOptions.hide) {
					sortArr.push(i);
				}
			}
		}

		sortArr.sort();

		for (i = 0; i < sortArr.length; i++) {
			this.menuDefinition[0].group.push({
				id: sortArr[i],
				icon: 'none',
				text: sortArr[i],
				action: `taro.editor.createObject('${sortArr[i]}', true);`
			});
		}
	},

	enabled: function (val) {
		if (val) {
			// Display menu
			var self = this;
			var toolboxButton = $('#toolCreate');
			var position = toolboxButton.offset();
			var left = position.left + toolboxButton.width();
			var top = position.top;
			var height = $('body').height();

			taro.editor.ui.menus.create({
				header: {
					icon: 'log_in',
					text: 'Create Object'
				},
				groups: self.menuDefinition,
				search: true
			}, function (elem) {
				// Now position the menu
				var menuHeight = elem.height();

				top -= menuHeight / 2;

				if (top + menuHeight > height) {
					top = height - menuHeight - 10;
				}

				if (top - menuHeight < 30) {
					top = 30;
				}

				elem.css('left', left)
					.css('top', top);
			});
		} else {
			taro.editor.ui.menus.closeAll();
		}
	}
});
