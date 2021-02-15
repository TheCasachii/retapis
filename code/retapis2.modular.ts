const RADIAN_MODE:  string = "rad";
const DEGREE_MODE:  string = "deg";
const PIVOT_NORMAL: number = 0    ;
const PIVOT_CENTER: number = 1    ;
const PIVOT_RIGHT : number = 2    ;

class RetapisXYPos {

    x: number;
    y: number;
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    distance(point: RetapisXYPos): number {
        const dx: number = Math.abs(this.x - point.x);
        const dy: number = Math.abs(this.y - point.y);
        return Math.sqrt(dx * dx + dy * dy);
    }

    add(point: RetapisXYPos): RetapisXYPos {
        return new RetapisXYPos(this.x + point.x, this.y + point.y);
    }

    diff(point: RetapisXYPos): RetapisXYPos {
        return new RetapisXYPos(this.x - point.x, this.y - point.y);
    }

    zero_x(): RetapisXYPos {
        return new RetapisXYPos(0, this.y);
    }

    zero_y(): RetapisXYPos {
        return new RetapisXYPos(this.x, 0);
    }
}

class RetapisAngle {

    value: number | null;
    
    constructor(value: number, mode: string = RADIAN_MODE) {
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

    add(angle: RetapisAngle): RetapisAngle {
        return new RetapisAngle(this.value + angle.value);
    }

}

class RetapisCanvasRenderingScene {

    canvas: HTMLCanvasElement | null;
    context: CanvasRenderingContext2D | null;
    dofill: boolean;
    dostroke: boolean;
    pivotVisible: boolean;
    fillColour: string;
    strokeColour: string;
    backgroundColour: string;
    debug: boolean;
    translationStack: any[][];
    translation: RetapisXYPos;
    rotation: RetapisAngle;
    rotationPivot: RetapisXYPos;

    constructor() {
        this.canvas = null;
        this.context = null;
        this.dofill = false;
        this.dostroke = false;
        this.pivotVisible = false;
        this.fillColour = "#000000";
        this.strokeColour = "#000000";
        this.backgroundColour = "#FFFFFF";
        this.debug = false;
        this.default();
    }

    push(): void {
        this.translationStack.push([this.translation, this.rotation, this.rotationPivot, this.context.lineWidth]);
    }

    pop(): void {
        let data: any[] = this.translationStack.pop();
        this.translation = data[0];
        this.rotation = data[1];
        this.rotationPivot = data[2];
        this.context.lineWidth = data[3];
    }

    showPivot(): void {
        this.pivotVisible = true;
    }

    hidePivot(): void {
        this.pivotVisible = false;
    }

    connect(canvas: any): void {
        this.canvas = canvas;
        this.updateContext();
    }

    doStroke(stroke: boolean): void {
        this.dostroke = stroke;
    }

    doFill(fill: boolean): void {
        this.dofill = fill;
    }

    fill(colour: string): void {
        this.fillColour = colour;
    }

    stroke(colour: string): void {
        this.strokeColour = colour;
    }

    updateContext(): void {
        this.context = this.canvas.getContext("2d");
    }

    default(): void {
        this.translation = new RetapisXYPos(0, 0);
        this.rotation = new RetapisAngle(0);
        this.rotationPivot = new RetapisXYPos(0, 0);
        this.translationStack = [];
    }

    pivot(pivot: RetapisXYPos = new RetapisXYPos(0, 0)): void {
        this.rotationPivot = pivot;
    }

    translate(point: RetapisXYPos = new RetapisXYPos(0, 0)): void {
        this.translation = point;
        this.pivot(point);
    }

    rotate(angle: RetapisAngle) {
        this.rotation = this.rotation.add(angle);
    }

    rect(pos: RetapisXYPos, size: RetapisXYPos) {

        let p1: RetapisXYPos = pos;
        let p2: RetapisXYPos = pos.add(size.zero_y());
        let p3: RetapisXYPos = pos.add(size);
        let p4: RetapisXYPos = pos.add(size.zero_x());

        let shape = new RetapisClosedShape(p1, p2, p3, p4);
        return shape;
    }

