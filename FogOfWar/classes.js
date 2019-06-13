'use strict';
function Vector(x, y) {
    const eulerDistant = Math.sqrt(x * x + y * y);
    function draw(canvas, ctx, color, size = 5) {
        position = toWorld(canvas);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(position.x, position.y, size, 0, 2 * Math.PI, true);
        ctx.fill();
    }
    function mag() {
        return eulerDistant;
    }
    function normalized() {
        return Vector(x / eulerDistant, y / eulerDistant);
    }
    function angle() {
        return angleTo(Vector(1, 0));
    }
    function plus(v) {
        return Vector(x + v.x, y + v.y);
    }
    function minus(v) {
        return Vector(x - v.x, y - v.y);
    }
    function mult(k) {
        return Vector(x * k, y * k);
    }
    function div(k) {
        return Vector(x / k, y / k);
    }
    function dot(v) {
        return x * v.x + y * v.y;
    }
    function distantTo(v) {
        return minus(v).mag();
    }
    function equal(v) {
        return x.toFixed(8) === v.x.toFixed(8) && y.toFixed(8) === v.y.toFixed(8);
    }
    function parallel(v) {
        return x / v.x > 0 && (x / v.x).toFixed(8) === (y / v.y).toFixed(8);
    }
    function angleTo(v) {
        return Math.atan2(v.y , v.x) - Math.atan2(y , x);
    }
    function rotate(alpha) {
        const sinA = Math.sin(alpha), cosA = Math.cos(alpha);
        return Vector(cosA * x - sinA * y, sinA * x + cosA * y);
    }
    function toWorld(canvas) {
        return Vector(x * canvas.height >> 0, y * canvas.height >> 0)
    }
    return {
        x,
        y,
        normalized,
        mag,
        angle,
        distantTo,
        plus,
        minus,
        mult,
        div,
        dot,
        angleTo,
        parallel,
        equal,
        rotate,
        toWorld
    }
}

function Polygon(color, points) {
    function draw(canvas, ctx) {
        const pointsW = points.map(p => p.toWorld(canvas));
        ctx.fillStyle = color;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        for (let i = 0; i < pointsW.length; ++i) {
            ctx.lineTo(pointsW[i].x, pointsW[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    function move(v) {
        return Polygon(color, points.map(p => p.plus(v)));
    }
    function addPoints(...ps) {
        return points.push(...ps);
    }
    function toObject() {
        return ({
            color,
            points: points.map(p => ({x: p.x, y: p.y}))
        })
    }
    return {
        color,
        points,
        draw,
        move,
        addPoints,
        toObject
    }
}

Polygon.fromObject = function(obj) {
    return Polygon(obj.color, obj.points.map(p => Vector(p.x, p.y)));
}