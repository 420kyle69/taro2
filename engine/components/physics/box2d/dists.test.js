var script = function (url) {
    var protocol = new URL(url, 'file://').protocol;
    switch (protocol) {
        case 'file:':
            return require('fs').readFileSync("".concat(process.cwd(), "/").concat(url), 'UTF8');
        case 'http:':
        case 'https:':
            return String(require('child_process').execSync("wget -O - -o /dev/null '".concat(url, "'")));
        default:
            throw new Error('unsupported protocol');
    }
};
var files = ['box2dninjaWrapper.js', 'box2dwebWrapper.js', 'box2dwasmWrapper.js', 'box2dtsWrapper.js',
    'planckWrapper.js', 'nativeWrapper.js', 'box2dWrapper.js'];
for (var i = 0; i < files.length; i++) {
    eval(script("engine/components/physics/box2d/distsWrapper/".concat(files[i])));
}
var file = script('engine/components/physics/box2d/dists.js');
eval(file);
describe('init all physics engines', function () {
    test('every engine has init function', function () {
        expect(dists.BOX2D.init).not.toBeNull();
    });
    test('every engine could init', function () {
        expect(function () {
            dists.BOX2D.init({});
        }).not.toThrow();
    });
});
//# sourceMappingURL=dists.test.js.map