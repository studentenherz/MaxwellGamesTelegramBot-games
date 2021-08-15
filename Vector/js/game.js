/*****************************************************************
Vector: A Zig-zag game, the map is randomly generated,
touching the screen changes the movement direction.

Author: stedentenherz
****************************************************************/


function ge(id) {
	return document.getElementById(id);
}

// constants
const aspect_ratio = 0.55;		// height/ width
const portion = 1				// portion of the width allocated

let xLine = 40;				// line in which the arrow stays: NEEDS TO BE SCALED

const dt = 15;
const v = 0.03;					// velocity in dx/dt
let dx = dt * v; 				// NEEDS TO BE SCALED

const alpha = Math.PI / 4;		// angle of the zigzag
const beta = Math.PI / 4;		// arroy tip angle  TODO: fix this doesn't work for other angles
const sin = Math.sin(alpha);
const cos = Math.cos(alpha);
const tan = Math.tan(alpha);

const sinb = Math.sin(beta);
const cosb = Math.cos(beta);
const tanb = Math.tan(beta);
let aw = 3;					// arrow semi width : NEEDS TO BE SCALED

let score = 0;
let gameOver = false;

// variables
let rotated = false;	// screen rotated?
let a; 					// arrow svg path 
let c;					// circle 
let backgroundRectangle; // rectagle for background color
let w;
let h;
let scaleX;
let scaleY;
let interval;
let playing = false;
let dir = -1;

let x0 = 0;
let y0 = 100;

let xs = [0];
let ys = [0];

let x;
let y;

let startTime = new Date();
let timeNow = new Date();

// Generate levels from turn points
let wX0 = 0; 				// walls initial x
let wY0 = 0; 				// walls initial y
let wMaxX = 0; 				// walls initial x
let wMaxY = 0; 				// walls initial y
let wDir0 = dir;			// walls intial direction
let waw = 4 * aw;			// vertical width of the hallways
let wX = [];	// walls turning X cordinates
let wY = [];	// walls turning X cordinates
let turners = [];
let a1s = [];
let a2s = [];
let circles = [];
let inverted = false;

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomInteger(n) {
	return Math.floor(Math.random() * n);
}

function init() {

	svg = ge('svg');

	a = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	bottom_wall = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	top_wall = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	backgroundRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

	svg.appendChild(backgroundRectangle);
	svg.appendChild(a);
	svg.appendChild(bottom_wall);
	svg.appendChild(top_wall);

	ge('svg').addEventListener('touchstart', e => {
		e.preventDefault();  // this is to prevent from waiting
		e.stopPropagation(); // this I don't know if actually helps
		zigzag()
	});

	ge('back').addEventListener('touchstart', e => {
		e.preventDefault();  // this is to prevent from waiting
		e.stopPropagation(); // this I don't know if actually helps
		zigzag()
	});

	document.addEventListener('keydown', e => {
		e.preventDefault();
		zigzag()
	});

	scale();
}

