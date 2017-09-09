/**
 * Name: LiveBetting
 * Author: Daniel Jansson
 * Date: 2017-09-09
 * Description: a time-betting application
 */
LiveBetting = function (url, callback) {
    const availableSports = ['tennis', 'football', 'basketball'];
    const wrapper = document.getElementById('wrapper');

    let liveEvents = [];
    let markup = '';
    let counter = 0;

    /**
     * Sets up initial application parameters
     * and event-listener on start-button
     * @returns {void}
     */
	function construct (data) {
        liveEvents = data.liveEvents;

        // If today, show today label, otherwise date-format
        this.getGameDate = date => this.gameIsToday(date) ? `Today,  ${this.getTimeFormat(date)}` : `${getDateFormat(date)}, ${this.getTimeFormat(date) }`;
        // Show name of sport if available, otherwise 'default'
        this.getSport = sport => availableSports.indexOf(sport) > -1 ? sport : 'default';
        // Compare game-date with today's date
        this.gameIsToday = date => new Date().getDate() === new Date(date).getDate();
        // Create time format
        this.getTimeFormat = date => date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute:'2-digit' });

        // Create game object
        this.getGame = index => ({
            name: liveEvents[index].event.name,
            home: liveEvents[index].liveData.score.home,
            away: liveEvents[index].liveData.score.away,
            sport: this.getSport(liveEvents[index].event.sport.toLowerCase()),
            date: this.getGameDate(new Date(liveEvents[index].event.start)),
            src: function () { return `./images/icons/${ this.sport }.png` }
        });
	}

    /**
     * Start animation of the symbols
     * to show result visually for user
     * @returns {object} event
     */
	function requestData () {
        const script = document.createElement('script');
        const head = document.head;

		script.type = 'text/javascript';
		script.src = `${url}&callback=liveCallback`;
		head.appendChild(script);
		head.removeChild(script);
	}

    /**
     * Start animation of the symbols
     * to show result visually for user
     * @returns {object} event
     */
	function showNewGame(event) {
        event.target.innerHTML = '';
        event.target.classList.remove('slide-out');
		liveEvents.push(liveEvents.shift());
		render();
	}

    /**
     * Start animation of the symbols
     * to show result visually for user
     * @returns {object} event
     */
    function getDateFormat (date) {
        const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
        const month = date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth();
        const year = date.getFullYear();

        return year + '/' + month + '/' + day;
    }

    /**
     * Start animation of the symbols
     * to show result visually for user
     * @returns {object} event
     */
    function createInterval () {
        const interval = setInterval(() => {
            animateCards();
            counter += 3500;

            if (counter > 120000) {
                counter = 0;
                clearInterval(interval);
                requestData();
            }
        }, 3500);
	}

    /**
     * Start animation of the symbols
     * to show result visually for user
     * @returns {object} event
     */
    function animateCards () {
        wrapper.classList.add('slide-out');
        wrapper.addEventListener('webkitTransitionEnd', showNewGame, false);
    }

    /**
     * Start animation of the symbols
     * to show result visually for user
     * @returns {object} event
     */
    function removeCache () {
    	let counter = 0;
    	const interval = setInterval(() => {
    		counter++;
			if (counter === 10) {
				window.localStorage.removeItem('data');
				clearInterval(interval);
			}
		}, 1000);
	}

    /**
     * Start animation of the symbols
     * to show result visually for user
     * @returns {object} event
     */
    function render () {
    	markup = '';

        for (let i = 0; i < 2; i++) {
            markup +=
                `<div class="card">
					<span class="score">${this.getGame(i).home} – ${this.getGame(i).away}</span>
					<div class="box">
						<img class="icon" src="${this.getGame(i).src()}"/>
						<span class="name">${this.getGame(i).name}</span>
					</div>
					<span class="date">${this.getGame(i).date}</span>
					<button class="bet-btn">Place a bet</button>
				</div>`
        }

        wrapper.innerHTML = markup;
    }

	return {
		init: (data) => {
			construct(data);
			removeCache();
            createInterval();
            render();
		},
		loadMatches: () => {
			requestData();
		}
	}
};