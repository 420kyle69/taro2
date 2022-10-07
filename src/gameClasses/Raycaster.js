var Raycaster = /** @class */ (function () {
    function Raycaster() {
        this.world = ige.physics.world();
        this.scaleRatio = ige.physics._scaleRatio;
        this.data = {};
        this.closest = RayCastClosest;
        this.multiple = RayCastMultiple;
        // CONFIG: info about which physics engine we are using
    }
    Raycaster.prototype.raycast = function (start, end, config) {
        var callback, reset;
        this.data = {};
        switch (config.method) {
            case 'closest':
                this.data = this[config.method];
                reset = this.data.reset;
                callback = this.data.callback;
                break;
            case 'multiple':
                this.data = this[config.method];
                reset = this.data.reset;
                callback = this.data.callback;
                break;
        }
        reset();
        this.world.rayCast(start, end, callback);
        if (ige.isClient) {
            end = (config.method === 'closest' && this.data.point) ?
                {
                    x: this.data.point.x * this.scaleRatio,
                    y: this.data.point.y * this.scaleRatio
                } :
                {
                    x: end.x * this.scaleRatio,
                    y: end.y * this.scaleRatio
                };
            this.drawRay(start, end, config);
        }
        console.log(this.data);
    };
    Raycaster.prototype.drawRay = function (start, end, config) {
        ige.client.emit('create-ray', {
            start: {
                x: start.x * this.scaleRatio,
                y: start.y * this.scaleRatio
            },
            end: end,
            config: config
        });
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
        console.log(fixture);
        // var fixtureList = fixture.m_body.m_fixtureList;
        // var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
        // if (entity) {
        // 	entity.raycastFraction = fraction;
        // 	def.entities.push(entity);
        // }
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
var RayCastMultiple = (function () {
    var def;
    def = {};
    // var raycastCollidesWith = self._stats.raycastCollidesWith; // outdated?
    def.points = [];
    def.normals = [];
    def.entities = [];
    def.reset = function () {
        def.points = [];
        def.normals = [];
        def.entities = [];
    };
    def.callback = function (fixture, point, normal, fraction) {
        var body = fixture.getBody();
        var userData = body.getUserData();
        if (userData) {
            if (userData == 0) {
                // By returning -1, we instruct the calling code to ignore this fixture
                // and continue the ray-cast to the next fixture.
                return -1.0;
            }
        }
        console.log(fixture);
        var fixtureList = fixture.m_body.m_fixtureList;
        var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
        if (entity) {
            entity.raycastFraction = fraction;
            def.entities.push(entity);
        }
        def.points.push(point);
        def.normals.push(normal);
        // By returning 1, we instruct the caller to continue without clipping the
        // ray.
        return 1.0;
    };
    return def;
})();
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = Raycaster;
}
//# sourceMappingURL=Raycaster.js.map