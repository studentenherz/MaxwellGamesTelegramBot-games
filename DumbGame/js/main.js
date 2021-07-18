var theScore = 0;
var color = randomColors();

function ge(id) {
	return document.getElementById(id);
}

var heart = ge('love')
var score = document.getElementsByTagName('span')[0]

love.style['color'] = color;

love.addEventListener('click',
	() => {
		color = randomColors()
		love.style['color'] = color;

		theScore += 1;
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
	xhr.open('POST', 'http://127.0.0.1:5000/setScore', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.send(JSON.stringify({ data: TelegramGameProxy.initParams['data'], score: theScore }));
	// xhr.send(formData);
}


function getScoreBoard() {
	xhr = new XMLHttpRequest();
	xhr.open('GET', `http://127.0.0.1:5000/getScoreBoard?data=${TelegramGameProxy.initParams['data']}`, true);
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
		li.innerHTML = `<span class="list_pos">${x['position']}</span> <span class="list_name">${x['user_first_name']}</span> <span class="list_score">${x['score']}</span>`;
		ul.appendChild(li);
	});
}