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
let random = LCG(inputs.a.value >>> 0,
    inputs.c.value >>> 0,
    inputs.m.value >>> 0,
    inputs.x.value >>> 0);
const nextNumberLabel = document.getElementById('next-number');
const averageSpan = document.getElementById('average-span');
document.getElementById('start-function').onclick = start;
document.getElementById('stop-function').onclick = stop;
document.getElementById('next-function').onclick = next;
function drawChart() {
    document.getElementById('chartContainer').style.height = '90vh';
    document.getElementById('watermark-notice').hidden = false;
    const chart = new CanvasJS.Chart('chartContainer', {
        animationEnabled: true,
        zoomEnabled: true,
        theme: "dark1",
        toolTip: {
            enabled: false,
        },
        title:{
            text: 'Distribution chart with ' + DISTRIBUTE_INTERVAL + ' intervals'
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
function redrawChart(chart, distribution, sum) {
    // chart.options.data[0].dataPoints = [...distribution].map((value, index) => ({
    //     x: index / DISTRIBUTE_INTERVAL,
    //     y: value / sum
    // }));
    let dataPoints = [];
    for (let i = 0; i < distribution.length; ++i) {
        dataPoints[i] = {
            x: i / DISTRIBUTE_INTERVAL,
            y: distribution[i] / sum
        }
    }
    chart.options.data[0].dataPoints = dataPoints;
    // const test = distribution.map((value, index) => ({
    //     x: index / DISTRIBUTE_INTERVAL,
    //     y: value / sum
    // }));
    // console.log(test);
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
    random = LCG(message.inputs.a, message.inputs.c, message.inputs.m, message.inputs.x);
    worker1.postMessage({...message, fuckingThingTodo: 'average'});
    const updateAverage = e => averageSpan.innerText = 'Average = ' + e.data.average;
    worker1.onmessage = updateAverage;

    let distribution = new Array(DISTRIBUTE_INTERVAL);
    if (!window.SharedArrayBuffer) {
        worker2.postMessage({...message, fuckingThingTodo: 'distribution1', distribution});
        const updateChart = e => redrawChart(chart, e.data.distribution, e.data.sum);
        worker2.onmessage = updateChart;
    } else {
        const distributionBuffer = new SharedArrayBuffer(DISTRIBUTE_INTERVAL * 4);
        distribution = new Uint32Array(distributionBuffer);
        worker2.postMessage({...message, fuckingThingTodo: 'distribution2', distributionBuffer});
        const updateChart = e => redrawChart(chart, distribution, e.data);
        worker2.onmessage = updateChart;
    }
}
function stop() {
    worker1.terminate();
    worker2.terminate();
    worker1 = undefined;
    worker2 = undefined;
    isWorking = false;
}
function LCG(a, c, m, x) {
    return function random() {
        x = (a * x + c) % m;
        return x / m;
    }
}
function next() {
    nextNumberLabel.innerText = random();
}