    background(colour: string): void {
        this.backgroundColour = colour;
    }

    clear(): void {
        let ctx: CanvasRenderingContext2D = this.context;
        ctx.fillStyle = this.backgroundColour;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.update();
    }

    update(): void {
        if (this.pivotVisible) {
            this.context.beginPath();
            this.context.fillStyle = "#222222";
            this.context.arc(this.rotationPivot.x, this.rotationPivot.y, 5, 0, 2 * Math.PI);
            this.context.fill();
        }
    }

    debugLines(): void {
        this.debug = true;
    }

    showOffset(shape: RetapisClosedShape, offset: RetapisXYPos) {
        let ctx: CanvasRenderingContext2D = this.context;
        ctx.strokeStyle = this.strokeColour;
        for (let point of shape.points) {
            let p: RetapisXYPos = point.add(this.translation);
            let pointAngle: RetapisAngle = Convert.toAngle(this.rotationPivot, p);
            let newAngle: RetapisAngle = pointAngle.add(this.rotation);
            let radius: number = this.rotationPivot.distance(p);
            let newPoint: RetapisXYPos = Convert.toPosOnArc(this.rotationPivot, radius, newAngle.value, RADIAN_MODE);
            let offpoint: RetapisXYPos = newPoint.add(offset);
            ctx.beginPath();
            ctx.moveTo(newPoint.x, newPoint.y);
            ctx.lineTo(offpoint.x, offpoint.y);
            ctx.stroke();
        }
    }

    line(p1: RetapisXYPos, p2: RetapisXYPos): void {
        let ctx: CanvasRenderingContext2D = this.context;

        let tp1: RetapisXYPos = p1.add(this.translation);
        let tp2: RetapisXYPos = p2.add(this.translation);
        let r1: number = this.rotationPivot.distance(tp1);
        let r2: number = this.rotationPivot.distance(tp2);
        let a1: RetapisAngle = Convert.toAngle(this.rotationPivot, tp1).add(this.rotation);
        let a2: RetapisAngle = Convert.toAngle(this.rotationPivot, tp2).add(this.rotation);
        let np1: RetapisXYPos = Convert.toPosOnArc(this.rotationPivot, r1, a1);
        let np2: RetapisXYPos = Convert.toPosOnArc(this.rotationPivot, r2, a2);

        ctx.strokeStyle = this.strokeColour;
        ctx.beginPath();
        ctx.moveTo(np1.x, np1.y);
        ctx.lineTo(np2.x, np2.y);
        ctx.stroke();
    }

    weight(weight: number): void {
        this.context.lineWidth = weight;
    }
}

class RetapisClosedShape {
    
    points: any[];
    strokeColour: string | null;
    fillColour: string | null;
    
    constructor(...args: RetapisXYPos[] | RetapisXYPos[][]) {
        if (args.length == 1 && Array.isArray(args[0]))
            this.points = args[0];
        else
            this.points = args;
    }

