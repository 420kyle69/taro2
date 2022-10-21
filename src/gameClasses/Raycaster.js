var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Raycaster = /** @class */ (function () {
    function Raycaster() {
        this.engine = ige.physics.engine;
        this.world = ige.physics.world();
        this.scaleRatio = ige.physics._scaleRatio;
        this.data = {};
        this.closest = RayCastClosest;
        this.multiple = RayCastMultiple;
        this.any = RaycastAny;
        this.forwardHit = false;
        this.reverseHit = false;
    }
    Raycaster.prototype.raycastLine = function (start, end) {
        // reverse
        var raycast = this.multiple;
        raycast.reset();
        this.world.rayCast(end, start, raycast.callback);
        ige.game.entitiesCollidingWithLastRaycast = _.clone(raycast.entities);
        // forward
        raycast.reset();
        this.world.rayCast(start, end, raycast.callback);
        var missedEntities = _.difference(ige.game.entitiesCollidingWithLastRaycast, raycast.entities);
        missedEntities.forEach(function (x) { return x.raycastFraction = 1 - x.raycastFraction; });
        ige.game.entitiesCollidingWithLastRaycast = __spreadArray(__spreadArray([], raycast.entities, true), missedEntities, true);
        ige.game.entitiesCollidingWithLastRaycast = this.sortHits(ige.game.entitiesCollidingWithLastRaycast);
        //debug
        // console.log(ige.game.entitiesCollidingWithLastRaycast.map(x=> `${x.id()} ${x._category} ${x.raycastFraction}`));
    };
    Raycaster.prototype.raycastBullet = function (start, end) {
        // forward
        var forwardRaycast = this.closest;
        forwardRaycast.reset();
        this.world.rayCast(start, end, forwardRaycast.callback // though it is currently hard-coded for 'Closest'
        );
        ige.game.entitiesCollidingWithLastRaycast = forwardRaycast.entity ? [forwardRaycast.entity] : [];
        this.forwardHit = true;
        var point = forwardRaycast.point ? forwardRaycast.point : end;
        var fraction = forwardRaycast.fraction;
        // reverse
        var reverseRaycast = this.any;
        reverseRaycast.reset();
        this.world.rayCast(point, start, reverseRaycast.callback);
        if (reverseRaycast.hit) {
            // we were obstructed when shooting
            this.reverseHit = true;
            ige.game.entitiesCollidingWithLastRaycast = [];
        }
        var bulletReturn = {
            start: start,
            point: point,
            fraction: fraction,
            obstructed: this.forwardHit === this.reverseHit
        };
        this.forwardHit = false;
        this.reverseHit = false;
        return bulletReturn;
    };
    Raycaster.prototype.sortHits = function (array) {
        return array = _.orderBy(array, ['raycastFraction'], ['asc']);
    };
    Raycaster.prototype.renderBullet = function (start, end, config) {
        ige.client.emit('create-ray', {
            start: {
                x: start.x * this.scaleRatio,
                y: start.y * this.scaleRatio
            },
            end: {
                x: end.x * this.scaleRatio,
                y: end.y * this.scaleRatio
            },
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
        def.entity = null;
        def.fraction = 1;
    };
    def.callback = function (fixture, point, normal, fraction) {
        var fixtureList = fixture.m_body.m_fixtureList;
        var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
        if (entity &&
            (entity._category === 'unit' ||
                entity._category === 'wall')) {
            entity.lastRaycastCollisionPosition = {
                x: point.x * ige.physics._scaleRatio,
                y: point.y * ige.physics._scaleRatio
            };
            entity.raycastFraction = fraction;
            def.entity = entity;
            def.hit = true;
            def.point = point;
            def.normal = normal;
            def.fraction = fraction;
            return fraction;
        }
        else if (entity) {
            return -1.0;
        }
        return fraction;
        // By returning the current fraction, we instruct the calling code to clip the ray and
        // continue the ray-cast to the next fixture. WARNING: do not assume that fixtures
        // are reported in order. However, by clipping, we can always get the closest fixture.
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
        var fixtureList = fixture.m_body.m_fixtureList;
        var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
        if (entity &&
            (entity._category === 'unit' ||
                entity._category === 'wall')) {
            entity.lastRaycastCollisionPosition = {
                x: point.x * ige.physics._scaleRatio,
                y: point.y * ige.physics._scaleRatio
            };
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
var RaycastAny = (function () {
    var def;
    def = {};
    def.reset = function () {
        def.hit = false;
        def.point = null;
        def.normal = null;
    };
    def.callback = function (fixture, point, normal, fraction) {
        var fixtureList = fixture.m_body.m_fixtureList;
        var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
        if (entity &&
            (entity._category === 'unit' ||
                entity._category === 'wall')) {
            def.hit = true;
            def.point = point;
            def.normal = normal;
            return 0.0;
        }
        else if (entity) {
            return -1.0;
        }
    };
    return def;
})();
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = Raycaster;
}
//# sourceMappingURL=Raycaster.js.map