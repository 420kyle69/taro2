var Raycaster = /** @class */ (function () {
    function Raycaster() {
        this.world = ige.physics.world();
        this.raycastClosest = RayCastClosest;
        // CONFIG
    }
    Raycaster.prototype.raycast = function (start, end, method) {
        var callback, reset;
        switch (method) {
            case 'closest':
                reset = this.raycastClosest.reset;
                callback = this.raycastClosest.callback;
                break;
            case 'multiple':
        }
        reset();
        this.world.rayCast(start, end, callback);
    };
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
    };
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