'use strict';
const sc = document.createElement('script');
sc.type = 'module';
if (document.getElementsByTagName('canvas')[0].transferControlToOffscreen) {
    sc.src = 'app.offscreen.js';
} else {
    sc.src = 'app.js';
}
document.body.appendChild(sc);