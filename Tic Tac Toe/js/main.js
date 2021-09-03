const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const player = {
	x: 0,
	y: 0,
	width: 32,
	height: 48,
	frameX: 0,
	frameY: 0,
	speed: 9,
	moving: false
}

const playerStrite = new Image();
playerStrite.src = '../images/deadpool.png';
const background = new Image();
background.src = '../images/background.png';

function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
	ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH)
}

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	drawSprite(playerStrite, 0, 0, player.width, player.height, player.x, player.y, player.width, player.height)
	requestAnimationFrame(animate)
}

animate()