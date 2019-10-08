'use strict';
export default function Vector(x, y) {
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
        return -Math.atan2(y , x);
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