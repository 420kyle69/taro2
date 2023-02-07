// See the taro/engine/filters folder for the individual filter source
var TaroFilters = {};

if (typeof (window) !== 'undefined') {
	// Create a temporary canvas for the filter system to use
	TaroFilters.tmpCanvas = document.createElement('canvas');
	TaroFilters.tmpCtx = TaroFilters.tmpCanvas.getContext('2d');
}

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = TaroFilters; }
