var TaroUiGridPanel = TaroUiElement.extend({
	classId: 'TaroUiGridPanel',

	init: function (cellWidth, cellHeight) {
		TaroUiElement.prototype.init.call(this);

		this._gridCellWidth = cellWidth || 32;
		this._gridCellHeight = cellHeight || 32;
	},

	_childMounted: function (obj) {
		TaroUiElement.prototype._childMounted.call(this, obj);

		var gridWidth = Math.floor(this._bounds2d.x / this._gridCellWidth);
		var gridHeight = Math.floor(this._bounds2d.y / this._gridCellHeight);
		var totalChildren = this._children.length - 1; var positionX; var positionY;

		// Position this child in the grid
		positionY = Math.floor(totalChildren / gridWidth);
		positionX = totalChildren - (gridWidth * positionY);

		obj.left(this._gridCellWidth * positionX)
			.top(this._gridCellHeight * positionY);
	}
});
