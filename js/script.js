/**
 * Name: LiveBetting
 * Author: Daniel Jansson
 * Date: 2017-09-09
 * Description: a live time-betting application
 */
LiveBetting = function (url, callback) {
    var availableSports = ['tennis', 'football', 'basketball'];
    var wrapper = document.getElementById('wrapper');
    var rootUrl = 'https://www.unibet.com/betting#/event/live';
    var liveEvents = [];
    var sportIcon;
    var bettingBtn;

    /**
     * getGame (private)
     * Sets up game-object with data for rendering
     * @param {number} index
     * @returns {object}
     */
    function getGame (index) {
        var gameObject;

        if (liveEvents.length === 0) {
            gameObject = {
                id: '',
                name: 'Sorry, no data available',
                home: '',
                away: '',
                date: '',
                src: function () { return '' }
            }
        } else {
            gameObject = {
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

        return gameObject;
    }

    /**
     * getGameDAte (private)
     * Formats game-date
     * @param {object} date
     * @returns {string}
     */
    function getGameDate (date) {
        return gameIsToday(date) ? 'Today, ' + getTimeFormat(date) : getDateFormat(date) + ', ' + getTimeFormat(date);
    }

    /**
     * getSport (private)
     * Gets available sport or default
     * @param {string} sport
     * @returns {string}
     */
    function getSport (sport) {
        return availableSports.indexOf(sport) > -1 ? sport : 'default';
    }

    /**
     * getTimeFormat (private)
     * Converts date object to formatted time
     * @param {object} date
     * @returns {string}
     */
    function getTimeFormat (date) {
        return date.toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit', hour12: false});
    }

    /**
     * getDateFormat (private)
     * Converts date object to formatted date
     * @param {object} date
     * @returns {string} date-format
     */
    function getDateFormat (date) {
        var day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
        var month = date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth();
        var year = date.getFullYear();

        return year + '/' + month + '/' + day;
    }

    /**
     * gameIsToday (private)
     * Calculates if game started today or not
     * @param {object} date
     * @returns {boolean}
     */
    function gameIsToday (date) {
        return new Date().getDate() === new Date(date).getDate();
    }

    /**
     * requestData (private)
     * Request game-data from Unitbet Api
     * @returns {object} live data
     */
    function requestData () {
        var script = document.createElement('script');
        var head = document.head;

        script.type = 'text/javascript';
        script.src = url + '&callback=liveCallback';
        head.appendChild(script);
        head.removeChild(script);
    }

    /**
     * showNewGame (private)
     * Update container with new live events
     * @param {object} event
     * @returns {void}
     */
    function showNewGame (event) {
        event.target.innerHTML = '';
        event.target.classList.remove('slide-out');
        liveEvents.push(liveEvents.shift());
        render();
    }

    /**
     * createInterval (private)
     * Cache data and start animation of cards
     * @returns {object} event
     */
    function createAnimation () {
        if (liveEvents.length > 0) {
            var counter = 0;

            setInterval(function () {
                counter++;
                if (counter > 24) {
                    window.localStorage.removeItem('data');
                }
                animateCards();
            }, 3500);
        }
    }

    /**
     * whichAnimationEvent (private)
     * Check for browser-specific event
     * @returns {string} type of event event
     */
    function whichAnimationEvent () {
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
     * Starts animation of game cards
     * Call showNewCame when animation ends to show new card
     * @returns {void}
     */
    function animateCards () {
        wrapper.classList.add('slide-out');
        wrapper.addEventListener(whichAnimationEvent(), showNewGame, true);
    }

    /**
     * createIcons (private)
     * Render elements if live-data exist
     * @param {number} index, game object index
     * @returns {void}
     */
    function createIcons (index) {
        if (liveEvents.length > 0) {
            sportIcon = '<img class="sport-icon" src="' + getGame(index).src() + '" />';
            bettingBtn = '<a href="' + rootUrl + '/' + getGame(index).id + '" target="blank" class="betting-btn">Place a bet</a>';
        } else {
            sportIcon = '';
            bettingBtn = '';
        }
    }

    /**
     * render (private)
     * Renders cards on screen
     * @returns {void}
     */
    function render () {
        var markup = '';

        for (var i = 0; i < 2; i++) {
            createIcons(i);

            markup +=
                '<div class="card">' +
                '<span class="score">' + getGame(i).home + ' – ' + getGame(i).away + '</span>' +
                '<div class="game">' + sportIcon +
                '<span class="name">' + getGame(i).name + '</span>' +
                '</div>' +
                '<span class="date">' + getGame(i).date + '</span>' + bettingBtn +
                '</div>'
        }

        wrapper.innerHTML = markup;
    }

    return {
        /**
         * init (public)
         * initializes application
         * @param {object} data, live-data
         * @returns {void}
         */
        start: function (data) {
            liveEvents = data.liveEvents;
            createAnimation();
            render();
        },
        /**
         * loadLiveEvents (public)
         * makes request to fetch data
         * @returns {void}
         */
        loadLiveEvents: function () {
            requestData();
        }
    }
};

// Create LiveBetting object
var url = 'https://api.unicdn.net/v1/feeds/sportsbook/event/live.jsonp?app_id=ca7871d7&app_key=5371c125b8d99c8f6b5ff9a12de8b85a';
var liveBetting = new LiveBetting(url, 'liveCallback');
var cache = window.localStorage.getItem('data');

// If cached data initialize app,
// otherwise make api request to fetch data
if (cache) {
    liveBetting.start(JSON.parse(cache))
} else {
    liveBetting.loadLiveEvents();
}

/**
 * liveCallback (global)
 * Api-request callback
 * @param {object} data, live-data
 * @returns {void}
 */
var liveCallback = function (data) {
    if (!window.localStorage.getItem('data')) {
        window.localStorage.setItem('data', JSON.stringify(data));
    }

    liveBetting.start(data);
};