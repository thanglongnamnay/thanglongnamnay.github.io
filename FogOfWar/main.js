'use strict';
import Util from './util-module.js';
import Vector from './Vector.js';
import Polygon from './Polygon.js';
const scale = 2;
const util = Util(scale);
const $ = id => document.getElementById(id);
const figureCanvasList = document.getElementsByClassName('figure-canvas');
const workers = [];
let polygonList = [];
const rect = Polygon(util.randomColor(), [Vector(0, 0), Vector(0, .2), Vector(.2, .2), Vector(.2, 0)]);
polygonList.push(rect.move(Vector(.1, .1)), rect.move(Vector(.6, .4)), rect.move(Vector(.2, .5)))
// polygonList.push(Polygon(util.randomColor(), [Vector(.2, 0), Vector(0, .2)]).move(Vector(.3, .3)));


for (let i = 0; i < figureCanvasList.length; ++i) {
    // ctxList.push(figureCanvasList[i].getContext('2d'));
    const offscreen = figureCanvasList[i].transferControlToOffscreen();
    workers.push(new Worker('worker.js'));
    workers[i].postMessage({
        index: i, 
        offscreen, 
        polygonList: polygonList.map(poly => poly.toObject())
    }, [offscreen]);

    figureCanvasList[i].onmousemove = util.throttle(handleMouseMove(i), 15);
    figureCanvasList[i].onclick = handleMouseClick(i);
}
const lastWorkerIndex = figureCanvasList.length - 1;
const lastWorker = workers[figureCanvasList.length - 1];
document.body.onkeyup = handleKeyUp(lastWorkerIndex);
$('apply-button').onclick = requestApply(lastWorkerIndex);
$('reset-button').onclick = requestReset(lastWorkerIndex);
$('random-button').onclick = lastWorker.onmessage = e => {
    randomPolygons();
    if (e.data) polygonList = e.data.map(Polygon.fromObject);
    for (let i = 0; i < figureCanvasList.length; ++i) {
        workers[i].postMessage({
            index: i, 
            polygonList: polygonList.map(poly => poly.toObject())
        });
    }
}
function handleMouseMove(i) {
    return function(e) {
        e.preventDefault();
        workers[i].postMessage({index: i, type:'move', e: util.getXY(e)});
    }
}

function handleMouseClick(i) {
    return function(e) {
        e.preventDefault();
        workers[i].postMessage({index: i, type:'click', e: util.getXY(e)});
    }
}

function handleKeyUp(i) {
    return function(e) {
        e.preventDefault();
        workers[i].postMessage({index: i, type:'keyup', e: {which: e.which || e.keyCode || 0}});
    }
}

function requestApply(i) {
    return function(e) {
        workers[i].postMessage({index: i, type:'apply', e: 1});
    }
}

function requestReset(i) {
    return function(e) {
        workers[i].postMessage({index: i, type:'reset', e: 1});
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