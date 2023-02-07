var UiSceneGraph = TaroEventingClass.extend({
	classId: 'UiSceneGraph',

	init: function () {
		var self = this;

		taro.requireStylesheet(`${taroRoot}components/editor/ui/scenegraph/scenegraph.css`);

		// Add tab to tabs
		$('<div class="tab" data-content="scenegraphContent" title="Scene Graph"><span class="icon graph"></span></div>')
			.insertAfter('#tabs .tab1');

		// Add content html
		$('<div id="scenegraphContent" class="tabContent"><div class="header"><div class="label">Scene Graph</div><div class="controls"></div></div><div class="tree taroEditorGroup"></div></div>')
			.appendTo('#tabContents');

		// Add controls
		$('<div class="control" title="Refresh SceneGraph Tree"><span id="refreshSceneGraph" class="halflings-icon white refresh"></span></div>')
			.on('click', function () {
				taro.editor.ui.scenegraph.updateSceneGraph();
			})
			.appendTo('#scenegraphContent .header .controls');
	},

	ready: function () {
		// Render scenegraph
		this.updateSceneGraph();

		// Hook editor select object updates so we can keep in sync
		taro.editor.on('selectedObject', function (id) {
			taro.editor.ui.scenegraph.selectObjectById(id);
		});
	},

	selectObjectById: function (id) {
		var sg = $('#scenegraphContent .tree');
		sg.find('.taroObject.selected').removeClass('selected');
		$(sg.find(`#${id}`).find('.taroObject')[0]).addClass('selected');
	},

	updateSceneGraph: function () {
		var sgContent = $('#scenegraphContent .tree');

		sgContent.html('')
			.tree({
				data: taro.getSceneGraphData()
			});

		$(sgContent.find('ul')[0]).treeview();

		// Hook click events on the scenegraph tree
		sgContent.find('.taroObject').click(function () {
			var elem = $(this);
			taro.editor.selectObject(elem.attr('data-id'));
		});

		// Make sure we have the current selection highlighted
		if (taro.editor._selectedObject) {
			this.selectObjectById(taro.editor._selectedObject.id());
		}
	}
});

// Init
taro.editor.ui.scenegraph = new UiSceneGraph();
