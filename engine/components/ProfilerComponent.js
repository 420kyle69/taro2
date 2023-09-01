var ProfilerComponent = TaroEventingClass.extend({
	classId: 'ProfilerComponent',
	componentId: 'profiler',

	init: function () {
		this.isEnabled = true;
		this.timeElapsed = {}		
	},

	logTimeElapsed: function(path, startTime) {
		if (this.timeElapsed[path] == undefined) {
			this.timeElapsed[path] = {
				count: 0,
				avgTimeElapsed: 0
			}
		}
		
		var timeElapsed = performance.now() - startTime;
		var element = this.timeElapsed[path];
		this.timeElapsed[path].avgTimeElapsed = ((element.avgTimeElapsed * element.count) + timeElapsed) / (element.count + 1);
		// this.timeElapsed[path].avgTimeElapsed += timeElapsed;
		this.timeElapsed[path].count++;
	},

	printResults: function() {
		var output = []
		for (var path in this.timeElapsed) {
			output.push(path)
			output.push(this.timeElapsed[path].avgTimeElapsed.toFixed(2))
			output.push(this.timeElapsed[path].count)
		}
		// console.log(output.join(', '))

		console.log(this.timeElapsed)
		// this.timeElapsed = {};
	}

});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = ProfilerComponent; }
