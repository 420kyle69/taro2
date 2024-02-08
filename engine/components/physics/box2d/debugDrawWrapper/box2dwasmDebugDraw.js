/**
 * Forked from Box2D.js
 * @see https://github.com/kripken/box2d.js/blob/49dddd6/helpers/embox2d-html5canvas-debugDraw.js
 * @author dmagunov + fork contributions from Alex Birch
 * @license Zlib https://opensource.org/licenses/Zlib
 * License evidence: https://github.com/kripken/box2d.js/blob/master/README.markdown#box2djs
 *   "box2d.js is zlib licensed, just like Box2D."
 */
class Box2dDebugDraw {
    constructor(box2D, helpers, context, canvasScaleFactor) {
        this.box2D = box2D;
        this.helpers = helpers;
        this.context = context;
        this.canvasScaleFactor = canvasScaleFactor;
        this.setColorFromDebugDrawCallback = (color_p) => {
            const { wrapPointer, b2Color } = this.box2D;
            const col = wrapPointer(color_p, b2Color);
            const red = (col.get_r() * 255) | 0;
            const green = (col.get_g() * 255) | 0;
            const blue = (col.get_b() * 255) | 0;
            const colNum = red << 16 | green << 8 | blue;
            this.context.lineStyle(1 / 30, 0x000, 0.5);
            this.context.fillStyle(colNum, 0.5);
        };
        this.drawPoint = (vec_p, sizeMetres, color_p) => {
            const { wrapPointer, b2Vec2 } = this.box2D;
            const vert = wrapPointer(vec_p, b2Vec2);
            this.setColorFromDebugDrawCallback(color_p);
            const sizePixels = sizeMetres / this.canvasScaleFactor;
            this.context.fillRect(vert.get_x() - sizePixels / 2, vert.get_y() - sizePixels / 2, sizePixels, sizePixels);
        };
        this.drawSegment = (vert1_p, vert2_p) => {
            const { wrapPointer, b2Vec2 } = this.box2D;
            const vert1V = wrapPointer(vert1_p, b2Vec2);
            const vert2V = wrapPointer(vert2_p, b2Vec2);
            this.context.beginPath();
            this.context.moveTo(vert1V.get_x(), vert1V.get_y());
            this.context.lineTo(vert2V.get_x(), vert2V.get_y());
            this.context.stroke();
        };
        this.drawPolygon = (vertices, vertexCount, fill) => {
            const { wrapPointer, b2Vec2 } = this.box2D;
            this.context.beginPath();
            for (let tmpI = 0; tmpI < vertexCount; tmpI++) {
                const vert = wrapPointer(vertices + (tmpI * 8), b2Vec2);
                if (tmpI === 0) {
                    this.context.moveTo(vert.get_x(), vert.get_y());
                }
                else {
                    this.context.lineTo(vert.get_x(), vert.get_y());
                }
            }
            this.context.closePath();
            if (fill) {
                this.context.fill();
            }
            this.context.stroke();
        };
        this.drawCircle = (center_p, radius, axis_p, fill) => {
            const { wrapPointer, b2Vec2 } = this.box2D;
            const { copyVec2, scaledVec2 } = this.helpers;
            const centerV = wrapPointer(center_p, b2Vec2);
            const axisV = wrapPointer(axis_p, b2Vec2);
            this.context.beginPath();
            this.context.arc(centerV.get_x(), centerV.get_y(), radius, 0, 2 * Math.PI, false);
            if (fill) {
                this.context.fill();
            }
            this.context.stroke();
            if (fill) {
                //render axis marker
                const vert2V = copyVec2(centerV);
                vert2V.op_add(scaledVec2(axisV, radius));
                this.context.beginPath();
                this.context.moveTo(centerV.get_x(), centerV.get_y());
                this.context.lineTo(vert2V.get_x(), vert2V.get_y());
                this.context.stroke();
            }
        };
        this.drawTransform = (transform_p) => {
            const { wrapPointer, b2Transform } = this.box2D;
            const trans = wrapPointer(transform_p, b2Transform);
            this.context.save();
            const pos = trans.get_p();
            const rot = trans.get_q();
            this.context.translateCanvas(pos.get_x(), pos.get_y());
            this.context.setScale(0.5, 0.5);
            this.context.rotateCanvas(rot.GetAngle());
            Box2dDebugDraw.drawAxes(this.context);
            this.context.restore();
        };
        this.constructJSDraw = () => {
            console.log(this.box2D, this.context);
            const { JSDraw, b2Vec2, getPointer } = this.box2D;
            const debugDraw = Object.assign(new JSDraw(), {
                DrawSegment: (vert1_p, vert2_p, color_p) => {
                    this.setColorFromDebugDrawCallback(color_p);
                    this.drawSegment(vert1_p, vert2_p);
                },
                DrawPolygon: (vertices, vertexCount, color_p) => {
                    this.setColorFromDebugDrawCallback(color_p);
                    this.drawPolygon(vertices, vertexCount, false);
                },
                DrawSolidPolygon: (vertices, vertexCount, color_p) => {
                    this.setColorFromDebugDrawCallback(color_p);
                    this.drawPolygon(vertices, vertexCount, true);
                },
                DrawCircle: (center_p, radius, color_p) => {
                    this.setColorFromDebugDrawCallback(color_p);
                    const dummyAxis = new b2Vec2(0, 0);
                    const dummyAxis_p = getPointer(dummyAxis);
                    this.drawCircle(center_p, radius, dummyAxis_p, false);
                },
                DrawSolidCircle: (center_p, radius, axis_p, color_p) => {
                    this.setColorFromDebugDrawCallback(color_p);
                    this.drawCircle(center_p, radius, axis_p, true);
                },
                DrawTransform: (transform_p) => {
                    this.drawTransform(transform_p);
                },
                DrawPoint: (vec_p, size, color_p) => {
                    this.drawPoint(vec_p, size, color_p);
                }
            });
            return debugDraw;
        };
    }
    static drawAxes(ctx) {
        ctx.lineStyle(1 / 30, 0xff0000, 0.5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1, 0);
        ctx.stroke();
        ctx.lineStyle(1 / 30, 0x00ff00, 0.5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 1);
        ctx.stroke();
    }
}
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = Box2dDebugDraw;
}
//# sourceMappingURL=box2dwasmDebugDraw.js.map