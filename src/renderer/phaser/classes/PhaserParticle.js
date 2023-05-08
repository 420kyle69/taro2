var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var PhaserParticle = /** @class */ (function (_super) {
    __extends(PhaserParticle, _super);
    function PhaserParticle(scene, particle) {
        var _this = this;
        var data = particle.data;
        var frame = scene.textures.getFrame("particle/".concat(data.url));
        var config = __assign({ scaleX: data.dimensions.width / frame.width, scaleY: data.dimensions.height / frame.height }, particle.config);
        if (data.emitZone && data.emitZone.x && data.emitZone.y) {
            config.emitZone = new Phaser.GameObjects.Particles.Zones.RandomZone(new Phaser.Geom.Rectangle(-data.emitZone.x / 2, -data.emitZone.y / 2, data.emitZone.x, data.emitZone.y));
        }
        ;
        //@ts-ignore //there seems to be an issue with phaser's type def for particleEmitter
        _this = _super.call(this, scene, particle.position.x, particle.position.y, "particle/".concat(data.url), config) || this;
        if (particle.entityId) {
            var entity = scene.findEntity(particle.entityId);
            entity.attachedParticles.push(_this);
            _this.startFollow(entity.gameObject);
        }
        _this.setDepth(data["z-index"].depth);
        _this.on('complete', function (emitter) { emitter.destroy(); });
        scene.entityLayers[data["z-index"].layer - 1].add(_this);
        return _this;
    }
    return PhaserParticle;
}(Phaser.GameObjects.Particles.ParticleEmitter));
//# sourceMappingURL=PhaserParticle.js.map