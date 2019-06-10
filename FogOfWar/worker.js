'use strict';
importScripts('util.js', 'classes.js', 'pre.js');
const lineColor = '#ddd';
const scale = 2;
const offscreen = [], ctxList = [];
const figure = [];

const polygonList = [];
const rect = Polygon(randomColor(), [Vector(0, 0), Vector(0, .2), Vector(.2, .2), Vector(.2, 0)]);
polygonList.push(rect.move(Vector(.1, .1)), rect.move(Vector(.6, .4)), rect.move(Vector(.1, .5)))
const canvasRect = Polygon('#eee', [Vector(0, 0), Vector(1, 0), Vector(1, 1), Vector(0, 1)]);
const rayNumber = 600;

self.onmessage = e => {
	if (!e.data.e) {
		offscreen.push(e.data);
		ctxList.push(e.data.getContext('2d'));
	} else {
		console.log(e.data.index);
		figure[e.data.index](e.data.e);
	}
}

figure[0] = function(e) {
    const canvas = offscreen[0], ctx = ctxList[0];
    redraw(canvas, ctx, polygonList);
        redraw(canvas, ctx, polygonList);
        const {x, y} = e;
        const point = Vector(x / canvas.width, y / canvas.height);
        drawPoint(canvas, ctx, 'red', point);
}

figure[1] = function(e) {
    const canvas = offscreen[1], ctx = ctxList[1];
    redraw(canvas, ctx, polygonList);
    const rays = getRays(rayNumber);
        redraw(canvas, ctx, polygonList);
        const {x, y} = e;
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
        Polygon('#eee', big).draw(canvas, ctx);
        big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
        big.forEach(p => drawPoint(canvas, ctx, 'red', p));
        drawPoint(canvas, ctx, 'black', point);
}

figure[2] = function(e) {
    const canvas = offscreen[2], ctx = ctxList[2];
    redraw(canvas, ctx, polygonList);
    const rays = getRays(rayNumber);
        redraw(canvas, ctx, polygonList);
        const {x, y} = e;
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
        Polygon('#eee', big).draw(canvas, ctx);
        // big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
        // big.forEach(p => drawPoint(canvas, ctx, 'red', p));
        drawPoint(canvas, ctx, 'black', point);
}

figure[3] = function(e) {
    const canvas = offscreen[3], ctx = ctxList[3];
    redraw(canvas, ctx, polygonList);
        redraw(canvas, ctx, polygonList);
        const {x, y} = e;
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
        Polygon('#eee', big).draw(canvas, ctx);
        big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
        big.forEach(p => drawPoint(canvas, ctx, 'red', p));
        drawPoint(canvas, ctx, 'red', point);
}

figure[4] = function(e) {
    const canvas = offscreen[4], ctx = ctxList[4];
    redraw(canvas, ctx, polygonList);
        redraw(canvas, ctx, polygonList);
        const {x, y} = e;
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
        Polygon('#eee', big).draw(canvas, ctx);
        // big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
        // big.forEach(p => drawPoint(canvas, ctx, 'red', p));
        drawPoint(canvas, ctx, 'red', point);
}
