var localConfig = require('./local');
var stagingConfig = require('./staging');
var productionConfig = require('./production');
var standaloneConfig = require('./standalone');

module.exports = {
	local: localConfig,
	staging: stagingConfig,
	production: productionConfig,
	standalone: standaloneConfig,
	default: productionConfig
};