    show(scene: RetapisCanvasRenderingScene, offset: RetapisXYPos = new RetapisXYPos(0, 0), scale: RetapisXYPos = new RetapisXYPos(1, 1)) {
        let ctx: CanvasRenderingContext2D = scene.context;
        let drawPoints: RetapisXYPos[] = [];

        for (let point of this.points) {
            let p: RetapisXYPos = point.add(scene.translation);
            let pointAngle: RetapisAngle = Convert.toAngle(scene.rotationPivot, p);
            let newAngle: RetapisAngle = pointAngle.add(scene.rotation);
            let radius: number = scene.rotationPivot.distance(p);
            let newPoint: RetapisXYPos = Convert.toPosOnArc(scene.rotationPivot, radius, newAngle).add(offset);
            drawPoints.push(newPoint);
        }

        let firstPoint: RetapisXYPos = drawPoints.shift();
        drawPoints.push(firstPoint);
        this.draw(scene, firstPoint, drawPoints, scale);
        
        if (scene.debug) {
            ctx.strokeStyle = "#222222";
            
            for(let p of drawPoints) {
                ctx.beginPath();
                ctx.moveTo(scene.rotationPivot.x, scene.rotationPivot.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }

        }

    }

    draw(scene: RetapisCanvasRenderingScene, firstPoint: RetapisXYPos, drawPoints: RetapisXYPos[], scale: RetapisXYPos): void {
        let ctx = scene.context;

        ctx.fillStyle = scene.fillColour;
        ctx.strokeStyle = scene.strokeColour;

        ctx.beginPath();

        ctx.moveTo(firstPoint.x * scale.x, firstPoint.y * scale.y);
        
        for (let point of drawPoints) {
            ctx.lineTo(point.x * scale.x, point.y * scale.y);
        }

        if (scene.dostroke) ctx.stroke();
        if (scene.dofill) ctx.fill();
    }
}

class LineWithAngle {

    length: number;
    angle: RetapisAngle;

    constructor(length: number, angle: RetapisAngle) {
        this.length = length;
        this.angle = angle;
    }
}

class RetapisObjectModel {
    
    shapes: any[];
    fixoff: number | null;
    width: number | null;
    height: number | null;
    
    constructor(...args: any[]) {
        this.shapes = args;
        if (args.length == 1 && Array.isArray(args[0]))
            this.shapes = args[0];
    }

