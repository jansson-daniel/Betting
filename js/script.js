/**
 * Name: LiveBetting
 * Author: Daniel Jansson
 * Date: 2017-09-09
 * Description: a time-betting application
 */
LiveBetting = function (url, callback) {
    var availableSports = ['tennis', 'football', 'basketball'];
    var wrapper = document.getElementById('wrapper');
    var rootUrl = 'https://www.unibet.com/betting#/event/live';

    var liveEvents = [];
    var groups = [];
    var markup = '';
    var counter = 0;
    var sportIcon;

    /**
     * construct (private)
     * Sets up initial application parameters
     * and utility functions
     * @returns {void}
     */
    function construct(data) {
        liveEvents = data.liveEvents;
        groups = data.group;
    }

    /**
     * construct (private)
     * Sets up initial application parameters
     * and utility functions
     * @returns {string}
     */
    function getGameDate(date) {
        return gameIsToday(date) ? 'Today, ' + getTimeFormat(date) : getDateFormat(date) + ', ' + getTimeFormat(date);
    }

    /**
     * construct (private)
     * Sets up initial application parameters
     * and utility functions
     * @returns {string}
     */
    function getSport(sport) {
        return availableSports.indexOf(sport) > -1 ? sport : 'default';
    }

    /**
     * construct (private)
     * Sets up initial application parameters
     * and utility functions
     * @returns {boolean}
     */
    function gameIsToday(date) {
        return new Date().getDate() === new Date(date).getDate();
    }

    /**
     * requestData (private)
     * Request game-data from unibet api
     * @returns {object} data
     */
    function getGame(index) {
        liveEvents = [];

        if (liveEvents.length === 0) {
            return {
                id: '',
                name: 'Sorry, no data available',
                home: '',
                away: '',
                date: '',
                src: function () { return '' }
            }
        }

        return {
            id: liveEvents[index].event.id,
            name: liveEvents[index].event.name,
            home: liveEvents[index].liveData.score.home,
            away: liveEvents[index].liveData.score.away,
            sport: getSport(liveEvents[index].event.sport.toLowerCase()),
            date: getGameDate(new Date(liveEvents[index].event.start)),
            src: function () {
                return './images/icons/' + this.sport + '.png'
            }
        };
    }

    /**
     * requestData (private)
     * Request game-data from unibet api
     * @returns {object} data
     */
    function getTimeFormat(date) {
        return date.toLocaleTimeString(navigator.language, {hour: '2-digit', minute: '2-digit'});
    }


    /**
     * requestData (private)
     * Request game-data from unibet api
     * @returns {object} data
     */
    function requestData() {
        var script = document.createElement('script');
        var head = document.head;

        script.type = 'text/javascript';
        script.src = url + '&callback=liveCallback';
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
    function getDateFormat(date) {
        var day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
        var month = date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth();
        var year = date.getFullYear();

        return year + '/' + month + '/' + day;
    }

    /**
     * createInterval (private)
     * Start animation of the symbols
     * to show result visually for user
     * @returns {object} event
     */
    function createInterval() {
        var interval = setInterval(function () {
            //animateCards();
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
    function whichAnimationEvent() {
        var element = document.createElement("fakeelement");
        var animations = {
            'transition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'otransitionend'
        };

        for (var type in animations) {
            if (element.style[type] !== undefined) {
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
    function animateCards() {
        wrapper.classList.add('slide-out');
        wrapper.addEventListener(whichAnimationEvent(), showNewGame, true);
    }

    /**
     * removeCache (private)
     * Remove cached data after 2min
     * @returns {void}
     */
    function removeCache() {
        var counter = 0;
        var interval = setInterval(function () {
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
    function render() {
        markup = '';
        sportIcon = liveEvents.length ? '<img class="sport-icon" src="' + getGame(i).src() + '" />' : '';

        for (var i = 0; i < 2; i++) {
            markup +=
                '<div class="card">' +
                '<span class="score">' + getGame(i).home + ' – ' + getGame(i).away + '</span>' +
                '<div class="game">' + sportIcon +
                '<span class="name">' + getGame(i).name + '</span>' +
                '</div>' +
                '<span class="date">' + getGame(i).date + '</span>' +
                '<a href="' + rootUrl + '/' + getGame(i).id + '" target="blank" class="betting-btn">Place a bet</a>' +
                '</div>'
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

var url = 'https://api.unicdn.net/v1/feeds/sportsbook/event/live.jsonp?app_id=ca7871d7&app_key=5371c125b8d99c8f6b5ff9a12de8b85a';
var liveBetting = new LiveBetting(url, 'liveCallback');
var cache = window.localStorage.getItem('data');

// If cached data initialize app,
// otherwise make api request to fetch data
cache
    ? liveBetting.init(JSON.parse(cache))
    : liveBetting.loadLiveEvents();

// request-callback
// cache data and initialize app
var liveCallback = function (data) {
    window.localStorage.setItem('data', JSON.stringify(data));
    liveBetting.init(data);
};