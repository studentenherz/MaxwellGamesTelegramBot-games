var theScore = 0;
var color = randomColors();

function ge(id) {
	return document.getElementById(id);
}

ge('score').style['color'] = color;

ge('right').addEventListener('click',
	() => {
		color = randomColors()
		ge('score').style['color'] = color;

		theScore += 1;
		score.innerHTML = theScore;
	}
)

ge('left').addEventListener('click',
	() => {
		color = randomColors()
		ge('score').style['color'] = color;

		theScore = (theScore > 0 ? theScore - 1 : 0);
		score.innerHTML = theScore;
	}
)

// random colors - taken from here:
// http://www.paulirish.com/2009/random-hex-color-code-snippets/

function randomColors() {
	return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function sendScore() {
	// var formData = new FormData();

	// formData.append('user_id', userId);
	// formData.append('score', theScore);

	xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://maxwellgamesbot.herokuapp.com/:5000/setScore', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.send(JSON.stringify({ data: TelegramGameProxy.initParams['data'], score: theScore }));
	// xhr.send(formData);

	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			getScoreBoard();
		}
	}
}


function getScoreBoard() {
	xhr = new XMLHttpRequest();
	xhr.open('GET', `https://maxwellgamesbot.herokuapp.com/:5000/getScoreBoard?data=${TelegramGameProxy.initParams['data']}`, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var resp = JSON.parse(xhr.responseText);
			setScoreBoardHTML(resp);
		}
	};
	xhr.send();
}

function setScoreBoardHTML(scoreList) {
	if (scoreList.length == 0) return;

	ge('scoreboard').innerHTML = '<h2>Scoreboard</h2>';
	var ul = document.createElement('ul');
	ge('scoreboard').appendChild(ul);
	scoreList.forEach(x => {
		var li = document.createElement('li');
		li.innerHTML = `<div><span class="list_pos">${x['position']}.</span> <span class="list_name">${x['user_first_name']}</span></div> <div class="list_score">${x['score']}</div>`;
		if (x['current_player']) {
			li.classList.add('current-player');
			ge('score').innerHTML = x['score'];
			theScore = x['score'];
		}
		ul.appendChild(li);
	});
}


function main() {
	getScoreBoard();
}

window.onload = main;