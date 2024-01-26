var VariableComponent = TaroEntity.extend({
	classId: 'variableComponent',
	componentId: 'variable',

	init: function (entity, options) {
		var self = this;
		self._entity = entity;
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = VariableComponent; }
