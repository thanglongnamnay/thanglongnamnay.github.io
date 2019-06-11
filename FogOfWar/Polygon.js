'use strict';
export default function Polygon(color, points) {
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