LiveBetting = function (url, callback) {
	var liveEvents = [];
	var groups = [];
	var activeCard = 0;
	var wrapper = document.getElementById('wrapper');

	function setEvents (data) {
		liveEvents = data.liveEvents;
		groups = data.groups;
	}

	function requestData () {
		var head = document.head;
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url + '&callback=liveCallback';
		head.appendChild(script);
		head.removeChild(script);
	}

	function sameDay(date) {
		return new Date().getDate() === new Date(date).getDate();
	}

	function getDate (date) {
		var day = date.getDate(); //Date of the month: 2 in our example
		var month = date.getMonth(); //Month of the Year: 0-based index, so 1 in our example
		var year = date.getFullYear();

		if (month < 10) month = '0' + month;
		if (day < 10) day = '0' + day;

		return year + '/' + month + '/' + day;
	}

	function renderCards () {
		var container = document.getElementById('wrapper');
		var day0 = sameDay(new Date(liveEvents[0].event.start)) ? 'Today, ' + new Date(liveEvents[0].event.start).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) : getDate(new Date(liveEvents[0].event.start)) + ', ' + new Date(liveEvents[0].event.start).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
		var day1 = sameDay(new Date(liveEvents[1].event.start)) ? 'Today, ' + new Date(liveEvents[1].event.start).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) : getDate(new Date(liveEvents[1].event.start)) + ', ' + new Date(liveEvents[1].event.start).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
		var sport0 = liveEvents[0].event.sport.toLowerCase();
		var sport1 = liveEvents[1].event.sport.toLowerCase();

		if (sport0 !== 'tennis' && sport0 !== 'football' && sport0 !=='basketball') {
			sport0 = 'default';
		}

		if (sport1 !== 'tennis' && sport1 !== 'football' && sport1 !=='basketball') {
			sport1 = 'default';
		}

		var src0 = './images/icons/' + sport0 + '.png';
		var src1 = './images/icons/' + sport1 + '.png';

		container.innerHTML =
			'<div class="card">' +
				'<span class="score">' + liveEvents[0].liveData.score.home + ' – ' + liveEvents[0].liveData.score.away + '</span>' +
				'<div class="box">' +
					'<img class="icon" src="' + src0 + '"/>' +
					'<span class="name">' + liveEvents[0].event.name + '</span>' +
				'</div>' +
				'<span class="date">' + day0 + '</span>' +
				'<button class="bet-btn">Place a bet</button>' +
			'</div>' +
			'<div class="card">' +
				'<span class="score">' + liveEvents[1].liveData.score.home + ' – ' + liveEvents[1].liveData.score.away + '</span>' +
				'<div class="box">' +
					'<img class="icon" src="' + src1 + '"/>' +
					'<span class="name">' + liveEvents[1].event.name + '</span>' +
				'</div>' +
				'<span class="date">' + day1 + '</span>' +
				'<button class="bet-btn">Place a bet</button>' +
			'</div>'
	}

	var add = function () {
		wrapper.innerHTML = '';
		wrapper.classList.remove('slide-out');
		liveEvents.push(liveEvents.shift());
		renderCards();
	};

	function animateCards () {
		wrapper.classList.add('slide-out');
		wrapper.addEventListener('webkitTransitionEnd', add, true);
	}

	return {
		init: function(data) {
			setEvents(data);
			renderCards();
			var counter = 0;

			var interval = setInterval(function () {
				animateCards();
				counter += 3500;
				if (counter > 120000) {
					counter = 0;
					clearInterval(interval);
					requestData();
				}
			}, 3500);
		},
		loadMatches: function () {
			requestData();
		}
	}
};