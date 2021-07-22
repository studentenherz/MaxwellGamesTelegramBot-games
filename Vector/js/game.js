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

var xLine = 40;				// line in which the arrow stays: NEEDS TO BE SCALED

const dt = 10;
const v = 0.05;					// velocity in dx/dt
var dx = dt * v; 				// NEEDS TO BE SCALED

const alpha = Math.PI / 4;		// angle of the zigzag
const beta = Math.PI / 4;		// arroy tip angle  TODO: fix this doesn't work for other angles
const sin = Math.sin(alpha);
const cos = Math.cos(alpha);
const tan = Math.tan(alpha);
var aw = 3;					// arrow semi width : NEEDS TO BE SCALED

// variables
var rotated = false;	// screen rotated?
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
	c.setAttribute('cx', x0);
	c.setAttribute('cy', y0);
	svg.appendChild(a);
	svg.appendChild(c);

	ge('svg').addEventListener('click', zigzag);
}

function scale() {
	svg = ge('svg');

	var w = window.innerWidth;
	var h = window.innerHeight;

	// for mobile browsers
	if (window.visualViewport) {
		w = window.visualViewport.width;
		h = window.visualViewport.height;
	}

	svg.style.position = 'absolute';
	svg.style.left = `${w / 2}px`;
	svg.style.top = `${h / 2}px`;

	// assuming mobiles with height > width would be better to rotate
	if (h > w) {
		rotated = true;
		var temp = w;
		w = h;
		h = temp;
	}

	if (w * portion * aspect_ratio < h) {
		w *= portion;
		h = w * aspect_ratio;
	}
	else {
		h *= portion;
		w = h / aspect_ratio;
	}

	svg.setAttribute('width', w);
	svg.setAttribute('height', h);

	svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

	svg.style.transform = `translate(-${w / 2}px, -${h / 2}px)`;

	scaleX = w / 100;
	scaleY = h / 100;

	x0 *= scaleX;
	y0 *= scaleY;

	aw *= scaleY;
	dx *= scaleX
	xLine *= scaleX;

	x = x0;
	y = y0;

	if (rotated) {
		svg.style.transform.transformOrigin = `${w / 2}px ${h / 2}px`;
		svg.style.transform += ' rotate(90deg)';
		console.log('rotated');
	}
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
	if (x < xLine)
		x += dx;
	else
		moveScreen();
	draw();
}


function toggle() {
	if (!playing) {
		interval = setInterval(move, dt);
		playing = true;
		ge('play-button').classList.remove('fa-play', 'centered');
		ge('play-button').classList.add('fa-pause', 'bottom');
	}
	else {
		clearInterval(interval);
		playing = false;
		ge('play-button').classList.remove('fa-pause', 'bottom');
		ge('play-button').classList.add('fa-play', 'centered');
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