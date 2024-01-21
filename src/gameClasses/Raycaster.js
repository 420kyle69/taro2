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
        this.engine = taro.physics.engine;
        this.world = taro.physics.world();
        this.scaleRatio = taro.physics._scaleRatio;
        this.data = {};
        this.closest = RayCastClosest();
        this.multiple = RayCastMultiple();
        this.any = RaycastAny();
        this.forwardHit = false;
        this.reverseHit = false;
    }
    Raycaster.prototype.raycastLine = function (start, end) {
        var _a, _b, _c, _d;
        // reverse
        var raycast = this.multiple;
        raycast.reset();
        var pEnd = new taro.physics.box2D.b2Vec2(end.x, end.y);
        var pStart = new taro.physics.box2D.b2Vec2(start.x, start.y);
        this.world.rayCast(taro.physics.box2D ? pEnd : end, taro.physics.box2D ? pStart : start, raycast.callback);
        taro.game.entitiesCollidingWithLastRaycast = _.clone(raycast.entities);
        // forward
        raycast.reset();
        this.world.rayCast(taro.physics.box2D ? pStart : start, taro.physics.box2D ? pEnd : end, raycast.callback);
        var missedEntities = _.difference(taro.game.entitiesCollidingWithLastRaycast, raycast.entities);
        missedEntities.forEach(function (x) { return x.raycastFraction = 1 - x.raycastFraction; });
        taro.game.entitiesCollidingWithLastRaycast = __spreadArray(__spreadArray([], raycast.entities, true), missedEntities, true);
        taro.game.entitiesCollidingWithLastRaycast = this.sortHits(taro.game.entitiesCollidingWithLastRaycast);
        (_b = (_a = taro.physics).destroyB2dObj) === null || _b === void 0 ? void 0 : _b.call(_a, pEnd);
        (_d = (_c = taro.physics).destroyB2dObj) === null || _d === void 0 ? void 0 : _d.call(_c, pStart);
        //debug
        // console.log(taro.game.entitiesCollidingWithLastRaycast.map(x=> `${x.id()} ${x._category} ${x.raycastFraction}`));
    };
    Raycaster.prototype.raycastBullet = function (start, end) {
        var _a, _b, _c, _d, _e, _f, _g;
        // forward
        var forwardRaycast = this.closest;
        forwardRaycast.reset();
        var pStart = new taro.physics.box2D.b2Vec2(start.x, start.y);
        var pEnd = new taro.physics.box2D.b2Vec2(end.x, end.y);
        this.world.rayCast(taro.physics.box2D ? pStart : start, taro.physics.box2D ? pEnd : end, forwardRaycast.callback // though it is currently hard-coded for 'Closest'
        );
        taro.game.entitiesCollidingWithLastRaycast = forwardRaycast.entity ? [forwardRaycast.entity] : [];
        this.forwardHit = true;
        var point = (_a = forwardRaycast.point) !== null && _a !== void 0 ? _a : end;
        var pPoint = new taro.physics.box2D.b2Vec2(point.x, point.y);
        var fraction = forwardRaycast.fraction;
        // reverse
        var reverseRaycast = this.any;
        reverseRaycast.reset();
        this.world.rayCast(taro.physics.box2D ? pPoint : point, taro.physics.box2D ? pStart : start, reverseRaycast.callback);
        if (reverseRaycast.hit) {
            // we were obstructed when shooting
            this.reverseHit = true;
            taro.game.entitiesCollidingWithLastRaycast = [];
        }
        var bulletReturn = {
            start: start,
            point: point,
            fraction: fraction,
            obstructed: this.forwardHit === this.reverseHit
        };
        this.forwardHit = false;
        this.reverseHit = false;
        (_c = (_b = taro.physics).destroyB2dObj) === null || _c === void 0 ? void 0 : _c.call(_b, pEnd);
        (_e = (_d = taro.physics).destroyB2dObj) === null || _e === void 0 ? void 0 : _e.call(_d, pStart);
        (_g = (_f = taro.physics).destroyB2dObj) === null || _g === void 0 ? void 0 : _g.call(_f, pPoint);
        return bulletReturn;
    };
    Raycaster.prototype.sortHits = function (array) {
        return array = _.orderBy(array, ['raycastFraction'], ['asc']);
    };
    Raycaster.prototype.renderBullet = function (start, end, config) {
        taro.client.emit('create-ray', {
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
        var _a, _b;
        def.hit = false;
        def.point = null;
        def.normal = null;
        def.entity = null;
        def.fraction = 1;
        (_b = (_a = taro.physics).destroyB2dObj) === null || _b === void 0 ? void 0 : _b.call(_a, def.callback);
    };
    switch (taro.physics.engine) {
        case 'BOX2DWASM':
            var box2D = taro.physics.box2D;
            var b2Fixture_1 = box2D.b2Fixture, b2Vec2_1 = box2D.b2Vec2, JSRayCastCallback = box2D.JSRayCastCallback, wrapPointer_1 = box2D.wrapPointer;
            def.callback = Object.assign(new JSRayCastCallback(), {
                /**
                 * @param {number} fixture_p pointer to {@link Box2D.b2Fixture}
                 * @param {number} point_p pointer to {@link Box2D.b2Vec2}
                 * @param {number} normal_p pointer to {@link Box2D.b2Vec2}
                 * @param {number} fraction
                 * @returns {number} -1 to filter, 0 to terminate, fraction to clip the ray for closest hit, 1 to continue
                 */
                ReportFixture: function (fixture_p, point_p, normal_p, fraction) {
                    var fixture = taro.physics.recordLeak(wrapPointer_1(fixture_p, b2Fixture_1));
                    var point = taro.physics.recordLeak(wrapPointer_1(point_p, b2Vec2_1));
                    var normal = taro.physics.recordLeak(wrapPointer_1(normal_p, b2Vec2_1));
                    var body = taro.physics.recordLeak(fixture.GetBody());
                    var taroId = taro.physics.metaData[taro.physics.getPointer(body)].taroId;
                    var entity = taro.$(taroId);
                    taro.physics.destroyB2dObj(fixture_p);
                    if (entity &&
                        (entity._category === 'unit' ||
                            entity._category === 'wall')) {
                        entity.lastRaycastCollisionPosition = {
                            x: point.x * taro.physics._scaleRatio,
                            y: point.y * taro.physics._scaleRatio
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
                }
            });
            break;
        default:
            def.callback = function (fixture, point, normal, fraction) {
                var fixtureList = fixture.m_body.m_fixtureList;
                var entity = fixtureList && fixtureList.taroId && taro.$(fixtureList.taroId);
                if (entity &&
                    (entity._category === 'unit' ||
                        entity._category === 'wall')) {
                    entity.lastRaycastCollisionPosition = {
                        x: point.x * taro.physics._scaleRatio,
                        y: point.y * taro.physics._scaleRatio
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
            break;
    }
    return def;
});
var RayCastMultiple = (function () {
    var def;
    def = {};
    // var raycastCollidesWith = self._stats.raycastCollidesWith; // outdated?
    def.points = [];
    def.normals = [];
    def.entities = [];
    def.reset = function () {
        var _a, _b;
        def.points = [];
        def.normals = [];
        def.entities = [];
        (_b = (_a = taro.physics).destroyB2dObj) === null || _b === void 0 ? void 0 : _b.call(_a, def.callback);
    };
    switch (taro.physics.engine) {
        case 'BOX2DWASM':
            var box2D = taro.physics.box2D;
            var b2Fixture_2 = box2D.b2Fixture, b2Vec2_2 = box2D.b2Vec2, JSRayCastCallback = box2D.JSRayCastCallback, wrapPointer_2 = box2D.wrapPointer;
            def.callback = Object.assign(new JSRayCastCallback(), {
                /**
                 * @param {number} fixture_p pointer to {@link Box2D.b2Fixture}
                 * @param {number} point_p pointer to {@link Box2D.b2Vec2}
                 * @param {number} normal_p pointer to {@link Box2D.b2Vec2}
                 * @param {number} fraction
                 * @returns {number} -1 to filter, 0 to terminate, fraction to clip the ray for closest hit, 1 to continue
                 */
                ReportFixture: function (fixture_p, point_p, normal_p, fraction) {
                    var fixture = taro.physics.recordLeak(wrapPointer_2(fixture_p, b2Fixture_2));
                    var point = taro.physics.recordLeak(wrapPointer_2(point_p, b2Vec2_2));
                    var normal = taro.physics.recordLeak(wrapPointer_2(normal_p, b2Vec2_2));
                    var body = taro.physics.recordLeak(fixture.GetBody());
                    var taroId = taro.physics.metaData[taro.physics.getPointer(body)].taroId;
                    var entity = taro.$(taroId);
                    if (entity &&
                        (entity._category === 'unit' ||
                            entity._category === 'wall')) {
                        entity.lastRaycastCollisionPosition = {
                            x: point.x * taro.physics._scaleRatio,
                            y: point.y * taro.physics._scaleRatio
                        };
                        entity.raycastFraction = fraction;
                        def.entities.push(entity);
                    }
                    def.points.push(point);
                    def.normals.push(normal);
                    // By returning 1, we instruct the caller to continue without clipping the
                    // ray.
                    taro.physics.destroyB2dObj(fixture_p);
                    return 1.0;
                }
            });
            break;
        default:
            def.callback = function (fixture, point, normal, fraction) {
                var fixtureList = fixture.m_body.m_fixtureList;
                var entity = fixtureList && fixtureList.taroId && taro.$(fixtureList.taroId);
                if (entity &&
                    (entity._category === 'unit' ||
                        entity._category === 'wall')) {
                    entity.lastRaycastCollisionPosition = {
                        x: point.x * taro.physics._scaleRatio,
                        y: point.y * taro.physics._scaleRatio
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
            break;
    }
    return def;
});
var RaycastAny = (function () {
    var def;
    def = {};
    def.reset = function () {
        var _a, _b;
        def.hit = false;
        def.point = null;
        def.normal = null;
        (_b = (_a = taro.physics).destroyB2dObj) === null || _b === void 0 ? void 0 : _b.call(_a, def.callback);
    };
    switch (taro.physics.engine) {
        case 'BOX2DWASM':
            var box2D = taro.physics.box2D;
            var b2Fixture_3 = box2D.b2Fixture, b2Vec2_3 = box2D.b2Vec2, JSRayCastCallback = box2D.JSRayCastCallback, wrapPointer_3 = box2D.wrapPointer;
            def.callback = Object.assign(new JSRayCastCallback(), {
                /**
                 * @param {number} fixture_p pointer to {@link Box2D.b2Fixture}
                 * @param {number} point_p pointer to {@link Box2D.b2Vec2}
                 * @param {number} normal_p pointer to {@link Box2D.b2Vec2}
                 * @param {number} fraction
                 * @returns {number} -1 to filter, 0 to terminate, fraction to clip the ray for closest hit, 1 to continue
                 */
                ReportFixture: function (fixture_p, point_p, normal_p, fraction) {
                    var fixture = taro.physics.recordLeak(wrapPointer_3(fixture_p, b2Fixture_3));
                    var point = taro.physics.recordLeak(wrapPointer_3(point_p, b2Vec2_3));
                    var normal = taro.physics.recordLeak(wrapPointer_3(normal_p, b2Vec2_3));
                    var body = taro.physics.recordLeak(fixture.GetBody());
                    var taroId = taro.physics.metaData[taro.physics.getPointer(body)].taroId;
                    var entity = taro.$(taroId);
                    taro.physics.destroyB2dObj(fixture_p);
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
                }
            });
            break;
        default:
            def.callback = function (fixture, point, normal) {
                var fixtureList = fixture.m_body.m_fixtureList;
                var entity = fixtureList && fixtureList.taroId && taro.$(fixtureList.taroId);
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
            break;
    }
    return def;
});
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = Raycaster;
}
//# sourceMappingURL=Raycaster.js.map