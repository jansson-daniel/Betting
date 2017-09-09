/**
 * Name: LiveBetting
 * Author: Daniel Jansson
 * Date: 2017-09-09
 * Description: a time-betting application
 */
LiveBetting = function (url, callback) {
    const availableSports = ['tennis', 'football', 'basketball'];
    const wrapper = document.getElementById('wrapper');
    const rootUrl = 'https://www.unibet.com/betting#/event/live';

    let liveEvents = [];
    let groups = [];
    let markup = '';
    let counter = 0;

    /**
	 * construct (private)
     * Sets up initial application parameters
     * and utility functions
     * @returns {void}
     */
	function construct (data) {
        liveEvents = data.liveEvents;
        groups = data.group;

        // If game is today, show today label, otherwise date-format
        this.getGameDate = date => this.gameIsToday(date) ? `Today,  ${this.getTimeFormat(date)}` : `${getDateFormat(date)}, ${this.getTimeFormat(date) }`;
        // Show name of sport if available, otherwise 'default'
        this.getSport = sport => availableSports.indexOf(sport) > -1 ? sport : 'default';
        // Compare game-date with today's date
        this.gameIsToday = date => new Date().getDate() === new Date(date).getDate();
        // Create time format
        this.getTimeFormat = date => date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute:'2-digit' });

        // Create game object
        this.getGame = index => ({
			id: liveEvents[index].event.id,
            name: liveEvents[index].event.name,
            home: liveEvents[index].liveData.score.home,
            away: liveEvents[index].liveData.score.away,
            sport: this.getSport(liveEvents[index].event.sport.toLowerCase()),
            date: this.getGameDate(new Date(liveEvents[index].event.start)),
            src: function () { return `./images/icons/${ this.sport }.png` }
        });
	}

    /**
	 * requestData (private)
     * Request game-data from unibet api
     * @returns {object} data
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
	 * showNewGame (private)
     * Update container with new game
     * @param {object} event
     * @returns {void}
     */
	function showNewGame(event) {
        event.target.innerHTML = '';
        event.target.classList.remove('slide-out');
		liveEvents.push(liveEvents.shift());
		render();
	}

    /**
	 * getDateFormat (private)
     * Get date-format for game
	 * @param {object} date
     * @returns {string} date-format
     */
    function getDateFormat (date) {
        const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
        const month = date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth();
        const year = date.getFullYear();

        return `${year}/${month}/${day}`;
    }

    /**
	 * createInterval (private)
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
	 * whichAnimationEvent (private)
     * Check for browser-specific event
     * @returns {string} type of event event
     */
    function whichAnimationEvent () {
        const element = document.createElement("fakeelement");
        const animations = {
            'transition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'otransitionend'
        };

        for (let type in animations){
            if (element.style[type] !== undefined){
                return animations[type];
            }
        }
    }

    /**
	 * animateCards (private)
     * Start animation of the game-cards
	 * Call showNewCame when animation ends to show new card
     * @returns {void}
     */
    function animateCards () {
        wrapper.classList.add('slide-out');
        wrapper.addEventListener(whichAnimationEvent(), showNewGame, true);
    }

    /**
	 * removeCache (private)
     * Remove cached data after 2min
     * @returns {void}
     */
    function removeCache () {
    	let counter = 0;
    	const interval = setInterval(() => {
    		counter++;
			if (counter === 12e4) {
				window.localStorage.removeItem('data');
				clearInterval(interval);
			}
		}, 1000);
	}

    /**
	 * render (private)
     * Render cards on screen
     * @returns {void}
     */
    function render () {
    	markup = '';

        for (let i = 0; i < 2; i++) {
            markup +=
                `<div class="card">
					<span class="score">${this.getGame(i).home} – ${this.getGame(i).away}</span>
					<div class="game">
						<img class="sport-icon" src="${this.getGame(i).src()}" alt="sport-icon" />
						<span class="name">${this.getGame(i).name}</span>
					</div>
					<span class="date">${this.getGame(i).date}</span>
					<a href="${rootUrl}/${this.getGame(i).id}" target="blank" class="betting-btn">Place a bet</a>
				</div>`
        }

        wrapper.innerHTML = markup;
    }

	return {
        /**
         * init (public)
         * initializes app
         * @returns {void}
         */
		init: function (data) {
			construct(data);
			removeCache();
            createInterval();
            render();
		},
        /**
         * loadLiveEvents (public)
         * makes request to fetch data
         * @returns {object} data
         */
		loadLiveEvents: function () {
			requestData();
		}
	}
};