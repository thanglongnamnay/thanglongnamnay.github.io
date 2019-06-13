'use strict';
import Util from './util-module.js';
import Vector from './Vector.js';
import Polygon from './Polygon.js';
const scale = 2;
const util = Util(scale);
const $ = id => document.getElementById(id);
const canvasList = document.getElementsByClassName('figure-canvas');
let polygonList = [];
let wph = canvasList[0].width / canvasList[0].height;
const rect = Polygon(util.randomColor(), [Vector(0, 0), Vector(0, .2), Vector(.3, .2), Vector(.3, 0)]);
polygonList.push(rect.move(Vector(.1 * wph, .1)), rect.move(Vector(.6 * wph, .4)), rect.move(Vector(.2 * wph, .5)))
const workers = [];
for (let i = 0; i < canvasList.length; ++i) {
    // ctxList.push(canvasList[i].getContext('2d'));
    const offscreen = canvasList[i].transferControlToOffscreen();
    workers.push(new Worker('worker.js'));
    workers[i].postMessage({
        index: i, 
        offscreen, 
        polygonList: polygonList.map(poly => poly.toObject())
    }, [offscreen]);

    canvasList[i].onmousemove = handleMouseMove(i);
    canvasList[i].onclick = handleMouseClick(i);
}
const lastWorkerIndex = canvasList.length - 1;
const lastWorker = workers[canvasList.length - 1];
document.body.onkeyup = handleKeyUp(lastWorkerIndex);
$('apply-button').onclick = requestApply(lastWorkerIndex);
$('reset-button').onclick = requestReset(lastWorkerIndex);
$('random-button').onclick = lastWorker.onmessage = e => {
    randomPolygons();
    if (e.data) polygonList = e.data.map(Polygon.fromObject);
    for (let i = 0; i < canvasList.length; ++i) {
        workers[i].postMessage({
            index: i, 
            polygonList: polygonList.map(poly => poly.toObject())
        });
    }
}
$('switch-mode-6k').onclick = e => {
    e.preventDefault();
    console.log(e);
    workers[3].postMessage({index: 3, type:'switch-mode-6k', e: 1})
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
            points.push(Vector(Math.random() * wph, Math.random()));
        }
        polygonList.push(Polygon(util.randomColor(), points));
    }
}
