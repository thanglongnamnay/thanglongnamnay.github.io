'use strict';
const DISTRIBUTE_INTERVAL = 1000;
let worker1;
let worker2;
let isWorking = false;
// const distributionTable = document.getElementById('distribution-table').getElementsByTagName('tbody')[0];
const inputs = {
    a: document.getElementById('a-input'),
    c: document.getElementById('c-input'),
    m: document.getElementById('m-input'),
    x: document.getElementById('X0-input')
};
const averageSpan = document.getElementById('average-span');
document.getElementById('start-function').onclick = start;
document.getElementById('stop-function').onclick = stop;
function drawChart() { // not a good practice
    document.getElementById('chartContainer').style.height = '90vh';
    document.getElementById('watermark-notice').hidden = false;
    const chart = new CanvasJS.Chart('chartContainer', {
        animationEnabled: true,
        zoomEnabled: true,
        toolTip: {
            enabled: true,
        },
        title:{
            text: `Distribution chart with ${DISTRIBUTE_INTERVAL} intervals`
        },
        data: [
            {
                // Change type to 'doughnut', 'line', 'splineArea', etc.
                type: 'area',
                dataPoints: []
            }
        ]
    });
    chart.render();
    scrollBy({
        top: 9999,
        behavior: 'smooth'
    });
    return chart;
}
function redrawChart(chart, distribution) { // a better practice
    const sum = distribution.reduce((prev, curr) => prev + curr, 0);
    chart.options.data[0].dataPoints = distribution.map((value, index) => ({
        x: index / DISTRIBUTE_INTERVAL,
        y: value / sum
    }));
    chart.render();
}
function start() {
    if (isWorking) {
        return;
    }
    isWorking = true;
    worker1 = new Worker('worker.js');
    worker2 = new Worker('worker.js');
    const chart = drawChart();
    const message = {
        inputs: {
            a: inputs.a.value >>> 0,
            c: inputs.c.value >>> 0,
            m: inputs.m.value >>> 0,
            x: inputs.x.value >>> 0
        },
    };
    worker1.postMessage({...message, fuckingThingTodo: 'average'});
    worker2.postMessage({...message, fuckingThingTodo: 'distribution', parts: DISTRIBUTE_INTERVAL});
    // const probabilityTableList = createTable(DISTRIBUTE_INTERVAL);
    const updateAverage = e => averageSpan.innerText = 'Average = ' + e.data.average;
    const updateChart = e => redrawChart(chart, e.data.distribution);
    worker1.onmessage = updateAverage;
    worker2.onmessage = updateChart;
}
function stop() {
    worker1.terminate();
    worker2.terminate();
    worker1 = undefined;
    worker2 = undefined;
    isWorking = false;
}
function flood() { // do not invoke this function, test purpose only
    const flooders = [];
    for (let i = 0; i < 1024; ++i) {
        flooders.push(new Worker('flood.js'));
    }
}
/*
function appendRow(table, range) {
    let trow = document.createElement('tr'),
        tdata1 = document.createElement('td'),
        tdata2 = document.createElement('td');
    tdata1.innerText = range;
    tdata2.innerText = '0';
    tdata2.className = 'probability-data';
    trow.appendChild(tdata1);
    trow.appendChild(tdata2);
    table.appendChild(trow);
}
function getRangeList(division) {
    const part = 1 / division;
    const rangeList = [];
    let start = 0;
    while (rangeList.length < division) {
        rangeList.push(`${start.toFixed(2)}..${(start + part).toFixed(2)}`);
        start += part;
    }
    return rangeList;
}
function createTable(rows) {
    const rangeList = getRangeList(rows);
    for (let range of rangeList) {
        appendRow(distributionTable, range);
    }
    return document.getElementsByClassName('probability-data');
}
function rewriteTable(table, distribution) {
    const sum = distribution.reduce((prev, curr) => prev + curr, 0);
    distribution = distribution.map(x => x / sum);
    distribution.forEach((value, index) => {
        table[index].innerText = value;
    });
} */