    show(scene: RetapisCanvasRenderingScene, pos: RetapisXYPos, scale: RetapisXYPos = new RetapisXYPos(1, 1), useScenePivot: boolean = false, rotationMode: number = PIVOT_NORMAL, offset: RetapisXYPos = new RetapisXYPos(0, 0)): void {
        let localTranslate: RetapisXYPos = pos;
        if (typeof (this.fixoff) === "number")
            localTranslate = pos.add(new RetapisXYPos(this.fixoff, this.fixoff));
        
        localTranslate = localTranslate.add(scene.translation);

        let pivot: RetapisXYPos = scene.rotationPivot;

        let calcPivot: RetapisXYPos = Convert.toPosOnArc(pivot, pivot.distance(localTranslate), scene.rotation);

        scene.push();

        scene.translate(localTranslate);

        if (useScenePivot) {
            localTranslate = new RetapisXYPos(calcPivot.x - rotationMode * 1.25 * this.width / 2 + this.fixoff, calcPivot.y + this.fixoff);
            scene.translate(localTranslate);
            scene.pivot(calcPivot);
        }

        let backupStroke: string = scene.strokeColour;
        let backupFill: string = scene.fillColour;

        for (let sh of this.shapes) {
            if (typeof (sh.strokeColour) === "string") scene.stroke(sh.strokeColour);
            if (typeof (sh.fillColour) === "string") scene.fill(sh.fillColour);
            sh.show(scene, offset, scale);
        }

        scene.strokeColour = backupStroke;
        scene.fillColour = backupFill;

        scene.pop();
    }
}

var Convert: any = {};

Convert.toRadians = function(degrees: number): number {
    return Math.PI * (degrees / 180);
}

Convert.toDegrees = function(radians: number): number {
    return 180 * (radians / Math.PI);
}

Convert.rangeMap = function(value: number, min0: number, max0: number, min1: number, max1: number): number {
    return (value - min0) / (max0 - min0) * (max1 - min1) + min1;
}

Convert.toPosOnArc = function(arcPos: RetapisXYPos = new RetapisXYPos(0, 0), radius: number = 0, angle: RetapisAngle = new RetapisAngle(0)): RetapisXYPos {
    let a: number = angle.value;
    let x: number = arcPos.x + radius * Math.cos(a);
    let y: number = arcPos.y + radius * Math.sin(a);
    return new RetapisXYPos(x, y);
}

Convert.toAngle = function(pivot: RetapisXYPos = new RetapisXYPos(0, 0), point: RetapisXYPos = new RetapisXYPos(0, 0)): RetapisAngle {
    if (pivot.distance(point) === 0) return new RetapisAngle(0);
    let v: number = Math.acos((point.x - pivot.x) / pivot.distance(point));
    if (point.y < pivot.y) v = 2 * Math.PI - v;
    return new RetapisAngle(v, RADIAN_MODE);
}

Convert.createClosedShape = function (pos: RetapisXYPos, angle: RetapisAngle, lines: LineWithAngle[]): RetapisClosedShape {
    let previousPos = pos;
    let totalAngle = angle.value;
    let points = [];
    for (let i in lines) {
        let line = lines[i];
        let length = line.length;
        let angle = line.angle.value;

        previousPos = Convert.toPosOnArc(previousPos, length, totalAngle);

        totalAngle += angle;
        points.push(previousPos);
    }
    return new RetapisClosedShape(points);
}

Convert.createRegularShape = function(centerPos: RetapisXYPos, radius: number, vertices: number): RetapisClosedShape {
    let angle = (2 * Math.PI) / vertices;
    let points = [];
    for (let i = 0; i < vertices; i++) {
        points.push(Convert.toPosOnArc(centerPos, radius, new RetapisAngle(angle * i)));
    }
    return new RetapisClosedShape(points);
}

Convert.colour = function (...args: number[]): string {
    if (args.length == 1)
        return `rgba(${args[0]}, ${args[0]}, ${args[0]}, 255)`;
    else if (args.length == 3)
        return `rgba(${args[0]}, ${args[1]}, ${args[2]}, 255)`;
}

Convert.modelFromFile = function (filename_without_extension: RetapisFileModel[]): RetapisObjectModel | RetapisObjectModel[] {
    let f = filename_without_extension;
    let models = [];
    for (let model of f) {
        if (typeof (model) === "object") {
            let p: number[][] = model.points;
            let a: any[][] = model.areas;
            let shapes: RetapisClosedShape[] = [];
            for (let area of a) {
                let shape: RetapisClosedShape = new RetapisClosedShape;
                switch (area[0]) {
                    case 'rect':
                        let p1: number[] = p[area[1]];
                        let p3: number[] = p[area[2]];
                        let w: number = p3[0] - p1[0];
                        let p2: number[] = [p1[0] + w, p1[1]];
                        let p4: number[] = [p1[0], p3[1]];
                        let c1: RetapisXYPos = new RetapisXYPos(p1[0], p1[1]);
                        let c2: RetapisXYPos = new RetapisXYPos(p2[0], p2[1]);
                        let c3: RetapisXYPos = new RetapisXYPos(p3[0], p3[1]);
                        let c4: RetapisXYPos = new RetapisXYPos(p4[0], p4[1]);
                        shape = new RetapisClosedShape(c1, c2, c3, c4);
                        break;
                    case 'circ':
                        let c: RetapisXYPos = new RetapisXYPos(p[area[1]][0], p[area[1]][1]);
                        shape = Convert.createRegularShape(c, area[2], 3.6 * area[2]);
                        break;
                }
                if (typeof (model.textures) !== "undefined") {
                    shape.strokeColour = model.textures[area[3]];
                    shape.fillColour = model.textures[area[4]];
                }
                shapes.push(shape);
            }
            let createdModel = new RetapisObjectModel(shapes);
            if (typeof (model.fixOffset) === "number") createdModel.fixoff = model.fixOffset;
            if (typeof (model.width) === "number") createdModel.width = model.width;
            if (typeof (model.height) === "number") createdModel.height = model.height;
            models.push(createdModel);
        }
    }
    if (models.length == 1)
        models = models[0];
    return models;
}

interface RetapisFileModel {
    points: number[][];
    areas: any[][];
    textures: string[];
    fixOffset: number;
    width: number;
    height: number;
}

export const RetaGL = {

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

}
