var Raycaster = /** @class */ (function () {
    function Raycaster() {
        this.raycastClosest = RayCastClosest;
    }
    return Raycaster;
}());
var RayCastClosest = (function () {
    var def;
    def = {};
    def.reset = function () {
        def.hit = false;
        def.point = null;
        def.normal = null;
        def.fraction = 1;
    },
        def.callback = function (fixture, point, normal, fraction) {
            var body = fixture.getBody();
            var userData = body.getUserData();
            if (userData) {
                if (userData === 0) {
                    // By returning -1, we instruct the calling code to ignore this fixture and
                    // continue the ray-cast to the next fixture.
                    return -1.0;
                }
            }
            def.hit = true;
            def.point = point;
            def.normal = normal;
            def.fraction = fraction;
            // By returning the current fraction, we instruct the calling code to clip the ray and
            // continue the ray-cast to the next fixture. WARNING: do not assume that fixtures
            // are reported in order. However, by clipping, we can always get the closest fixture.
            return fraction;
        };
    return def;
})();
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = Raycaster;
}
//# sourceMappingURL=Raycaster.js.map