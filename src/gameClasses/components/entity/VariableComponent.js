var VariableComponent = TaroEntity.extend({
	classId: 'variableComponent',
	componentId: 'variable',

	init: function (entity, options) {
		var self = this;
		self._entity = entity;

		for (var variableId in self._entity.variables) {			
			var entityVariable = self._entity.variables[variableId];
			// if the variable is not defined, use the default value
			if (entityVariable == undefined || entityVariable.value == undefined) {				
				self._entity.variables[variableId].value = entityVariable.default;
			}
		}

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
					self._entity.variables[variableId].value = value;

					if (taro.isServer) {
						if (
							variableObj.streamMode == null || variableObj.streamMode == 1 ||  // don't stream if streamMode isn't sync'ed (1). Also added != null for legacy support.
							variableObj.streamMode == 4 // streamMode 4 also sends to everyone. the ignoring part is done on client-side.
						) {
							self._entity.streamUpdateData([{
								variables: {
									[variableId]: value
								}
							}]);
						}
					}
				}
				
			} else if (typeof value === 'undefined' || value.function === 'undefinedValue') {
				// creator is intentionally setting value as undefined
				self._entity.variables[variableId].value = undefined;

				if (taro.isServer) {
					if (
						variableObj.streamMode == null || variableObj.streamMode == 1 ||  // don't stream if streamMode isn't sync'ed (1). Also added != null for legacy support.
						variableObj.streamMode == 4 // streamMode 4 also sends to everyone. the ignoring part is done on client-side.
					) {					
						self._entity.streamUpdateData([{
							variables: {
								[variableId]: {function: 'undefinedValue'}
							}
						}]);
					}
				}

			} else {
				throw new Error('datatype of value does not match datatype of variable');
			}
		}
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = VariableComponent; }
