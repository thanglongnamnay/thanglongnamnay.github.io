'use strict';
import Util from './util-module.js';
import Vector from './Vector.js';
import Polygon from './Polygon.js';
import {
    drawPoint,
    drawRay,
    getRays,
    drawAllRayIntersection,
    polygonListToPointList,
    drawAllRayVertex,
    redraw
} from './pre-module.js';
const util = Util(2);
const $ = id => document.getElementById(id);
const canvasList = document.getElementsByClassName('figure-canvas');

const handleResize = util.debounce(() => {
    console.log('some');
    util.scale = 1600 / canvasList[0].offsetWidth;
}, 100);
window.onresize = handleResize;
handleResize();

let wph = canvasList[0].width / canvasList[0].height;
let polygonList = [];
const rect = Polygon(util.randomColor(), [Vector(0, 0), Vector(0, .2), Vector(.2, .2), Vector(.2, 0)]);
polygonList.push(rect.move(Vector(.1 * wph, .1)), rect.move(Vector(.6 * wph, .4)), rect.move(Vector(.2 * wph, .5)))

const canvasRect = Polygon('#333', [Vector(-.5, -.5), Vector(wph + .5, -.5), Vector(wph + .5, 1.5), Vector(-.5, 1.5)]);
// const canvasRect = Polygon('#333', [Vector(0, 0), Vector(wph, 0), Vector(wph, 1), Vector(0, 1)]);
let polygonListViewport = [canvasRect, ...polygonList];
let pointList = polygonListToPointList(polygonList);
let pointListViewport = polygonListToPointList(polygonListViewport);

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
    const point = Vector(x / canvas.height, y / canvas.height);
    drawPoint(canvas, ctx, dotColor, point);
}

const rays = [getRays(60), getRays(6e3)]

handleMouseMove[1] = function(e) {
    const canvas = canvasList[1];
    const ctx = ctxList[1];
    redraw(canvas, ctx, polygonList);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.height, y / canvas.height);
    const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays[0]);
    Polygon('#eee', big).draw(canvas, ctx);
    big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
    big.forEach(p => drawPoint(canvas, ctx, 'red', p));
    drawPoint(canvas, ctx, dotColor, point);
}

handleMouseMove[2] = function(e) {
    const canvas = canvasList[2];
    const ctx = ctxList[2];
    redraw(canvas, ctx, polygonList);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.height, y / canvas.height);
    const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays[0]);
    Polygon('#eee', big).draw(canvas, ctx);
    drawPoint(canvas, ctx, dotColor, point);
}


handleMouseMove[3] = false;
handleMouseClick[3] = function(e) {
    const canvas = canvasList[3];
    const ctx = ctxList[3];
    redraw(canvas, ctx, polygonList);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.height, y / canvas.height);
    const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays[1]);
    Polygon('#eee', big).draw(canvas, ctx);
    drawPoint(canvas, ctx, dotColor, point);
}

$('switch-mode-6k').onclick = e => {
    e.preventDefault();
    console.log(e);
    if (!canvasList[3].onmousemove) canvasList[3].onmousemove = handleMouseClick[3];
    else canvasList[3].onmousemove = null;
}

handleMouseMove[4] = function(e) {
    const canvas = canvasList[4];
    const ctx = ctxList[4];
    redraw(canvas, ctx, polygonList);
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.height, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, pointList, polygonList, false);
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
    const point = Vector(x / canvas.height, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, pointList, polygonList);
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
    const point = Vector(x / canvas.height, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, pointListViewport, polygonList);
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
    const point = Vector(x / canvas.height, y / canvas.height);
    const big = drawAllRayVertex(canvas, ctx, point, pointListViewport, polygonList);
    Polygon('#eee', big).draw(canvas, ctx);
    drawPoint(canvas, ctx, dotColor, point);
}

const customPolygonList = [canvasRect];
let drawing = false, 
    currentPolygon = Polygon(util.randomColor(), []), 
    nextPolygon = Polygon(util.randomColor(), [Vector(0, 0)]);

handleMouseClick[8] = function(e) {
    const canvas = canvasList[8];
    const ctx = ctxList[8];
    const {x, y} = util.getXY(e);
    const point = Vector(x / canvas.height, y / canvas.height);
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
    const point = Vector(x / canvas.height, y / canvas.height);
    redraw(canvas, ctx, customPolygonList);
    if (drawing) {
        nextPolygon.points[nextPolygon.points.length - 1] = point;
        redraw(canvas, ctx, [...customPolygonList, nextPolygon, currentPolygon]);
    } else {
        const point = Vector(x / canvas.height, y / canvas.height);
        const pointList = polygonListToPointList(customPolygonList);
        const big = drawAllRayVertex(canvas, ctx, point, pointList, customPolygonList);
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
function requestApply(i) {
    return function(e) {
        handleApply(customPolygonList.slice(1));
        customPolygonList.length = 1;
    }
}
function requestReset(i) {
    return function(e) {
        redraw(canvasList[i], ctxList[i], polygonList);
        customPolygonList.length = 1;
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
    handleApply(polygonList);
}

function handleApply(pList) {
    polygonList = [...pList];
    polygonListViewport = [canvasRect, ...polygonList];
    pointList = polygonListToPointList(polygonList);
    pointListViewport = polygonListToPointList(polygonListViewport);
    for (let i = 0; i < canvasList.length; ++i) {
        redraw(canvasList[i], ctxList[i], polygonList);
    }
}