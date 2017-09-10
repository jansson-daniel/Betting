/**
 * Name: LiveBetting
 * Author: Daniel Jansson
 * Date: 2017-09-09
 * Description: a live time-betting application
 */
LiveBetting = function (url, callback) {
    var wrapper = document.getElementById('wrapper');
    var availableSports = ['tennis', 'football', 'basketball'];
    var rootUrl = 'https://www.unibet.com/betting#/event/live';
    var liveEvents = [];

    /**
     * getGame (private)
     * Sets up game-object with data for rendering
     * @param {number} index - array index
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
                src: function () { return './images/icons/' + this.sport + '.png' }
            };
        }

        return gameObject;
    }

    /**
     * getGameDAte (private)
     * Formats game-date
     * @param {object} date - start date
     * @returns {string}
     */
    function getGameDate (date) {
        return gameIsToday(date) ? 'Today, ' + getTimeFormat(date) : getDateFormat(date) + ', ' + getTimeFormat(date);
    }

    /**
     * getSport (private)
     * Gets available sport or default
     * @param {string} sport - name of sport
     * @returns {string}
     */
    function getSport (sport) {
        return availableSports.indexOf(sport) > -1 ? sport : 'default';
    }

    /**
     * getTimeFormat (private)
     * Converts date object to formatted time
     * @param {object} date - start date
     * @returns {string}
     */
    function getTimeFormat (date) {
        var hours = date.getHours();
        var minutes =  date.getMinutes();
        var amOrPm = " AM";

        if (hours > 12) {
            hours = hours - 12;
            meridiem = ' PM'
        }
        else if (hours === 0) {
            hours = 12
        }
        if (minutes < 10) {
            minutes = "0" + minutes.toString()
        }

        return hours + ':' + minutes.toString() + amOrPm;
    }

    /**
     * getDateFormat (private)
     * Converts date object to formatted date
     * @param {object} date - start date
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
     * @param {object} date - start date
     * @returns {boolean}
     */
    function gameIsToday (date) {
        return new Date().getDate() === new Date(date).getDate();
    }

    /**
     * requestData (private)
     * Request game-data from Api
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
            var interval = setInterval(function () {
                var now = Date.now();
                var timeStamp = parseInt(window.localStorage.getItem('timeStamp'));

                if (liveEvents.length > 0) {
                    animateCards();
                }

                // request new live-data after two minutes
                if (now - timeStamp > 120000) {
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
     * offline(private)
     * Hides elements if no data
     * @returns {void}
     */
    function offline () {
        var sportsIcons = document.querySelectorAll('.sport-icon');
        var bettingButton = document.querySelectorAll('.betting-btn');
        var name = document.querySelectorAll('.name');

        for (var i = 0; i < sportsIcons.length; i++) {
            if (liveEvents.length === 0 || liveEvents === undefined) {
                sportsIcons[i].style.display = 'none';
                bettingButton[i].style.display = 'none';
                name[i].innerHAML = 'Sorry, no data available.';
            }
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
            markup +=
                '<div class="card">' +
                    '<span class="score">' + getGame(i).home + ' – ' + getGame(i).away + '</span>' +
                    '<div class="game">' +
                        '<img class="sport-icon" src="' + getGame(i).src() + '" alt="sport-icon" />' +
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
         * initializes application
         * @param {object} data - live-data
         * @returns {void}
         */
        start: function (data) {
            liveEvents = data.liveEvents;
            createAnimation();
            render();
            offline();
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
 * Api-request callback, cache data/timestamp
 * @param {object} data - live-data
 * @returns {void}
 */
var liveCallback = function (data) {
    window.localStorage.setItem('data', JSON.stringify(data));
    window.localStorage.setItem('timeStamp', Date.now());
    liveBetting.start(data);
};