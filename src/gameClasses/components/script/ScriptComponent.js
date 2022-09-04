var ScriptComponent = IgeEntity.extend({
	classId: 'ScriptComponent',
	componentId: 'script',

	init: function () {
		var self = this;

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

	runScript: function (scriptId, params) {
		var self = this;

		self.currentScriptId = scriptId;
		if (this.scripts[scriptId]) {
			// var actions = JSON.parse(JSON.stringify(this.scripts[scriptId].actions));
			var actions = self.getScriptActions(scriptId);
			if (actions) {
				var cmd = ige.action.run(actions, params);
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
		let scriptIds = this.triggeredScripts[triggerName]
		for (i in scriptIds) {
			let scriptId = scriptIds[i]
			this.scriptLog(`\ntrigger: ${triggerName}`);

			var localVariables = {
				triggeredBy: triggeredBy
			};
			this.runScript(scriptId, localVariables);
		}

		if (triggeredBy && triggeredBy.projectileId) {
			var projectile = ige.$(triggeredBy.projectileId);
			if (projectile) {
				switch (triggerName) {
					case 'unitTouchesProjectile':
						var attackedUnit = ige.$(ige.game.lastTouchingUnitId);
						if (attackedUnit) {
							var damageHasBeenInflicted = attackedUnit.inflictDamage(projectile._stats.damageData);

							if (projectile._stats.destroyOnContactWith && projectile._stats.destroyOnContactWith.units && damageHasBeenInflicted) {
								projectile.destroy();
							}
						}
						break;
					case 'projectileTouchesDebris':
						if (projectile._stats.destroyOnContactWith && projectile._stats.destroyOnContactWith.debris) {
							projectile.destroy();
						}
						break;
					case 'projectileTouchesItem':
						if (projectile._stats.destroyOnContactWith && projectile._stats.destroyOnContactWith.items) {
							projectile.destroy();
						}
						break;
					case 'projectileTouchesWall':
						if (projectile._stats.destroyOnContactWith && projectile._stats.destroyOnContactWith.walls) {
							projectile.destroy();
						}
						break;
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
