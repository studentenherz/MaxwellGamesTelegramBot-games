/*****************************************************************
Vector: A Zig-zag game, the map is randomly generated,
touching the screen changes the movement direction.

Author: stedentenherz
****************************************************************/


function ge(id) {
	return document.getElementById(id);
}

// constants
const aspect_ratio = 0.5;		// height/ width
const portion = 0.9				// portion of the width allocated

const xLine = 40;				// line in which the arrow stays

const dt = 10;
const v = 0.5;					// velocity in dx/dt
const dx = dt * v;

const aw = 20;					// arrow semi width 
const alpha = Math.PI / 4;		// angle of the zigzag
const beta = Math.PI / 4;		// arroy tip angle  TODO: fix this doesn't work for other angles
const sin = Math.sin(alpha);
const cos = Math.cos(alpha);
const tan = Math.tan(alpha);

// variables
var a; 					// arrow svg path 
var c;					// circle 
var scaleX;
var scaleY;
var interval;
var playing = false;
var dir = 1;

var x0 = -5;
var y0 = 50;

var xs = [0];
var ys = [0];

var x;
var y;

function init() {
	scale();

	svg = ge('svg');

	a = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	c.setAttribute('r', 3);
	console.log(x0, y0);
	c.setAttribute('cx', x0);
	c.setAttribute('cy', y0);
	svg.appendChild(a);
	svg.appendChild(c);
}

function scale() {
	svg = ge('svg');

	var w = window.innerWidth * portion;
	var h = w * aspect_ratio;

	scaleX = w / 100;
	scaleY = h / 100;

	x0 *= scaleX;
	y0 *= scaleY;

	x = x0;
	y = y0;

	svg.setAttribute('width', w);
	svg.setAttribute('height', h);

	svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
}

function draw() {
	// draw arrow
	d = `M${x0} ${y0 + aw}`;
	for (var i = 0; i < xs.length - 1; i++)
		d += ` l${xs[i]} ${ys[i]}`;
	d += ` l${xs[xs.length - 1] - aw * sin * cos * dir} ${ys[xs.length - 1] - aw * sin * sin}`;
	dd = aw * cos / Math.cos(beta);
	d += ` l${dd * Math.sin(alpha * dir + beta)} ${dir * dd * Math.cos(alpha * dir + beta)}`;
	d += ` l${- dd * Math.sin(- alpha * dir + beta)} ${- dd * Math.cos(- alpha * dir + beta)}`;
	// d += ` l${2 * aw * cos * sin * dir} ${- 2 * aw * cos * cos}`;
	d += ` l${- dir * aw * sin * cos - xs[xs.length - 1]} ${- aw * sin * sin - ys[xs.length - 1]}`;
	// d += `v${- 2 * aw}`
	for (var i = xs.length - 2; i >= 0; i--)
		d += ` l${-xs[i]} ${-ys[i]}`;
	d += 'z';

	a.setAttribute('d', d);
	c.setAttribute('cx', x);
	c.setAttribute('cy', y);
}

function moveArrow() {
	xs[xs.length - 1] += dx;
	ys[ys.length - 1] += dx * tan * dir;
}


function moveScreen() {
	x0 -= dx;
	if (x0 + xs[0] < 0) {
		x0 += xs.shift();
		y0 += ys.shift();
	}
}

function move() {
	moveArrow();
	y += dx * tan * dir;
	if (x < xLine * scaleX)
		x += dx;
	else
		moveScreen();
	draw();
}


function toggle() {
	if (!playing) {
		interval = setInterval(move, dt);
		playing = true;
	}
	else {
		clearInterval(interval);
		playing = false;
	}
}

function zigzag() {
	dir *= -1;
	xs.push(0);
	ys.push(0);
}

function main() {
	init();
	draw();
}

window.onload = main;
// ge('svg').addEventListener('clickav', zigzag);