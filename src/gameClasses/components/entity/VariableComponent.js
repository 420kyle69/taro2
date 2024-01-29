var VariableComponent = TaroEntity.extend({
	classId: 'VariableComponent',
	componentId: 'variable',

	init: function (entity, options) {
		var self = this;
		self._entity = entity;

		for (var variableId in self._entity.variables) {			
			var entityVariable = self._entity.variables[variableId];
			// if the variable is not defined, use the default value
			if (entityVariable == undefined || entityVariable.value == undefined) {				
				// self._entity.variables[variableId].value = entityVariable.default;
				self.update(variableId, entityVariable.default)
			}
		}

	},

	update: function (variableId, value) {
		var self = this;
		if (self._entity.variables[variableId] !== undefined) {
		
			var isDataTypeMatching = false; // flag to check if datatype of value matches datatype of variable
			var variableObj = self._entity.variables[variableId];
			var newValue = value;
			
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
				case 'projectile':
				case 'item':
				case 'player':
				case 'unit': {

					// if value is a string, then it's an id. find the matching entity
					if (typeof value === 'string') {
						value = taro.$(value);
					}
					
					isDataTypeMatching = typeof value === 'object' && value._category === variableObj.dataType;					
					// value = value._id;
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
					var newValue = value;				
					if (['projectile', 'item', 'unit', 'player', 'region'].includes(variableObj.dataType)) {
						newValue = value._id; // set value to id instead of object, because object causes circular JSON error
					}

					self._entity.variables[variableId].value = newValue;

					// console.log('VariableComponent.update', variableObj.dataType, variableId)
					if (taro.isServer) {
						if (
							variableObj.streamMode == null || variableObj.streamMode == 1 ||  // don't stream if streamMode isn't sync'ed (1). Also added != null for legacy support.
							variableObj.streamMode == 4 // streamMode 4 also sends to everyone. the ignoring part is done on client-side.
						) {
							self._entity.streamUpdateData([{
								variables: {
									[variableId]: newValue
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
	},

	getValue: function(variableId) {
		if (variableId) {
			var variableObj = this._entity.variables && this._entity.variables[variableId];
			if (variableObj) {
				returnValue = variableObj.value;

				if (['projectile', 'item', 'unit', 'player','region'].includes(variableObj.dataType)) {
					returnValue = taro.$(returnValue);
				}
				
				if (variableObj.dataType === 'region') {
					returnValue.key = variableId;
				}

				return returnValue;
			}
		}
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = VariableComponent; }
