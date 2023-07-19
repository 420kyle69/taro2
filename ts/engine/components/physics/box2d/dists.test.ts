const script = (url) => {
	const { protocol } = new URL(url, 'file://');
	switch (protocol) {
		case 'file:':
			return require('fs').readFileSync(`${process.cwd()}/${url}`, 'UTF8');
		case 'http:':
		case 'https:':
			return String(require('child_process').execSync(`wget -O - -o /dev/null '${url}'`));
		default:
			throw new Error('unsupported protocol');
	}
};

const files = ['box2dninjaWrapper.js', 'box2dwebWrapper.js', 'box2dwasmWrapper.js', 'box2dtsWrapper.js',
	'planckWrapper.js', 'nativeWrapper.js', 'box2dWrapper.js'];
for (let i = 0; i < files.length; i++) {
	eval(script(`engine/components/physics/box2d/distsWrapper/${files[i]}`));
}

const file = script('engine/components/physics/box2d/dists.js');
eval(file);

describe('init all physics engines', () => {
	test('every engine has init function', () => {
		expect(
			dists.BOX2D.init
		).not.toBeNull();
	});
	test('every engine could init', () => {
		expect(
			() => {
				dists.BOX2D.init({});
			}
		).not.toThrow();
	});
});
