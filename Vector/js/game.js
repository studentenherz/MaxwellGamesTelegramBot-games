/*****************************************************************
Vector: A Zig-zag game, the map is randomly generated,
touching the screen changes the movement direction.

Author: stedentenherz
****************************************************************/


function ge(id) {
	return document.getElementById(id);
}

// constants
const dt = 10;
const v = 0.3;					// velocity in dx/dt
const dx = dt * v;
const alpha = Math.PI / 4;		// angle of the zigzag
const beta = Math.PI / 4;		// arroy tip angle
const sin = Math.sin(alpha);
const cos = Math.cos(alpha);
const tan = Math.tan(alpha);
const aspect_ratio = 0.5;		// height/ width
const portion = 0.9				// portion of the width allocated
const xLine = 40;				// line in which the arrow stays

const aw = 24;					// arrow semi width 

// variables
var a; 					// arrow svg path 
var c;					// circle 
var scaleX;
var scaleY;
var interval;
var playing = false;
var dir = 1;

var x0 = 0;
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

	d += ` l${xs[xs.length - 1] - aw * sin * cos * dir} ${ys[xs.length - 1] - aw * sin * sin * dir}`;

	// d += `l${aw * sin * cos} ${aw * sin * sin * dir}`
	// 	+ `l${aw * Math.sin(alpha - beta) / (Math.cos(beta) * cos)} ${aw * Math.cos(alpha - beta) / (Math.cos(beta) * cos) * dir}`
	// 	+ `l${- aw * Math.sin(3 * beta - alpha) / (Math.cos(beta) * cos)} ${aw * Math.cos(3 * beta - alpha) / (Math.cos(beta) * cos) * dir}`;

	d += ` l${2 * aw * cos * sin * dir} ${- 2 * aw * cos * cos}`;

	d += ` l${- aw * sin * cos * dir - xs[xs.length - 1]} ${aw * sin * sin * dir - ys[xs.length - 1]}`;

	// d += `v${- 2 * aw}`

	for (var i = xs.length - 2; i >= 0; i--)
		d += ` l${-xs[i]} ${-ys[i]}`;

	d += 'z';

	a.setAttribute('d', d);
	c.setAttribute('cx', x);
	c.setAttribute('cy', y);
}

function moveArrow() {
	xs[xs.length - 1] += dx * 1;
	ys[ys.length - 1] += dx * tan * dir;
}


function moveScreen() {
	x0 -= dx * 1;

	if (x0 + xs[0] * 1 < 0) {
		x0 += xs.shift() * 1;
		y0 += ys.shift() * 1;
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