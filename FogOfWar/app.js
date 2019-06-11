'use strict';
import Util from './util-module.js';
import Vector from './Vector.js';
import Polygon from './Polygon.js';
import {
    drawPoint,
    drawPolygon,
    drawTriangles,
    getBorderIntersect,
    calY,
    calX,
    drawRay,
    getPointsOnRay,
    checkLineIntersection,
    drawRayIntersection,
    getRays,
    drawAllRayIntersection,
    polygonPairToPointList,
    selfIntersection,
    polygonListToPointList,
    drawAllRayVertex,
    redraw
} from './pre-module.js';
const scale = 2;
const util = Util(scale);
const $ = id => document.getElementById(id);
const canvasList = document.getElementsByClassName('figure-canvas');
let polygonList = [];
const rect = Polygon(util.randomColor(), [Vector(0, 0), Vector(0, .2), Vector(.2, .2), Vector(.2, 0)]);
polygonList.push(rect.move(Vector(.1, .1)), rect.move(Vector(.6, .4)), rect.move(Vector(.2, .5)))

const canvasRect = Polygon('#eee', [Vector(0, 0), Vector(1, 0), Vector(1, 1), Vector(0, 1)]);
const ctxList = [];
const dotColor = '#d11', lineColor = '#ddd';
for (let i = 0; i < canvasList.length; ++i) {
    ctxList.push(canvasList[i].getContext('2d'));
}
let handleMouseMove = [], handleMouseClick = [], handleKeyUp = [];
handleMouseMove[0] = function(e) {
    const canvas = canvasList[0];
    const ctx = ctxList[0];
    redraw(canvas, ctx, polygonList);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[1] = function(e) {
    const canvas = canvasList[1];
    const ctx = ctxList[1];
    redraw(canvas, ctx, polygonList);
    const rays = getRays(60);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
    Polygon('#eee', big).draw(canvas, ctx);
    big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
    big.forEach(p => drawPoint(canvas, ctx, 'red', p));
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[2] = function(e) {
    const canvas = canvasList[2];
    const ctx = ctxList[2];
    redraw(canvas, ctx, polygonList);
    const rays = getRays(60);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
    Polygon('#eee', big).draw(canvas, ctx);
    drawPoint(canvas, ctx, dotColor, point);
}


handleMouseMove[3] = false;
handleMouseClick[3] = function(e) {
    const canvas = canvasList[3];
    const ctx = ctxList[3];
    redraw(canvas, ctx, polygonList);
    const rays = getRays(6e3);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
    Polygon('#eee', big).draw(canvas, ctx);
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[4] = function(e) {
    const canvas = canvasList[4];
    const ctx = ctxList[4];
    redraw(canvas, ctx, polygonList);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, polygonList, false);
    // const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
    Polygon('#eee', big).draw(canvas, ctx);
    big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
    big.forEach(p => drawPoint(canvas, ctx, 'red', p));
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[5] = function(e) {
    const canvas = canvasList[5];
    const ctx = ctxList[5];
    redraw(canvas, ctx, polygonList);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, polygonList);
    // const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
    Polygon('#eee', big).draw(canvas, ctx);
    big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
    big.forEach(p => drawPoint(canvas, ctx, 'red', p));
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[6] = function(e) {
    const canvas = canvasList[6];
    const ctx = ctxList[6];
    redraw(canvas, ctx, polygonList);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    // const big = drawAllRayVertex(canvas, ctx, point, polygonList);
    const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
    Polygon('#eee', big).draw(canvas, ctx);
    big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
    big.forEach(p => drawPoint(canvas, ctx, 'red', p));
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[7] = function(e) {
    const canvas = canvasList[7];
    const ctx = ctxList[7];
    redraw(canvas, ctx, polygonList);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
    Polygon('#eee', big).draw(canvas, ctx);
    drawPoint(canvas, ctx, dotColor, point);
}

const customPolygonList = [];
let drawing = false, 
    currentPolygon = Polygon(util.randomColor(), []), 
    nextPolygon = Polygon(util.randomColor(), [Vector(0, 0)]);

handleMouseClick[8] = function(e) {
    const canvas = canvasList[8];
    const ctx = ctxList[8];
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    currentPolygon.addPoints(point);
    nextPolygon.points[nextPolygon.points.length - 1] = point;
    nextPolygon.addPoints(point);
    redraw(canvas, ctx, [...customPolygonList, currentPolygon]);
    drawing = true;
}

handleMouseMove[8] = function(e) {
    const canvas = canvasList[8];
    const ctx = ctxList[8];
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.width, y / canvas.height);
    redraw(canvas, ctx, customPolygonList);
    if (drawing) {
        nextPolygon.points[nextPolygon.points.length - 1] = point;
        redraw(canvas, ctx, [...customPolygonList, nextPolygon, currentPolygon]);
    } else {
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayVertex(canvas, ctx, point, [...customPolygonList, canvasRect]);
        Polygon('#eee', big).draw(canvas, ctx);
    }
    drawPoint(canvas, ctx, dotColor, point);
}

handleKeyUp[8] = function(e) {
    const canvas = canvasList[8];
    const ctx = ctxList[8];
    if (e.which !== 13) return;
    customPolygonList.push(currentPolygon);
    redraw(canvas, ctx, customPolygonList);
    currentPolygon = Polygon(util.randomColor(), []);
    nextPolygon = Polygon(util.randomColor(), [Vector(0, 0)]);
    drawing = false;
}
for (let i = 0; i < canvasList.length; ++i) {
    canvasList[i].onmousemove = handleMouseMove[i];
    canvasList[i].onclick = handleMouseClick[i];
}
function requestApply(i) {
    return function(e) {
        polygonList = [...customPolygonList];
        for (let i = 0; i < canvasList.length; ++i) {
            redraw(canvasList[i], ctxList[i], polygonList);
        }
        customPolygonList.length = 0;
    }
}
function requestReset(i) {
    return function(e) {
        customPolygonList.length = 0;
        redraw(canvasList[i], ctxList[i], polygonList);
    }
}
function randomPolygons() {
    polygonList.length = 0;
    const n = Math.random() * 5 + 1 >> 0;
    for (let i = 0; i < n; ++i) {
        const points = [];
        const size = Math.random() * 3 + 2 >> 0;
        for (let j = 0; j < size; ++j) {
            points.push(Vector(Math.random(), Math.random()));
        }
        polygonList.push(Polygon(util.randomColor(), points));
    }
}

const lastCanvasIndex = canvasList.length - 1;
document.body.onkeyup = handleKeyUp[lastCanvasIndex];
$('apply-button').onclick = requestApply(lastCanvasIndex);
$('reset-button').onclick = requestReset(lastCanvasIndex);
$('random-button').onclick = e => {
    randomPolygons();
    for (let i = 0; i < canvasList.length; ++i) {
        redraw(canvasList[i], ctxList[i], polygonList);
    }
}
