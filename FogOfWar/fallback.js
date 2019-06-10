
let figure = []; 
figure[0] = function() {
    const canvas = figureCanvasList[0], ctx = ctxList[0];
    redraw(canvas, ctx, polygonList);
    canvas.onmousemove = e => {
        redraw(canvas, ctx, polygonList);
        const {x, y} = getXY(e);
        const point = Vector(x / canvas.width, y / canvas.height);
        drawPoint(canvas, ctx, 'red', point);
    }
}

figure[1] = function() {
    const canvas = figureCanvasList[1], ctx = ctxList[1];
    redraw(canvas, ctx, polygonList);
    const rays = getRays(60);
    canvas.onmousemove = e => {
        redraw(canvas, ctx, polygonList);
        const {x, y} = getXY(e);
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
        Polygon('#eee', big).draw(canvas, ctx);
        big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
        big.forEach(p => drawPoint(canvas, ctx, 'red', p));
        drawPoint(canvas, ctx, 'black', point);
    }
}


figure[2] = function() {
    const canvas = figureCanvasList[2], ctx = ctxList[2];
    redraw(canvas, ctx, polygonList);
    const rays = getRays(60);
    canvas.onmousemove = e => {
        redraw(canvas, ctx, polygonList);
        const {x, y} = getXY(e);
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayIntersection(canvas, ctx, point, polygonList, rays);
        Polygon('#eee', big).draw(canvas, ctx);
        // big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
        // big.forEach(p => drawPoint(canvas, ctx, 'red', p));
        drawPoint(canvas, ctx, 'black', point);
    }
}

figure[3] = function() {
    const canvas = figureCanvasList[3], ctx = ctxList[3];
    redraw(canvas, ctx, polygonList);
    canvas.onmousemove = e => {
        redraw(canvas, ctx, polygonList);
        const {x, y} = getXY(e);
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
        Polygon('#eee', big).draw(canvas, ctx);
        big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
        big.forEach(p => drawPoint(canvas, ctx, 'red', p));
        drawPoint(canvas, ctx, 'red', point);
    }
}

figure[4] = function() {
    const canvas = figureCanvasList[4], ctx = ctxList[4];
    redraw(canvas, ctx, polygonList);
    canvas.onmousemove = e => {
        redraw(canvas, ctx, polygonList);
        const {x, y} = getXY(e);
        const point = Vector(x / canvas.width, y / canvas.height);
        const big = drawAllRayVertex(canvas, ctx, point, [...polygonList, canvasRect]);
        Polygon('#eee', big).draw(canvas, ctx);
        // big.forEach(p => drawRay(canvas, ctx, lineColor, point, p.minus(point)));
        // big.forEach(p => drawPoint(canvas, ctx, 'red', p));
        drawPoint(canvas, ctx, 'red', point);
    }
}

// figure.forEach(f => f());