function scale() {
	svg = ge('svg');

	w = window.innerWidth;
	h = window.innerHeight;

	// for mobile browsers
	if (window.visualViewport) {
		w = window.visualViewport.width;
		h = window.visualViewport.height;
		ge('back').style.width = w;
		ge('back').style.height = h;
	}

	svg.style.position = 'absolute';
	svg.style.left = `${w / 2}px`;
	svg.style.top = `${h / 2}px`;

	// assuming mobiles with height > width would be better to rotate
	if (h > w) {
		rotated = true;
		let temp = w;
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

	backgroundRectangle.setAttribute('x', -10);
	backgroundRectangle.setAttribute('y', -10);
	backgroundRectangle.setAttribute('width', `${w + 20}`);
	backgroundRectangle.setAttribute('height', `${h + 20}`);

	svg.style.transform = `translate(-${w / 2}px, -${h / 2}px)`;

	scaleX = w / 100;
	scaleY = h / 100;

	x0 *= scaleX;
	y0 = (y0 - waw) * scaleY;

	wX0 = x0;
	wY0 = y0;

	aw *= scaleY;
	waw *= scaleY;
	dx *= scaleX
	xLine *= scaleX;


	// set up initial "map"
	wMaxX = wX0;
	wMaxY = wY0;
	for (let i = 0; i < 8; i++) {
		let deltaX = getRandomArbitrary(25, 38) * scaleX;
		let deltaY = deltaX * tan * wDir0 * (1 - 2 * (wX.length % 2));
		let newY = wMaxY + deltaY;
		if (newY - waw < 0 || newY + waw > 100 * scaleY) i--;
		else {
			wX.push(deltaX);
			wMaxY = newY;
			turners.push(null);
			a1s.push(null);
			a2s.push(null);
			circles.push(null);
		}
	}

	x = x0;
	y = y0;

	if (rotated) {
		svg.style.transform.transformOrigin = `${w / 2}px ${h / 2}px`;
		svg.style.transform += ' rotate(90deg)';

		ge('game-over').classList.add('rotated');
		ge('help').classList.add('rotated');
		ge('status-bar').classList.add('rotated');
	}
}

function draw() {
	function flipTurner(i, x, y) {
		let arrW = waw;

		circles[i].setAttribute('cx', x);
		circles[i].setAttribute('cy', y);
		circles[i].setAttribute('r', 0.7 * arrW);

		arrW *= 0.7;

		a1s[i].setAttribute('d', `M${x - 3 * arrW / 8} ${y + arrW / 8} v${arrW / 4} h${arrW / 2} v${arrW / 8} l${arrW / 4} ${-arrW / 4} l${-arrW / 4} ${-arrW / 4} v${arrW / 8}z`);
		a2s[i].setAttribute('d', `M${x + 3 * arrW / 8} ${y - arrW / 8} v${-arrW / 4} h${-arrW / 2} v${-arrW / 8} l${-arrW / 4} ${arrW / 4} l${arrW / 4} ${arrW / 4} v${-arrW / 8}z`);
	}

	function rotateTurner(i, x, y) {
		let arrW = waw;

		circles[i].setAttribute('cx', x);
		circles[i].setAttribute('cy', y);
		circles[i].setAttribute('r', 0.7 * arrW);

		arrW *= 0.7;

		const r = 0.6 * arrW;
		const angle = 0.2 * Math.PI;
		// let delta = 0.35 * arrW;

		a1s[i].style.transformOrigin = `${x}px ${y}px`;
		a2s[i].style.transformOrigin = `${x}px ${y}px`;

		a1s[i].setAttribute('d', `M${x - r * Math.cos(angle)} ${y + r * Math.sin(angle)} A${r} ${r} 0 0 0 ${x + r} ${y} h${arrW / 8} l${-arrW / 4} ${-arrW / 4} l${-arrW / 4} ${arrW / 4} h${arrW / 8} A${r - arrW / 4} ${r - arrW / 4} 0 0 1 ${x - (r - arrW / 4) * Math.cos(angle)} ${y + (r - arrW / 4) * Math.sin(angle)} z`);
		a2s[i].setAttribute('d', `M${x + r * Math.cos(angle)} ${y - r * Math.sin(angle)} A${r} ${r} 0 0 0 ${x - r} ${y} h${-arrW / 8} l${arrW / 4} ${arrW / 4} l${arrW / 4} ${-arrW / 4} h${-arrW / 8} A${r - arrW / 4} ${r - arrW / 4} 0 0 1 ${x + (r - arrW / 4) * Math.cos(angle)} ${y - (r - arrW / 4) * Math.sin(angle)} z`);
	}

	const bubbles = {
		'flip': flipTurner,
		'rotate': rotateTurner
	};

	// walls
	d1 = `M${wX0} ${wY0 + waw}`;
	d2 = `M${wX0} ${wY0 - waw}`;

	let temX = wX0;
	let temY = wY0;

	for (let i = 0; i < wX.length; i++) {
		temX += wX[i];
		temY += wX[i] * wDir0 * tan * (1 - 2 * (i % 2));
		d1 += ` l${wX[i]} ${wX[i] * wDir0 * tan * (1 - 2 * (i % 2))}`;
		d2 += ` l${wX[i]} ${wX[i] * wDir0 * tan * (1 - 2 * (i % 2))}`;

		// turners
		if (turners[i]) {
			bubbles[turners[i]](i, temX, temY - 3 * waw * wDir0 * (1 - 2 * (i % 2)) / 16);
		}
	}

	d1 += ` V${110 * scaleX} H${wX0} z`;
	d2 += ` V${-10} H${wX0} z`;

	bottom_wall.setAttribute('d', d1);
	top_wall.setAttribute('d', d2);

	// draw arrow
	let d = `M${x0} ${y0 + aw}`;
	for (let i = 0; i < xs.length - 1; i++)
		d += ` l${xs[i]} ${ys[i]}`;
	d += ` l${xs[xs.length - 1] - aw * sin * cos * dir} ${ys[xs.length - 1] - aw * sin * sin}`;
	dd = aw * cos / cosb;
	d += ` l${dd * Math.sin(alpha * dir + beta)} ${dir * dd * Math.cos(alpha * dir + beta)}`;
	d += ` l${- dd * Math.sin(- alpha * dir + beta)} ${- dd * Math.cos(- alpha * dir + beta)}`;
	d += ` l${- dir * aw * sin * cos - xs[xs.length - 1]} ${- aw * sin * sin - ys[xs.length - 1]}`;
	for (let i = xs.length - 2; i >= 0; i--)
		d += ` l${-xs[i]} ${-ys[i]}`;
	d += 'z';
	a.setAttribute('d', d);
}

function moveArrow() {
	xs[xs.length - 1] += dx;
	ys[ys.length - 1] += dx * tan * dir;
}

let turnIndex = 0;
let lastTurnIndex = turnIndex;

function moveScreen() {
	x0 -= dx;
	wX0 -= dx;
	if (x0 + xs[0] < 0) {
		x0 += xs.shift();
		y0 += ys.shift();
	}
	if (wX0 + wX[0] < 0) {
		wY0 += wX[0] * wDir0 * tan;
		wDir0 *= -1;
		wX0 += wX.shift();
		turners.shift();
		let asdasd = a1s.shift(); if (asdasd) asdasd.remove();
		asdasd = a2s.shift(); if (asdasd) asdasd.remove();
		asdasd = circles.shift(); if (asdasd) asdasd.remove();


		for (let i = 0; i < 1; i++) {
			let deltaX = getRandomArbitrary(25 - 18 * Math.min(score / 70, 1), 38) * scaleX;
			let deltaY = deltaX * tan * wDir0 * (1 - 2 * (wX.length % 2));
			let newY = wMaxY + deltaY;
			if (newY - waw < 0 || newY + waw > 100 * scaleY) i--;
			else {
				wX.push(deltaX);
				wMaxY = newY;
				if (turnIndex - lastTurnIndex >= 10 && getRandomArbitrary(1, 100) > 50) {
					lastTurnIndex = turnIndex;
					const turnType = turnTypes[getRandomInteger(turnTypes.length)];
					turners.push(turnType);

					var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
					circ.classList.add('turner');
					ge('svg').appendChild(circ);
					circles.push(circ);

					var a1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
					a1.classList.add('turner', `${turnType}-arrow`);
					ge('svg').appendChild(a1);
					a1s.push(a1);

					var a2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
					a2.classList.add('turner', 'inverted', `${turnType}-arrow`);
					ge('svg').appendChild(a2);
					a2s.push(a2);

					if (inverted) {
						circ.classList.toggle('inverted');
						a1.classList.toggle('inverted');
						a2.classList.toggle('inverted');
					}
				}
				else {
					turners.push(null);
					a1s.push(null);
					a2s.push(null);
					circles.push(null);
				}

			}
		}
		turnIndex++;
	}
}

let startedTiming = false;
let nextTurnX = -1111;

function move() {
	if (startedTiming) {
		timeNow = Date.now();
		let realDt = (timeNow - startTime);
		dx = v * realDt * scaleX;
	}
	else {
		startedTiming = true;
	}
	timeNow = Date.now();
	startTime = timeNow;

	if (collision()) {
		toggle();
		gameOverDialog();
	}
	moveArrow();
	y += dx * tan * dir;
	if (x < xLine)
		x += dx;
	else
		moveScreen();

	// check for turn
	if (nextTurnX == -1111) {
		let temp = wX0;
		for (let i = 0; i < wX.length; ++i) {
			temp += wX[i];
			if (turners[i]) {
				nextTurnX = temp;
				break;
			}
		}
	}
	else {
		nextTurnX -= dx;
		if (nextTurnX < xLine) {
			for (let i = 0; i < turners.length; i++)
				if (turners[i]) {
					turningFunctons[turners[i]]();
					turners[i] = null;
					a1s[i].style.display = 'none';
					a2s[i].style.display = 'none';
					circles[i].style.display = 'none';
					nextTurnX = -1111;
					break;
				}
		}
	}


	draw();
}


function toggle() {
	if (gameOver) return;
	if (!playing) {
		interval = setInterval(move, dt);
		playing = true;
	}
	else {
		clearInterval(interval);
		playing = false;
	}
}

let colorInitialScore = 0;
const minTunrsBeforeColorFlip = 10;

function zigzag() {
	// console.log('zigzag');
	if (!playing) {
		toggle();
		ge('help').style.display = 'none';
		return;
	}
	dir *= -1;
	xs.push(0);
	ys.push(0);
	score++;
	document.querySelectorAll('.score').forEach(x => {
		x.innerHTML = score;
	});

	if (score - colorInitialScore > minTunrsBeforeColorFlip && getRandomArbitrary(1, 100) > 50) {
		colorFlip();
	}
}

function colorFlip() {
	inverted = !inverted;
	colorInitialScore = score;
	ge('back').classList.toggle('inverted')
	document.getElementsByTagName('rect')[0].classList.toggle('inverted');
	[...document.getElementsByTagName('path')].forEach(x => x.classList.toggle('inverted'));
	[...document.querySelectorAll('circle')].forEach(x => x.classList.toggle('inverted'));
}

function rotateScreen() {
	svg.style.transition = ' transform 2s ease-in-out';
	ge('svg').style.transform += ' rotate(-180deg)';
}

function flipScreenX() {
	svg.style.transition = ' transform .2s linear';
	ge('svg').style.transform += ' scaleX(-1)';
}

const turningFunctons = {
	'flip': flipScreenX,
	'rotate': rotateScreen
};

const turnTypes = ['flip', 'rotate'];

function collision() {
	let tipX = x + aw * cos * tanb * cos;
	let tipY = y + aw * cos * tanb * sin * dir;

	// if (tipY < 0 || tipY > 100 * scaleY) return true;

	let hallDir = wDir0;

	let tempX = wX0;
	let tempY = wY0;

	for (let i = 0; i < wX.length; i++) {
		if (tempX <= tipX && tipX <= tempX + wX[i]) {
			tempY += (tipX - tempX) * hallDir * tan;
			return Math.abs(tipY - tempY) > waw;
		}

		tempX += wX[i];
		tempY += wX[i] * hallDir * tan;
		hallDir *= -1;
	}

	return false;
}

function gameOverDialog() {
	ge('game-over').style.zIndex = 100;
	ge('game-over').style.opacity = 100;
	gameOver = true;
	setScoreBoardHTMLLoader();
	sendScore();
}



// the scores comunication
function sendScore() {
	xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://maxwellgamesbot.herokuapp.com/setScore', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.send(JSON.stringify({ data: TelegramGameProxy.initParams['data'], score: score }));
	// xhr.send(formData);

	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			getScoreBoard();
		}
	}
}


function getScoreBoard() {
	xhr = new XMLHttpRequest();
	xhr.open('GET', `https://maxwellgamesbot.herokuapp.com/getScoreBoard?data=${TelegramGameProxy.initParams['data']}`, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var resp = JSON.parse(xhr.responseText);
			setScoreBoardHTML(resp);
		}
	};
	xhr.send();
}

function setScoreBoardHTMLLoader() {
	ge('scoreboard').innerHTML = '<h3>Scoreboard</h3>  <div class="loader"></div> ';
}

function setScoreBoardHTML(scoreList) {
	if (scoreList.length > 0) {
		ge('scoreboard').innerHTML = '<h3>Scoreboard</h3>';
		var ul = document.createElement('ul');
		ge('scoreboard').appendChild(ul);
		if (scoreList.length > 0)
			scoreList.forEach(x => {
				var li = document.createElement('li');
				li.innerHTML = `<div class="list_left"><div class="list_pos">${x['position']}.</div> <div class="list_name">${x['user_first_name']}</div></div> <div class="list_score">${x['score']}</div>`;
				if (x['current_player']) {
					li.classList.add('current-player');
				}
				ul.appendChild(li);
			});
	}
}


function main() {
	init();
	draw();
}

window.onload = main;