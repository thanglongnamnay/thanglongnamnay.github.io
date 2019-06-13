'use strict';

function drawPoint(canvas, ctx, color, position, size = 5) {
    position = position.toWorld(canvas);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position.x, position.y, size, 0, 2 * Math.PI, true);
    ctx.fill();
    // ctx.fillText(position.x + ';' + position.y, position.x, position.y);
};

function drawPolygon(canvas, ctx, borderColor, fillColor, points) {
    // if (!canvas) canvas = ctx.canvas;
    // else if (!ctx) ctx = canvas.getContext('2d');
    points = points.map(p => p.toWorld(canvas));
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = borderColor;
    ctx.beginPath();
    for (let i = 0; i < points.length; ++i) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawTriangles(canvas, ctx, borderColor, fillColor, points, center) {
    const size = points.length;
    for (let i = 0; i < size; ++i) {
        drawPolygon(canvas, ctx, borderColor, fillColor, [points[i], points[(i + 1) % size], center]);
    }
}

function drawRay(canvas, ctx, color, point, direction) {
    const point2 = point.plus(direction.normalized().mult(2));
    const point2W = point2.toWorld(canvas);
    const pointW = point.toWorld(canvas);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(pointW.x, pointW.y);
    ctx.lineTo(point2W.x, point2W.y);
    ctx.fill();
    ctx.stroke();
    return {point1:point, point2};
}

function getPointsOnRay(point, direction) {
    return {
        point1:point, 
        point2: point.plus(direction.normalized().mult(5))
    };
}

function checkLineIntersection(point1Start, point1End, point2Start, point2End) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    
    let line1StartX = point1Start.x, line1StartY = point1Start.y,
        line1EndX = point1End.x, line1EndY = point1End.y,
        line2StartX = point2Start.x, line2StartY = point2Start.y,
        line2EndX = point2End.x, line2EndY = point2End.y;
    let denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    /*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    result.position = Vector(result.x, result.y);
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

function drawRayIntersection(canvas, ctx, color, point, direction, polygonPoints) {
    const {point1, point2} = getPointsOnRay(point, direction);
    // const {point1, point2} = drawRay(canvas, ctx, color, point, direction);
    const intersections = [];
    let closetPoint;
    const pointNumber = polygonPoints.length;
    for (let i = 0; i < pointNumber; ++i) {
        const point3 = polygonPoints[i], point4 = polygonPoints[(i + 1) % pointNumber];
        const intersection = checkLineIntersection(point1, point2, point3, point4);
        if (intersection.onLine1 && intersection.onLine2) {
            if (!closetPoint || point.distantTo(intersection.position) < point.distantTo(closetPoint)) {
                closetPoint = intersection.position;
            }
        }
    }
    if (closetPoint) {
        intersections.push(closetPoint);
    }
    return intersections;
}

function getRays(rayNumber) {
    const interval = Math.PI * 2 / rayNumber;
    const rays = [];
    let v = Vector(1, 0);
    for (let i = 0; i < rayNumber; ++i) {
        rays.push(v);
        v = v.rotate(interval);
    }
    return rays;
}

function drawAllRayIntersection(canvas, ctx, point, polygonList, rays) {
    const intersections = [];
    for (const ray of rays) {
        // const {point1, point2} = drawRay(canvas, ctx, lineColor, point, ray);
        const {point1, point2} = getPointsOnRay(point, ray);
        let closetPoint = point2;
        for (const polygon of polygonList) {
            const polygonPoints = polygon.points;
            const pointNumber = polygonPoints.length;
            for (let i = 0; i < pointNumber; ++i) {
                const point3 = polygonPoints[i], point4 = polygonPoints[(i + 1) % pointNumber];
                const intersection = checkLineIntersection(point1, point2, point3, point4);
                if (intersection.onLine1 && intersection.onLine2) {
                    if (point.distantTo(intersection.position) < point.distantTo(closetPoint)) {
                        closetPoint = intersection.position;
                    }
                }
            }
        }
        intersections.push(closetPoint);
    }
    return intersections;
}

function polygonPairToPointList(p1, p2) {
    const pointList = [];
    for (let x1 = 0; x1 < p1.points.length; ++x1) {
        const y1 = (x1 + 1) % p1.points.length;
        for (let x2 = 0; x2 < p2.points.length; ++x2) {
            const y2 = (x2 + 1) % p2.points.length;
            const intersection = checkLineIntersection(p1.points[x1], p1.points[y1], p2.points[x2], p2.points[y2])
            if (intersection.onLine1 && intersection.onLine2) {
                pointList.push(intersection.position);
            }
        }
    }
    return pointList;
}

function selfIntersection(poly) {
    const size = poly.points.length;
    const pointList = [];
    for (let x1 = 0; x1 < size; ++x1) {
        const y1 = (x1 + 1) % size;
        for (let x2 = x1 + 1; x2 < size; ++x2) {
            const y2 = (x2 + 1) % size;
            const intersection = checkLineIntersection(poly.points[x1], poly.points[y1], poly.points[x2], poly.points[y2])
            if (intersection.onLine1 && intersection.onLine2) {
                pointList.push(intersection.position);
            }
        }
    }
    return pointList;
}

function polygonListToPointList(polygonList) {
    const size = polygonList.length;
    const pointList = [];
    for (let i = 0; i < size; ++i) {
        pointList.push(...polygonList[i].points, ...selfIntersection(polygonList[i]));
        for (let j = i + 1; j < size; ++j) {
            pointList.push(...polygonPairToPointList(polygonList[i], polygonList[j]));
        }
    }
    return pointList;
}

function drawAllRayVertex(canvas, ctx, point, pointList, polygonList, sort = true) {
    let rays = pointList.map(p => p.minus(point));
    rays = rays.flatMap(r => ([r.rotate(.00001), r.rotate(-.00001)]));
    if (sort) rays.sort((a, b) => a.angleTo(b));
    return drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
}

function redraw(canvas, ctx, polygonList) {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const polygon of polygonList) {
        polygon.draw(canvas, ctx);
    }
}