"use strict";
exports.__esModule = true;
exports.RetaGL = void 0;
var RADIAN_MODE = "rad";
var DEGREE_MODE = "deg";
var PIVOT_NORMAL = 0;
var PIVOT_CENTER = 1;
var PIVOT_RIGHT = 2;
var RetapisXYPos = /** @class */ (function () {
    function RetapisXYPos(x, y) {
        this.x = x;
        this.y = y;
    }
    RetapisXYPos.prototype.distance = function (point) {
        var dx = Math.abs(this.x - point.x);
        var dy = Math.abs(this.y - point.y);
        return Math.sqrt(dx * dx + dy * dy);
    };
    RetapisXYPos.prototype.add = function (point) {
        return new RetapisXYPos(this.x + point.x, this.y + point.y);
    };
    RetapisXYPos.prototype.diff = function (point) {
        return new RetapisXYPos(this.x - point.x, this.y - point.y);
    };
    RetapisXYPos.prototype.zero_x = function () {
        return new RetapisXYPos(0, this.y);
    };
    RetapisXYPos.prototype.zero_y = function () {
        return new RetapisXYPos(this.x, 0);
    };
    return RetapisXYPos;
}());
var RetapisAngle = /** @class */ (function () {
    function RetapisAngle(value, mode) {
        if (mode === void 0) { mode = RADIAN_MODE; }
        switch (mode) {
            case RADIAN_MODE:
                this.value = value;
                break;
            case DEGREE_MODE:
                this.value = Convert.toRadians(value);
                break;
            default:
                this.value = null;
                break;
        }
    }
    RetapisAngle.prototype.add = function (angle) {
        return new RetapisAngle(this.value + angle.value);
    };
    return RetapisAngle;
}());
var RetapisCanvasRenderingScene = /** @class */ (function () {
    function RetapisCanvasRenderingScene() {
        this.canvas = null;
        this.context = null;
        this.dofill = false;
        this.dostroke = false;
        this.pivotVisible = false;
        this.fillColour = "#000000";
        this.strokeColour = "#000000";
        this.backgroundColour = "#FFFFFF";
        this.debug = false;
        this["default"]();
    }
    RetapisCanvasRenderingScene.prototype.push = function () {
        this.translationStack.push([this.translation, this.rotation, this.rotationPivot, this.context.lineWidth]);
    };
    RetapisCanvasRenderingScene.prototype.pop = function () {
        var data = this.translationStack.pop();
        this.translation = data[0];
        this.rotation = data[1];
        this.rotationPivot = data[2];
        this.context.lineWidth = data[3];
    };
    RetapisCanvasRenderingScene.prototype.showPivot = function () {
        this.pivotVisible = true;
    };
    RetapisCanvasRenderingScene.prototype.hidePivot = function () {
        this.pivotVisible = false;
    };
    RetapisCanvasRenderingScene.prototype.connect = function (canvas) {
        this.canvas = canvas;
        this.updateContext();
    };
    RetapisCanvasRenderingScene.prototype.doStroke = function (stroke) {
        this.dostroke = stroke;
    };
    RetapisCanvasRenderingScene.prototype.doFill = function (fill) {
        this.dofill = fill;
    };
    RetapisCanvasRenderingScene.prototype.fill = function (colour) {
        this.fillColour = colour;
    };
    RetapisCanvasRenderingScene.prototype.stroke = function (colour) {
        this.strokeColour = colour;
    };
    RetapisCanvasRenderingScene.prototype.updateContext = function () {
        this.context = this.canvas.getContext("2d");
    };
    RetapisCanvasRenderingScene.prototype["default"] = function () {
        this.translation = new RetapisXYPos(0, 0);
        this.rotation = new RetapisAngle(0);
        this.rotationPivot = new RetapisXYPos(0, 0);
        this.translationStack = [];
    };
    RetapisCanvasRenderingScene.prototype.pivot = function (pivot) {
        if (pivot === void 0) { pivot = new RetapisXYPos(0, 0); }
        this.rotationPivot = pivot;
    };
    RetapisCanvasRenderingScene.prototype.translate = function (point) {
        if (point === void 0) { point = new RetapisXYPos(0, 0); }
        this.translation = point;
        this.pivot(point);
    };
    RetapisCanvasRenderingScene.prototype.rotate = function (angle) {
        this.rotation = this.rotation.add(angle);
    };
    RetapisCanvasRenderingScene.prototype.rect = function (pos, size) {
        var p1 = pos;
        var p2 = pos.add(size.zero_y());
        var p3 = pos.add(size);
        var p4 = pos.add(size.zero_x());
        var shape = new RetapisClosedShape(p1, p2, p3, p4);
        return shape;
    };
    RetapisCanvasRenderingScene.prototype.background = function (colour) {
        this.backgroundColour = colour;
    };
    RetapisCanvasRenderingScene.prototype.clear = function () {
        var ctx = this.context;
        ctx.fillStyle = this.backgroundColour;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.update();
    };
    RetapisCanvasRenderingScene.prototype.update = function () {
        if (this.pivotVisible) {
            this.context.beginPath();
            this.context.fillStyle = "#222222";
            this.context.arc(this.rotationPivot.x, this.rotationPivot.y, 5, 0, 2 * Math.PI);
            this.context.fill();
        }
    };
    RetapisCanvasRenderingScene.prototype.debugLines = function () {
        this.debug = true;
    };
    RetapisCanvasRenderingScene.prototype.showOffset = function (shape, offset) {
        var ctx = this.context;
        ctx.strokeStyle = this.strokeColour;
        for (var _i = 0, _a = shape.points; _i < _a.length; _i++) {
            var point = _a[_i];
            var p = point.add(this.translation);
            var pointAngle = Convert.toAngle(this.rotationPivot, p);
            var newAngle = pointAngle.add(this.rotation);
            var radius = this.rotationPivot.distance(p);
            var newPoint = Convert.toPosOnArc(this.rotationPivot, radius, newAngle.value, RADIAN_MODE);
            var offpoint = newPoint.add(offset);
            ctx.beginPath();
            ctx.moveTo(newPoint.x, newPoint.y);
            ctx.lineTo(offpoint.x, offpoint.y);
            ctx.stroke();
        }
    };
    RetapisCanvasRenderingScene.prototype.line = function (p1, p2) {
        var ctx = this.context;
        var tp1 = p1.add(this.translation);
        var tp2 = p2.add(this.translation);
        var r1 = this.rotationPivot.distance(tp1);
        var r2 = this.rotationPivot.distance(tp2);
        var a1 = Convert.toAngle(this.rotationPivot, tp1).add(this.rotation);
        var a2 = Convert.toAngle(this.rotationPivot, tp2).add(this.rotation);
        var np1 = Convert.toPosOnArc(this.rotationPivot, r1, a1);
        var np2 = Convert.toPosOnArc(this.rotationPivot, r2, a2);
        ctx.strokeStyle = this.strokeColour;
        ctx.beginPath();
        ctx.moveTo(np1.x, np1.y);
        ctx.lineTo(np2.x, np2.y);
        ctx.stroke();
    };
    RetapisCanvasRenderingScene.prototype.weight = function (weight) {
        this.context.lineWidth = weight;
    };
    return RetapisCanvasRenderingScene;
}());
var RetapisClosedShape = /** @class */ (function () {
    function RetapisClosedShape() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length == 1 && Array.isArray(args[0]))
            this.points = args[0];
        else
            this.points = args;
    }
    RetapisClosedShape.prototype.show = function (scene, offset, scale) {
        if (offset === void 0) { offset = new RetapisXYPos(0, 0); }
        if (scale === void 0) { scale = new RetapisXYPos(1, 1); }
        var ctx = scene.context;
        var drawPoints = [];
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            var p = point.add(scene.translation);
            var pointAngle = Convert.toAngle(scene.rotationPivot, p);
            var newAngle = pointAngle.add(scene.rotation);
            var radius = scene.rotationPivot.distance(p);
            var newPoint = Convert.toPosOnArc(scene.rotationPivot, radius, newAngle).add(offset);
            drawPoints.push(newPoint);
        }
        var firstPoint = drawPoints.shift();
        drawPoints.push(firstPoint);
        this.draw(scene, firstPoint, drawPoints, scale);
        if (scene.debug) {
            ctx.strokeStyle = "#222222";
            for (var _b = 0, drawPoints_1 = drawPoints; _b < drawPoints_1.length; _b++) {
                var p = drawPoints_1[_b];
                ctx.beginPath();
                ctx.moveTo(scene.rotationPivot.x, scene.rotationPivot.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        }
    };
    RetapisClosedShape.prototype.draw = function (scene, firstPoint, drawPoints, scale) {
        var ctx = scene.context;
        ctx.fillStyle = scene.fillColour;
        ctx.strokeStyle = scene.strokeColour;
        ctx.beginPath();
        ctx.moveTo(firstPoint.x * scale.x, firstPoint.y * scale.y);
        for (var _i = 0, drawPoints_2 = drawPoints; _i < drawPoints_2.length; _i++) {
            var point = drawPoints_2[_i];
            ctx.lineTo(point.x * scale.x, point.y * scale.y);
        }
        if (scene.dostroke)
            ctx.stroke();
        if (scene.dofill)
            ctx.fill();
    };
    return RetapisClosedShape;
}());
var LineWithAngle = /** @class */ (function () {
    function LineWithAngle(length, angle) {
        this.length = length;
        this.angle = angle;
    }
    return LineWithAngle;
}());
var RetapisObjectModel = /** @class */ (function () {
    function RetapisObjectModel() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.shapes = args;
        if (args.length == 1 && Array.isArray(args[0]))
            this.shapes = args[0];
    }
    RetapisObjectModel.prototype.show = function (scene, pos, scale, useScenePivot, rotationMode, offset) {
        if (scale === void 0) { scale = new RetapisXYPos(1, 1); }
        if (useScenePivot === void 0) { useScenePivot = false; }
        if (rotationMode === void 0) { rotationMode = PIVOT_NORMAL; }
        if (offset === void 0) { offset = new RetapisXYPos(0, 0); }
        var localTranslate = pos;
        if (typeof (this.fixoff) === "number")
            localTranslate = pos.add(new RetapisXYPos(this.fixoff, this.fixoff));
        localTranslate = localTranslate.add(scene.translation);
        var pivot = scene.rotationPivot;
        var calcPivot = Convert.toPosOnArc(pivot, pivot.distance(localTranslate), scene.rotation);
        scene.push();
        scene.translate(localTranslate);
        if (useScenePivot) {
            localTranslate = new RetapisXYPos(calcPivot.x - rotationMode * 1.25 * this.width / 2 + this.fixoff, calcPivot.y + this.fixoff);
            scene.translate(localTranslate);
            scene.pivot(calcPivot);
        }
        var backupStroke = scene.strokeColour;
        var backupFill = scene.fillColour;
        for (var _i = 0, _a = this.shapes; _i < _a.length; _i++) {
            var sh = _a[_i];
            if (typeof (sh.strokeColour) === "string")
                scene.stroke(sh.strokeColour);
            if (typeof (sh.fillColour) === "string")
                scene.fill(sh.fillColour);
            sh.show(scene, offset, scale);
        }
        scene.strokeColour = backupStroke;
        scene.fillColour = backupFill;
        scene.pop();
    };
    return RetapisObjectModel;
}());
var Convert = {};
Convert.toRadians = function (degrees) {
    return Math.PI * (degrees / 180);
};
Convert.toDegrees = function (radians) {
    return 180 * (radians / Math.PI);
};
Convert.rangeMap = function (value, min0, max0, min1, max1) {
    return (value - min0) / (max0 - min0) * (max1 - min1) + min1;
};
Convert.toPosOnArc = function (arcPos, radius, angle) {
    if (arcPos === void 0) { arcPos = new RetapisXYPos(0, 0); }
    if (radius === void 0) { radius = 0; }
    if (angle === void 0) { angle = new RetapisAngle(0); }
    var a = angle.value;
    var x = arcPos.x + radius * Math.cos(a);
    var y = arcPos.y + radius * Math.sin(a);
    return new RetapisXYPos(x, y);
};
Convert.toAngle = function (pivot, point) {
    if (pivot === void 0) { pivot = new RetapisXYPos(0, 0); }
    if (point === void 0) { point = new RetapisXYPos(0, 0); }
    if (pivot.distance(point) === 0)
        return new RetapisAngle(0);
    var v = Math.acos((point.x - pivot.x) / pivot.distance(point));
    if (point.y < pivot.y)
        v = 2 * Math.PI - v;
    return new RetapisAngle(v, RADIAN_MODE);
};
Convert.createClosedShape = function (pos, angle, lines) {
    var previousPos = pos;
    var totalAngle = angle.value;
    var points = [];
    for (var i in lines) {
        var line = lines[i];
        var length_1 = line.length;
        var angle_1 = line.angle.value;
        previousPos = Convert.toPosOnArc(previousPos, length_1, totalAngle);
        totalAngle += angle_1;
        points.push(previousPos);
    }
    return new RetapisClosedShape(points);
};
Convert.createRegularShape = function (centerPos, radius, vertices) {
    var angle = (2 * Math.PI) / vertices;
    var points = [];
    for (var i = 0; i < vertices; i++) {
        points.push(Convert.toPosOnArc(centerPos, radius, new RetapisAngle(angle * i)));
    }
    return new RetapisClosedShape(points);
};
Convert.colour = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length == 1)
        return "rgba(" + args[0] + ", " + args[0] + ", " + args[0] + ", 255)";
    else if (args.length == 3)
        return "rgba(" + args[0] + ", " + args[1] + ", " + args[2] + ", 255)";
};
Convert.modelFromFile = function (filename_without_extension) {
    var f = filename_without_extension;
    var models = [];
    for (var _i = 0, f_1 = f; _i < f_1.length; _i++) {
        var model = f_1[_i];
        if (typeof (model) === "object") {
            var p = model.points;
            var a = model.areas;
            var shapes = [];
            for (var _a = 0, a_1 = a; _a < a_1.length; _a++) {
                var area = a_1[_a];
                var shape = new RetapisClosedShape;
                switch (area[0]) {
                    case 'rect':
                        var p1 = p[area[1]];
                        var p3 = p[area[2]];
                        var w = p3[0] - p1[0];
                        var p2 = [p1[0] + w, p1[1]];
                        var p4 = [p1[0], p3[1]];
                        var c1 = new RetapisXYPos(p1[0], p1[1]);
                        var c2 = new RetapisXYPos(p2[0], p2[1]);
                        var c3 = new RetapisXYPos(p3[0], p3[1]);
                        var c4 = new RetapisXYPos(p4[0], p4[1]);
                        shape = new RetapisClosedShape(c1, c2, c3, c4);
                        break;
                    case 'circ':
                        var c = new RetapisXYPos(p[area[1]][0], p[area[1]][1]);
                        shape = Convert.createRegularShape(c, area[2], 3.6 * area[2]);
                        break;
                }
                if (typeof (model.textures) !== "undefined") {
                    shape.strokeColour = model.textures[area[3]];
                    shape.fillColour = model.textures[area[4]];
                }
                shapes.push(shape);
            }
            var createdModel = new RetapisObjectModel(shapes);
            if (typeof (model.fixOffset) === "number")
                createdModel.fixoff = model.fixOffset;
            if (typeof (model.width) === "number")
                createdModel.width = model.width;
            if (typeof (model.height) === "number")
                createdModel.height = model.height;
            models.push(createdModel);
        }
    }
    if (models.length == 1)
        models = models[0];
    return models;
};
exports.RetaGL = {
    RADIAN_MODE: RADIAN_MODE,
    DEGREE_MODE: DEGREE_MODE,
    PIVOT_NORMAL: PIVOT_NORMAL,
    PIVOT_CENTER: PIVOT_CENTER,
    PIVOT_RIGHT: PIVOT_RIGHT,
    RetapisXYPos: RetapisXYPos,
    RetapisAngle: RetapisAngle,
    RetapisCanvasRenderingScene: RetapisCanvasRenderingScene,
    RetapisClosedShape: RetapisClosedShape,
    LineWithAngle: LineWithAngle,
    RetapisObjectModel: RetapisObjectModel,
    Convert: Convert
};
