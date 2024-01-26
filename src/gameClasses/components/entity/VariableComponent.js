var VariableComponent = TaroEntity.extend({
	classId: 'variableComponent',
	componentId: 'variable',

	init: function (entity, options) {
		var self = this;
		self._entity = entity;
	},

	update: function (variableId, value) {
		var self = this;

		if (self._entity.variables[variableId] !== undefined) {
		
			var isDataTypeMatching = false; // flag to check if datatype of value matches datatype of variable
			var variableObj = self._entity.variables[variableId];

			// variables can not set to undefined via action
			switch (variableObj.dataType) {
				case 'string':
				case 'boolean':
				case 'number': {
					isDataTypeMatching = typeof value === variableObj.dataType;
					break;
				}
				case 'position': {
					isDataTypeMatching = typeof value === 'object' &&
						value.x &&
						value.y;
					break;
				}
				case 'item':
				case 'player':
				case 'unit': {
					isDataTypeMatching = typeof value === 'object' &&
						value._category === variableObj.dataType;
					break;
				}
				default: {
					// figure out how to validate for other types like itemType, unitType, ..., etc.
					isDataTypeMatching = true;
					break;
				}
			}

			// if datatype of value matches datatype of variable then set value
			// otherwise set value to undefined and throw error
			if (isDataTypeMatching) {

				if (variableObj.value !== value) {					
					variableObj.value = value;

					self._entity.streamUpdateData({
											variables: {
												[variableId]: value
											}
										});

				}
				
			} else if (typeof value === 'undefined' && action.value && action.value.function === 'undefinedValue') {
				// dev intentionally set value as undefined
				variableObj.value = undefined;

				// if variable has default field then it will be returned when variable's value is undefined
				if (variableObj.default) {

					variableObj.default = undefined;
				}
			} else {
				throw new Error('datatype of value does not match datatype of variable');
			}
		}
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = VariableComponent; }
