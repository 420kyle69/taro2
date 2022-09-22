var ScriptComponent = IgeEntity.extend({
	classId: 'ScriptComponent',
	componentId: 'script',

	init: function (entity) {
		var self = this;
		
		self._entity = entity
		// self.logStr = "";
		self.scripts = undefined;
		self.entryCount = 0;
		self.showLog = false;
		self.errorLogs = {};
		self.currentScript = undefined;
		self.currentActionName = '';
		self.scriptCache = {};
		self.scriptTime = {};
		self.scriptRuns = {};
		self.last50Actions = [];

		self.addComponent(VariableComponent, entity);
		self.addComponent(ActionComponent, entity);
		self.addComponent(ConditionComponent, entity);

		ScriptComponent.prototype.log('initializing Script Component');
	},

	load: function(scripts) {
		this.scripts = scripts;
		// map trigger events, so we don't have to iterate through all scripts to find corresponding scripts
		this.triggeredScripts = {};
		for (var scriptId in this.scripts) {
			var script = this.scripts[scriptId];

			// look for matching trigger within the script's triggers
			if (script && script.triggers) {
				for (j = 0; j < script.triggers.length; j++) {
					var trigger = script.triggers[j];
					if (this.triggeredScripts[trigger.type] == undefined) {
						this.triggeredScripts[trigger.type] = [scriptId]
					} else {
						this.triggeredScripts[trigger.type].push(scriptId)
					}
				}
			}
		}
	},

	runScript: function (scriptId, params = {}) {
		var self = this;

		self.currentScriptId = scriptId;
		if (this.scripts && this.scripts[scriptId]) {
			// var actions = JSON.parse(JSON.stringify(this.scripts[scriptId].actions));
			var actions = self.getScriptActions(scriptId);
			if (actions) {
				var cmd = self.action.run(actions, params);
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
			var script = this.scripts[scriptId];
			if (!script.actions) return null;
			if (script) {
				self.scriptCache[scriptId] = JSON.parse(JSON.stringify(script.actions));
				return self.scriptCache[scriptId];
			}
		}
		return null;
	},
	
	/* trigger and run all of the corresponding script(s) */
	trigger: function (triggerName, triggeredBy) {
		
		
		if (ige.isServer) {
			var now = Date.now();		
			var lastTriggerRunTime = now - ige.lastTriggerRanAt;

			if (ige.lastTrigger) {
				if (ige.triggerProfiler[ige.lastTrigger]) {
					var count = ige.triggerProfiler[ige.lastTrigger].count;					
					ige.triggerProfiler[ige.lastTrigger].count++;					
					ige.triggerProfiler[ige.lastTrigger].avgTime = ((ige.triggerProfiler[ige.lastTrigger].avgTime * count) + lastTriggerRunTime ) / (count + 1)
					ige.triggerProfiler[ige.lastTrigger].totalTime += lastTriggerRunTime					 
				} else {
					ige.triggerProfiler[ige.lastTrigger] = {count: 1, avgTime: lastTriggerRunTime, totalTime: lastTriggerRunTime}
				}
			}

			ige.lastTrigger = triggerName;
			ige.lastTriggerRanAt = now;
		}

		let scriptIds = this.triggeredScripts[triggerName]
		
		for (var i in scriptIds) {
			let scriptId = scriptIds[i]
			this.scriptLog(`\ntrigger: ${triggerName}`);

			var localVariables = {
				triggeredBy: triggeredBy
			};

			// console.log(this._entity._category, triggerName, scriptId)
			this.runScript(scriptId, localVariables);
		}

		// built-in damaging system
		if (triggeredBy && triggeredBy.projectileId) {
			var projectile = ige.$(triggeredBy.projectileId);
			if (projectile && triggerName == 'unitTouchesProjectile') {
					var attackedUnit = ige.$(ige.game.lastTouchingUnitId);
					if (attackedUnit) {
						attackedUnit.inflictDamage(projectile._stats.damageData);
					}
			}
		}
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
		if (this.scripts[this.currentScriptId]) {
			scriptName = this.scripts[this.currentScriptId].name;
		}

		var record = `script '${scriptName}' in Action '${action}'`;
		self.last50Actions.push(record);
	},
	
	errorLog: function (message) {
		var script = this.scripts[this.currentScriptId];
		var log = `Script error '${(script) ? script.name : ''}' in Action '${this.currentActionName}' : ${message}`;
		this.errorLogs[this.currentActionName] = log;
		ige.devLog('script errorLog', log, message);
		ScriptComponent.prototype.log(log);
		return log;
	}

});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = ScriptComponent; }
