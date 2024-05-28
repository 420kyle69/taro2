interface MergableKey {
	canMerge: boolean;
	preferWorld?: boolean | ((obj: any) => boolean);
	// when world json
	setIsWorldOnKeys?: string[];
	removeAllMapKeys?: boolean;
}

interface MergableKeys {
	[key: string]: MergableKey;
}
const mergeableKeys: MergableKeys = {
	entityTypeVariables: {
		canMerge: true,
		preferWorld: true,
	},
	shops: {
		canMerge: true,
		preferWorld: true,
	},
	animationTypes: {
		canMerge: true,
		preferWorld: true,
	},
	states: {
		canMerge: true,
		preferWorld: true,
	},
	map: {
		canMerge: false,
	},
	buffTypes: {
		canMerge: true,
		preferWorld: true,
	},
	unitTypes: {
		canMerge: true,
		preferWorld: true,
		setIsWorldOnKeys: ['scripts'],
	},
	projectileTypes: {
		canMerge: true,
		preferWorld: true,
		setIsWorldOnKeys: ['scripts'],
	},
	itemTypes: {
		canMerge: true,
		preferWorld: true,
		setIsWorldOnKeys: ['scripts'],
	},
	music: {
		canMerge: true,
		preferWorld: true,
	},
	dialogues: {
		canMerge: true,
		preferWorld: true,
	},
	sound: {
		canMerge: true,
		preferWorld: true,
	},
	scripts: {
		canMerge: true,
		preferWorld: true,
	},
	abilities: {
		canMerge: true,
		preferWorld: true,
	},
	variables: {
		canMerge: true,
		preferWorld: (object) => {
			return object?.dataType !== 'region';
		},
	},
	attributeTypes: {
		canMerge: true,
		preferWorld: true,
	},
	settings: {
		canMerge: false,
	},
	images: {
		canMerge: true,
		preferWorld: true,
	},
	tilesets: {
		canMerge: false,
	},
	factions: {
		canMerge: true,
		preferWorld: true,
	},
	playerTypes: {
		canMerge: true,
		preferWorld: true,
	},
	particles: {
		canMerge: true,
		preferWorld: true,
	},
	particleTypes: {
		canMerge: true,
		preferWorld: true,
	},
	bodyTypes: {
		canMerge: true,
		preferWorld: true,
	},
	playerTypeVariables: {
		canMerge: true,
		preferWorld: true,
	},
	ui: {
		canMerge: true,
		preferWorld: true,
        removeAllMapKeys: true
	},
	folders: {
		canMerge: false,
	},
	title: {
		canMerge: false,
	},
	isDeveloper: {
		canMerge: false,
	},
	releaseId: {
		canMerge: false,
	},
	roles: {
		canMerge: false,
	},
	defaultData: {
		canMerge: false,
	},
};

const shouldPreferWorldKey = (mergeKey: MergableKey, obj: any) => {
	if (typeof mergeKey.preferWorld === 'boolean' || typeof mergeKey.preferWorld === 'undefined') {
		return !!mergeKey.preferWorld;
	}
	return mergeKey.preferWorld(obj);
};

const mergeGameJson = function (worldJson: any, gameJson: any) {
    gameJson.data.defaultData.engineVersion = worldJson.data.defaultData.engineVersion;

	Object.keys(mergeableKeys).forEach((mergeableKey) => {
        if (mergeableKeys[mergeableKey].canMerge) {
            if (mergeableKeys[mergeableKey].removeAllMapKeys) {
                gameJson.data[mergeableKey] = {};
            }
            if (worldJson.data[mergeableKey]) {
                // cleanup all isWorld properties from gameJson (ideally there won't be any but just in case)
                if (typeof gameJson.data[mergeableKey] === 'object') {
                    Object.keys(gameJson.data[mergeableKey]).forEach((key) => {
                        if (gameJson.data[mergeableKey][key]?.isWorld) {
                            delete gameJson.data[mergeableKey][key]?.isWorld;
                        }
                    });
                }

                if (typeof worldJson.data[mergeableKey] === 'object' && Array.isArray(worldJson.data[mergeableKey])) {
                    // merge/concat all elements of the array
                    gameJson.data[mergeableKey] = worldJson.data[mergeableKey].concat(gameJson.data[mergeableKey] || []);
                } else if (typeof worldJson.data[mergeableKey] === 'object') {
                    if (!gameJson.data[mergeableKey]) {
                        gameJson.data[mergeableKey] = {};
                    }

                    const gameJsonData = gameJson.data[mergeableKey];
                    gameJson.data[mergeableKey] = worldJson.data[mergeableKey];
              
                    // set isWorld property for all required keys
                    Object.keys(gameJson.data[mergeableKey]).forEach(key => {
                        if (typeof gameJson.data[mergeableKey][key] === 'object') {
                            gameJson.data[mergeableKey][key].isWorld = true;
                            mergeableKeys[mergeableKey].setIsWorldOnKeys && mergeableKeys[mergeableKey].setIsWorldOnKeys?.forEach((setIsWorldOnKey) => {
                                if (typeof gameJson.data[mergeableKey][key][setIsWorldOnKey] === 'object') {
                                    for (const subIndex in gameJson.data[mergeableKey][key][setIsWorldOnKey]) {
                                        if (
                                            gameJson.data[mergeableKey][key][setIsWorldOnKey].hasOwnProperty(subIndex) &&
                                            typeof gameJson.data[mergeableKey][key][setIsWorldOnKey][subIndex] === 'object'
                                        ) {
                                            gameJson.data[mergeableKey][key][setIsWorldOnKey][subIndex].isWorld = true;
                                        }
                                    }
                                }
                            });
                        }
                    });

                    // set game json properties thata re not in world json
                    for (const key in gameJsonData) {
                        if (
                            gameJsonData.hasOwnProperty(key) &&
                            gameJsonData[key] &&
                            typeof gameJsonData[key] === 'object'
                        ) {
                            if (shouldPreferWorldKey(mergeableKeys[mergeableKey], gameJson.data[mergeableKey][key])) {
                                if (typeof gameJson.data[mergeableKey][key] === 'undefined') {
                                    gameJson.data[mergeableKey][key] = gameJsonData[key];
                                }
                            } else {
                                // overwrite map object if preferWorld is not true.
                                gameJson.data[mergeableKey][key] = gameJsonData[key];
                            }
                        }
                    }
                } else {
                    if (shouldPreferWorldKey(mergeableKeys[mergeableKey], null)) {
                        // when merging strings/boolean/numbers
                        gameJson.data[mergeableKey] = worldJson.data[mergeableKey];
                    }
                }
            }
        }
    });

	return gameJson;
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = mergeGameJson;
}
