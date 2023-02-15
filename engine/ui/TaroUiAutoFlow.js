var TaroUiAutoFlow = TaroUiElement.extend({
	classId: 'TaroUiAutoFlow',

	init: function () {
		TaroUiElement.prototype.init.call(this);

		this._currentHeight = 0;
	},

	tick: function (ctx) {
		// Loop children and re-position then
		var arr = this._children;
		var arrCount = arr.length; var i;
		var item; var itemY; var currentY = 0;

		for (i = 0; i < arrCount; i++) {
			item = arr[i];
			itemY = item._bounds2d.y;

			item.top(currentY);

			currentY += itemY;
		}

		// Now do the super-class tick
		TaroUiElement.prototype.tick.call(this, ctx);
	}
});
