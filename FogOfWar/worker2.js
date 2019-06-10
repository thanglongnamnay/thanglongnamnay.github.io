'use strict';
importScripts('util.js', 'classes.js', 'pre.js');
const lineColor = '#ddd';
const scale = 2;
const dotColor = '#d11';
let canvas, ctx;
const handleMouseMove = [], handleMouseClick = [], handleKeyUp = [];

let polygonList = [];
const canvasRect = Polygon('#eee', [Vector(0, 0), Vector(1, 0), Vector(1, 1), Vector(0, 1)]);
const rayNumber = 60;

self.onmessage = e => {
    const i = e.data.index;
	if (!e.data.e) {
        if (e.data.offscreen) {
    		canvas = e.data.offscreen;
    		ctx = canvas.getContext('2d');
        }
        handleApply(e.data.polygonList);
        if (i < 7) {
            handleMouseClick[i] && handleMouseClick[i]({ x: canvas.width / 2, y: canvas.height / 2 });
            handleMouseMove[i] && handleMouseMove[i]({ x: canvas.width / 2, y: canvas.height / 2 });
        }
	} else{
        switch (e.data.type) {
            case 'move':
                handleMouseMove[i] && handleMouseMove[i](e.data.e);
                break;
            case 'click':
                handleMouseClick[i] && handleMouseClick[i](e.data.e);
                break;
            case 'keyup':
                handleKeyUp[i] && handleKeyUp[i](e.data.e);
                break;
            case 'apply':
                handleRequestApply();
                break;
            case 'reset':
                handleRequestReset();
                break;
            default: 
                // statements_def
                break;
        }
	}
}

handleMouseMove[0] = function(e) {
    redraw(canvas, ctx, polygonList);
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[1] = handleMouseClick[1] = function(e) {
    redraw(canvas, ctx, polygonList);
    const rays = getRays(rayNumber);
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
    Polygon('#eee', big).draw(canvas, ctx);
    big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
    big.forEach(p => drawPoint(canvas, ctx, 'red', p));
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[2] = handleMouseClick[2] = function(e) {
    redraw(canvas, ctx, polygonList);
    const rays = getRays(rayNumber);
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
    Polygon('#eee', big).draw(canvas, ctx);
    drawPoint(canvas, ctx, dotColor, point);
}


handleMouseMove[3] = false;
handleMouseClick[3] = function(e) {
    redraw(canvas, ctx, polygonList);
    const rays = getRays(6e3);
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
    Polygon('#eee', big).draw(canvas, ctx);
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[4] = function(e) {
    redraw(canvas, ctx, polygonList);
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, polygonList, false);
    // const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
    Polygon('#eee', big).draw(canvas, ctx);
    big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
    big.forEach(p => drawPoint(canvas, ctx, 'red', p));
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[5] = function(e) {
    redraw(canvas, ctx, polygonList);
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, polygonList);
    // const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
    Polygon('#eee', big).draw(canvas, ctx);
    big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
    big.forEach(p => drawPoint(canvas, ctx, 'red', p));
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[6] = function(e) {
    redraw(canvas, ctx, polygonList);
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    // const big = drawAllRayVertex(canvas, ctx, point, polygonList);
    const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
    Polygon('#eee', big).draw(canvas, ctx);
    big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
    big.forEach(p => drawPoint(canvas, ctx, 'red', p));
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[7] = function(e) {
    redraw(canvas, ctx, polygonList);
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
    Polygon('#eee', big).draw(canvas, ctx);
    drawPoint(canvas, ctx, dotColor, point);
}

const customPolygonList = [];
let drawing = false, 
    currentPolygon = Polygon(randomColor(), []), 
    nextPolygon = Polygon(randomColor(), [Vector(0, 0)]);

handleMouseClick[8] = function(e) {
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    currentPolygon.addPoints(point);
    nextPolygon.points[nextPolygon.points.length - 1] = point;
    nextPolygon.addPoints(point);
    redraw(canvas, ctx, [...customPolygonList, currentPolygon]);
    drawing = true;
}

handleMouseMove[8] = function(e) {
    const {x, y} = e;
    const point = Vector(x / canvas.width, y / canvas.height);
    redraw(canvas, ctx, customPolygonList);
    if (drawing) {
        nextPolygon.points[nextPolygon.points.length - 1] = point;
        redraw(canvas, ctx, [...customPolygonList, nextPolygon, currentPolygon]);
    } else {
        redraw(canvas, ctx, customPolygonList);
        const {x, y} = e;
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayVertex(canvas, ctx, point, [...customPolygonList, canvasRect]);
        Polygon('#eee', big).draw(canvas, ctx);
    }
    drawPoint(canvas, ctx, dotColor, point);
}

handleKeyUp[8] = function(e) {
    if (e.which !== 13) return;
    customPolygonList.push(currentPolygon);
    redraw(canvas, ctx, customPolygonList);
    currentPolygon = Polygon(randomColor(), []);
    nextPolygon = Polygon(randomColor(), [Vector(0, 0)]);
    drawing = false;
}

function handleRequestApply() {
    self.postMessage(customPolygonList.map(p => p.toObject()));
}

function handleRequestReset() {
    customPolygonList.length = 0;
    redraw(canvas, ctx, customPolygonList);
}

function handleApply(e) {
    polygonList = e.map(Polygon.fromObject);
    redraw(canvas, ctx, polygonList);
}