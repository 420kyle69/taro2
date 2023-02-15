var pathArray = window.location.href.split('/');
var taroRoot = `http://${pathArray[2]}/engine/`;
var taroClientRoot = `http://${pathArray[2]}/src/`;

console.log('taroRoot', taroRoot);

window.taroLoader = (function () {
	// Load the engine stylesheet
	// var css = document.createElement('link');
	// css.rel = 'stylesheet';
	// css.type = 'text/css';
	// css.media = 'all';
	// css.href = taroRoot + 'css/taro.css';

	// document.getElementsByTagName('head')[0].appendChild(css);

	var TaroLoader = function () {
		var self = this;
		var ccScript;

		this._loadingCount = 0;

		// Load the clientConfig.js file into browser memory
		ccScript = document.createElement('script');
		ccScript.src = `${taroRoot}CoreConfig.js`;
		ccScript.onload = function () {
			self.loadCoreConfig();
		};
		ccScript.addEventListener('error', function () {
			throw (`ERROR LOADING ${taroRoot}CoreConfig.js` + ' - does it exist?');
		}, true);

		// // Load the physicsConfig.js file into browser memory
		// pcScript = document.createElement('script');
		// pcScript.src = `${taroRoot}PhysicsConfig.js`;

		// ccScript.addEventListener('error', function () {
		// 	throw (`ERROR LOADING ${taroRoot}PhysicsConfig.js` + ' - does it exist?');
		// }, true);

		document.getElementsByTagName('head')[0].appendChild(ccScript);
		// document.getElementsByTagName('head')[0].appendChild(pcScript);
	};

	TaroLoader.prototype.loadCoreConfig = function () {
		var self = this;

		if (typeof (taroCoreConfig) !== 'undefined') {
			// Load the client config
			ccScript = document.createElement('script');
			ccScript.src = `${taroClientRoot}ClientConfig.js`;
			ccScript.onload = function () {
				self.loadClientConfig();
			};
			ccScript.addEventListener('error', function () {
				throw ('ERROR LOADING ClientConfig.js - does it exist?');
			}, true);

			document.getElementsByTagName('head')[0].appendChild(ccScript);
		} else {
			throw ('ERROR READING taroCoreConfig object - was it specified in CoreConfig.js?');
		}
	};

	TaroLoader.prototype.loadClientConfig = function () {
		// Add the two array items into a single array
		this._coreList = taroCoreConfig.include;
		this._clientList = taroClientConfig.include;

		this._fileList = [];
		for (i = 0; i < this._coreList.length; i++) {
			// Check that the file should be loaded on the client
			if (this._coreList[i][0].indexOf('c') > -1) {
				this._fileList.push(taroRoot + this._coreList[i][2]);
			}
		}

		for (i = 0; i < this._clientList.length; i++) {
			this._fileList.push(taroClientRoot + this._clientList[i]);
		}

		this.loadNext();
	};

	// TaroLoader.prototype.loadPhysicsConfig = function (clientPhysicsEngine, serverPhysicsEngine, callback) {
	// 	// this.fileList should be empty after loadNext runs the first time
	// 	// but lets show it and comment it out
	// 	// this._fileList = [];
	// 	this.callback = callback;
	// 	// ternary to create an empty array if we are passed physicsEngine = ''
	// 	this._physicsList = taroPhysicsConfig.taroPhysicsChoices[clientPhysicsEngine] ?
	// 		taroPhysicsConfig.taroPhysicsChoices[clientPhysicsEngine] :
	// 		// we need to have an TaroEntityPhysics class no matter what
	// 		// 3/31/22 ran into an issue with this hack when I tried to add a file to PhysicsConfig
	// 		[taroPhysicsConfig.taroPhysicsChoices[serverPhysicsEngine][1]];

	// 	this._physicsGameClasses = taroPhysicsConfig.gameClasses;
	// 	for (i = 0; i < this._physicsList.length; i++) {
	// 		// Check that the file should be loaded on the client
	// 		if (this._physicsList[i][0].indexOf('c') > -1) {
	// 			this._fileList.push(taroRoot + this._physicsList[i][2].slice(2));
	// 		}
	// 	}

	// 	for (i = 0; i < this._physicsGameClasses.length; i++) {
	// 		// Check that the file should be loaded on the client
	// 		if (this._physicsGameClasses[i][0].indexOf('c') > -1) {
	// 			this._fileList.push(taroClientRoot + this._physicsGameClasses[i][2].slice(7));
	// 		}
	// 	}

	// 	this.loadNext();
	// };

	TaroLoader.prototype.loadNext = function () {
		var url = this._fileList.shift();
		var script = document.createElement('script');
		var self = this;

		if (url !== undefined) {
			script.src = url;
			script.onload = function () {
				self.loadNext();
			};

			script.addEventListener('error', function () {
				throw (`ERROR LOADING ${url} - does it exist?`);
			}, true);

			document.getElementsByTagName('head')[0].appendChild(script);
		} else {
			if (typeof this.callback === 'function') {
				this.callback();
			}
		}
	};

	return new TaroLoader();
}());
