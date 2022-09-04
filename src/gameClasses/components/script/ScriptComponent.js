var ScriptComponent = IgeEntity.extend({
	classId: 'ScriptComponent',
	componentId: 'script',

	init: function () {
		var self = this;

		// self.logStr = "";
		self.entryCount = 0;
		self.showLog = false;
		self.errorLogs = {};
		self.currentScript = undefined;
		self.currentActionName = '';
		self.scriptCache = {};
		self.scriptTime = {};
		self.scriptRuns = {};
		self.last50Actions = [];

		ScriptComponent.prototype.log('initializing Script Component');
	},

	runScript: function (scriptId, localVariables) {
		var self = this;

		self.currentScriptId = scriptId;
		if (ige.game.data.scripts[scriptId]) {
			// var actions = JSON.parse(JSON.stringify(ige.game.data.scripts[scriptId].actions));
			var actions = self.getScriptActions(scriptId);
			if (actions) {
				var cmd = ige.action.run(actions, localVariables);
				if (cmd == 'return') {
					ige.log('script return called');
					return;
				}
			}
		}

		
	},

	getScriptActions: function (scriptId) {
		var self = this;
		if (self.scriptCache[scriptId] && (typeof mode === 'undefined' || (typeof mode === 'string' && mode != 'sandbox'))) {
			return self.scriptCache[scriptId];
		} else {
			var script = ige.game.data.scripts[scriptId];
			if (!script.actions) return null;
			if (script) {
				self.scriptCache[scriptId] = JSON.parse(JSON.stringify(script.actions));
				return self.scriptCache[scriptId];
			}
		}
		return null;
	},

	scriptLog: function (str, tabCount) {
		if (this.entryCount > 50000)
			return;

		this.entryCount++;

		tabs = '';
		for (i = 0; i < tabCount; i++) {
			tabs += '    ';
		}

		// if (ige.server.isScriptLogOn)
		// console.log(tabs+str)

		// this.logStr = this.logStr  + tabs + str

		// if (this.entryCount > 50000)
		// {

		// 	var filename = "logs/"+ige.server.serverId+"script.log"

		// 	fs.writeFile(filename, this.logStr, function(err) {
		// 	    if(err) {
		// 	        return ScriptComponent.prototype.log(err);
		// 	    }
		// 	});

		// 	ScriptComponent.prototype.log("file saved: ", filename)
		// 	this.logStr = ""
		// 	// this.entryCount = 0
		// }
	},

	recordLast50Action: function (action) {
		var self = this;

		if (self.last50Actions.length > 50) {
			self.last50Actions.shift();
		}

		var scriptName = '[scriptName undefined]';
		if (ige.game.data.scripts[this.currentScriptId]) {
			scriptName = ige.game.data.scripts[this.currentScriptId].name;
		}

		var record = `script '${scriptName}' in Action '${action}'`;
		self.last50Actions.push(record);
	},
	
	errorLog: function (message) {
		var script = ige.game.data.scripts[this.currentScriptId];
		var log = `Script error '${(script) ? script.name : ''}' in Action '${this.currentActionName}' : ${message}`;
		this.errorLogs[this.currentActionName] = log;
		ige.devLog('script errorLog', log, message);
		ScriptComponent.prototype.log(log);
		return log;
	}

});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = ScriptComponent; }
