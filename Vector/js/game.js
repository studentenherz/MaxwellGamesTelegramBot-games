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

// Generate levels from turn points
let wX0 = 0; 				// walls initial x
let wY0 = 0; 				// walls initial y
let wMaxX = 0; 				// walls initial x
let wMaxY = 0; 				// walls initial y
let wDir0 = dir;			// walls intial direction
let waw = 4 * aw;			// vertical width of the hallways
let wX = [];	// walls turning X cordinates
let wY = [];	// walls turning X cordinates

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function init() {
	scale();

	svg = ge('svg');

	a = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	bottom_wall = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	top_wall = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	// c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	// c.setAttribute('r', 3);
	// c.setAttribute('cx', x0);
	// c.setAttribute('cy', y0);
	svg.appendChild(a);
	svg.appendChild(bottom_wall);
	svg.appendChild(top_wall);
	// svg.appendChild(c);

	// ge('svg').addEventListener('click', zigzag);

	ge('svg').addEventListener('touchstart', e => {
		e.preventDefault();  // this is to prevent from waiting
		e.stopPropagation(); // this I don't know if actually helps
		zigzag()
	});

	document.addEventListener('keydown', e => {
		e.preventDefault();
		zigzag()
	});


	// ge('svg').addEventListener('touchstart', () => console.log('touchstart'));
	// ge('svg').addEventListener('touchend', () => console.log('touchend'));
	// ge('svg').addEventListener('mousedown', () => console.log('mousedown'));
	// ge('svg').addEventListener('mouseup', () => console.log('mouseup'));
}

function scale() {
	svg = ge('svg');

	let w = window.innerWidth;
	let h = window.innerHeight;

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

	svg.style.transform = `translate(-${w / 2}px, -${h / 2}px)`;

	scaleX = w / 100;
	scaleY = h / 100;

	x0 *= scaleX;
	y0 *= scaleY;

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
		let deltaX = getRandomArbitrary(10, 40) * scaleX;
		let deltaY = deltaX * tan * wDir0 * (1 - 2 * (wX.length % 2));
		let newY = wMaxY + deltaY;
		if (newY < 0 || newY > 100 * scaleY) i--;
		else {
			wX.push(deltaX);
			wMaxY = newY;
		}
	}

	x = x0;
	y = y0;

	if (rotated) {
		svg.style.transform.transformOrigin = `${w / 2}px ${h / 2}px`;
		svg.style.transform += ' rotate(90deg)';

		ge('game-over').classList.add('rotated');
		ge('help').classList.add('rotated');
		// console.log('rotated');
	}
}

function draw() {
	// draw arrow
	let d = `M${x0} ${y0 + aw}`;
	for (let i = 0; i < xs.length - 1; i++)
		d += ` l${xs[i]} ${ys[i]}`;
	d += ` l${xs[xs.length - 1] - aw * sin * cos * dir} ${ys[xs.length - 1] - aw * sin * sin}`;
	dd = aw * cos / cosb;
	d += ` l${dd * Math.sin(alpha * dir + beta)} ${dir * dd * Math.cos(alpha * dir + beta)}`;
	d += ` l${- dd * Math.sin(- alpha * dir + beta)} ${- dd * Math.cos(- alpha * dir + beta)}`;
	// d += ` l${2 * aw * cos * sin * dir} ${- 2 * aw * cos * cos}`;
	d += ` l${- dir * aw * sin * cos - xs[xs.length - 1]} ${- aw * sin * sin - ys[xs.length - 1]}`;
	// d += `v${- 2 * aw}`
	for (let i = xs.length - 2; i >= 0; i--)
		d += ` l${-xs[i]} ${-ys[i]}`;
	d += 'z';

	a.setAttribute('d', d);

	// the ball
	// c.setAttribute('cx', x);
	// c.setAttribute('cy', y);

	// walls

	d1 = `M${wX0} ${wY0 + waw}`;
	d2 = `M${wX0} ${wY0 - waw}`;

	for (let i = 0; i < wX.length; i++) {
		d1 += `l${wX[i]} ${wX[i] * wDir0 * tan * (1 - 2 * (i % 2))}`;
		d2 += `l${wX[i]} ${wX[i] * wDir0 * tan * (1 - 2 * (i % 2))}`;
	}

	d1 += `V${100 * scaleX} H${wX0} z`;
	d2 += `V${0} H${wX0} z`;

	bottom_wall.setAttribute('d', d1);
	top_wall.setAttribute('d', d2);
}

function moveArrow() {
	xs[xs.length - 1] += dx;
	ys[ys.length - 1] += dx * tan * dir;
}


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

		for (let i = 0; i < 1; i++) {
			let deltaX = getRandomArbitrary(10, 40) * scaleX;
			let deltaY = deltaX * tan * wDir0 * (1 - 2 * (wX.length % 2));
			let newY = wMaxY + deltaY;
			if (newY < 0 || newY > 100 * scaleY) i--;
			else {
				wX.push(deltaX);
				wMaxY = newY;
			}
		}

		// console.log(wX.length);
	}
}

function move() {
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
	ge('score').innerHTML = score;

	if (getRandomArbitrary(1, 100) > 85) {
		document.getElementsByTagName('svg')[0].classList.toggle('inverted');
		[...document.getElementsByTagName('path')].forEach(x => x.classList.toggle('inverted'))
	}
}

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
	// var formData = new FormData();

	// formData.append('user_id', userId);
	// formData.append('score', theScore);

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