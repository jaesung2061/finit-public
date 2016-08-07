(function (w) {
    "use strict";

    /**
     *
     * @returns {string}
     */
    String.prototype.capitalizeFirstLetter = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    /**
     *
     * @param obj
     * @returns {String}
     */
    String.prototype.replaceAll = function (obj) {
        var retStr = this;
        for (var key in obj) {
            retStr = retStr.replace(new RegExp(key, 'g'), obj[key]);
        }
        return retStr;
    };

    /**
     * Register observer callback
     *
     * @param service
     * @param callback
     */
    w.registerObserver = function registerObserver(service, callback) {
        if (!service.observers) {
            service.observers = [];
        }

        service.observers.push(callback);
    };

    /**
     * Execute observer callbacks
     *
     * @param observers
     * @param data
     */
    w.notifyObservers = function notifyObservers(observers, data) {
        var length = observers.length;

        for (var i = 0; i < length; i++) {
            observers[i](data);
        }
    };

    /**
     * Check if numeric
     *
     * @param number
     * @returns {boolean}
     */
    w.isNumeric = function isNumeric(number) {
        return !isNaN(parseFloat(number)) && isFinite(number);
    };

    /**
     * Opposite of jQuery param
     *
     * @param params
     * @param coerce
     * @returns {{}}
     */
    w.deparam = function deparam(params, coerce) {
        var obj = {},
            coerce_types = {'true': !0, 'false': !1, 'null': null};

        // Iterate over all name=value pairs.
        params.replace(/\+/g, ' ').split('&').forEach(function (v) {
            var param = v.split('='),
                key = decodeURIComponent(param[0]),
                val,
                cur = obj,
                i = 0,

            // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
            // into its component parts.
                keys = key.split(']['),
                keys_last = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                // Remove the trailing ] from the last keys part.
                keys[keys_last] = keys[keys_last].replace(/\]$/, '');

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat(keys);

                keys_last = keys.length - 1;
            } else {
                // Basic 'foo' style key.
                keys_last = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if (param.length === 2) {
                val = decodeURIComponent(param[1]);

                // Coerce values.
                if (coerce) {
                    val = val && !isNaN(val) && ((+val + '') === val) ? +val        // number
                        : val === 'undefined' ? undefined         // undefined
                        : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                        : val;                                                          // string
                }

                if (keys_last) {
                    // Complex key, build deep object structure based on a few rules:
                    // * The 'cur' pointer starts at the object top-level.
                    // * [] = array push (n is set to array length), [n] = array if n is
                    //   numeric, otherwise object.
                    // * If at the last keys part, set the value.
                    // * For each keys part, if the current level is undefined create an
                    //   object or array based on the type of the next keys part.
                    // * Move the 'cur' pointer to the next level.
                    // * Rinse & repeat.
                    for (; i <= keys_last; i++) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur = cur[key] = i < keys_last ? cur[key] || ( keys[i + 1] && isNaN(keys[i + 1]) ? {} : [] ) : val;
                    }

                } else {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.

                    if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
                        // val is already an array, so push on the next value.
                        obj[key].push(val);

                    } else if ({}.hasOwnProperty.call(obj, key)) {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [obj[key], val];

                    } else {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }

            } else if (key) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce ? undefined : '';
            }
        });

        return obj;
    };

    /**
     * Convert base64/URLEncoded data component
     * to raw binary data held in a string
     *
     * @param dataURI
     * @returns {*}
     */
    w.dataURItoBlob = function dataURItoBlob(dataURI) {
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = decodeURI(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type: mimeString});
    };

    /**
     * For use with file upload
     *
     * @param $scope
     * @param FileReaderService
     * @returns {Function}
     */
    w.buildOnFileSelectFunction = function ($scope, FileReaderService) {
        return function ($files) {
            if ($files && $files.length > 0) {
                FileReaderService.readAsDataUrl($files[0], $scope).then(function (result) {
                    $scope.cropOptions.sourceImage = result;
                    $scope.cropperReady = true;
                });
            }
        };
    };

    /**
     * Scroll to given position
     *
     * @param position
     */
    w.scrollTo = function (position) {
        angular.element('.wrapper').animate({scrollTop: position || 0}, 'fast');
    };

    /**
     * Escape string for use with regex
     */
    w.escapeRegExp = (function () {
        var regex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

        return function (str) {
            return str.replace(regex, "\\$&");
        }
    })();

    /**
     * Escape html
     */
    w.escapeHtml = (function () {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return function (str) {
            return str.replace(/[&<>"']/g, function (m) {
                return map[m];
            });
        }
    })();

    /**
     * Replace text smily's and stuff to emoticons
     *
     * @param message
     * @returns {string}
     */
    w.parseEmoji = function (message) {
        return emoji.replace_unified(emoji.replace_colons(emoji.replace_emoticons(message)));
    };

    /**
     * Turn '#{STRING}` to links to chat
     *
     * @param message
     * @returns {*}
     */
    w.parseHashtags = (function () {
        var hashtagRegex = /(^|\s)#[a-zA-Z0-9]+\b/g;

        return function (message) {
            var hashtags = message.match(hashtagRegex);
            var messageContainsHashtag = hashtagRegex.test(message);
            var replace = {};
            var parsed;

            if (messageContainsHashtag) {
                for (var i = 0; i < hashtags.length; i++) {
                    // HTML escaped single quote is #039 and that is causing a conflict with this
                    // So #039 won't turn into hashtag link
                    if (hashtags[i] !== '#039') {
                        replace[hashtags[i]] = '<a href="/chat/' + hashtags[i].replace('#', '').trim() + '">' + hashtags[i] + '</a>';
                    }
                }
                parsed = message.replaceAll(replace);
            }

            return parsed || message;
        };
    })();

    /**
     * Parse reddit subs
     *
     * @returns {string}
     */
    w.parseReddits = (function () {
        var regex = /(?:\s|^)(\/?r\/[a-zA-Z0-9-_]+)\/?/g;

        return function (message) {
            var matches = message.match(regex);
            var replace = {};
            var parsed, linkified;

            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    linkified = '<a href="https://reddit.com/' + matches[i].trim() + '" target="_blank">' + matches[i] + '</a>';
                    replace[matches[i]] = linkified.replace('m//', 'm/');
                }
                parsed = message.replaceAll(replace);
            }

            return parsed || message;
        };
    })();

    /**
     * Parse bold, italics and strike through
     */
    w.parseMarkdown = (function () {
        var boldRegex = new RegExp('(?:\\s|^)\\*\\*.*\\*\\*', 'ig');
        var italicsRegex = new RegExp('(?:\\s|^)\\*.*\\*', 'ig');
        var strikeThroughRegex = new RegExp('(?:\\s|^)`.*`', 'ig');

        return function (message) {
            var parsed = message;
            var boldMatches = message.match(boldRegex);
            var italicsMatches = message.match(italicsRegex);
            var strikeThroughMatches = message.match(strikeThroughRegex);
            var replace, i;

            if (boldMatches) {
                replace = {};
                for (i = 0; i < boldMatches.length; i++) {
                    replace[escapeRegExp(boldMatches[i].trim())] = '<b>' + boldMatches[i].replaceAll({'\\*': ''}).trim() + '</b>';
                }
                parsed = parsed.replaceAll(replace);
            }

            if (italicsMatches) {
                replace = {};
                for (i = 0; i < italicsMatches.length; i++) {
                    replace[escapeRegExp(italicsMatches[i].trim())] = '<i>' + italicsMatches[i].replaceAll({'\\*': ''}).trim() + '</i>';
                }
                parsed = parsed.replaceAll(replace);
            }

            if (strikeThroughMatches) {
                replace = {};
                for (i = 0; i < strikeThroughMatches.length; i++) {
                    replace[escapeRegExp(strikeThroughMatches[i].trim())] = '<strike>' + strikeThroughMatches[i].replaceAll({'`': ''}).trim() + '</strike>';
                }
                parsed = parsed.replaceAll(replace);
            }

            return parsed;
        }
    })();

    /**
     * Wrapper to reduce lines of code on try/catch blocks.
     * I hate seeing empty catch blocks so... Out of sight,
     * out of mind.
     *
     * @param tryFunc
     * @param catchFunc
     */
    w.tryCatch = function (tryFunc, catchFunc) {
        try {
            tryFunc();
        } catch (e) {
            if (catchFunc)
                catchFunc(e);
        }
    };

    /**
     * Converts snake_case to camelCase.
     * Also there is special case for Moz prefix starting with upper case letter.
     *
     * @param name Name to normalize
     */
    w.camelCase = function (name) {
        var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
        var MOZ_HACK_REGEXP = /^moz([A-Z])/;

        return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        }).replace(MOZ_HACK_REGEXP, 'Moz$1');
    };

    /**
     * Make a copy of the object
     *
     * @param obj
     * @returns {*}
     */
    w.clone = function (obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    };

    /**
     * Linkify
     */
    w.linkify = (function () {
        var
            SCHEME = "[a-z\\d.-]+://",
            IPV4 = "(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",
            HOSTNAME = "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",
            TLD = "(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)",
            HOST_OR_IP = "(?:" + HOSTNAME + TLD + "|" + IPV4 + ")",
            PATH = "(?:[;/][^#?<>\\s]*)?",
            QUERY_FRAG = "(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",
            URI1 = "\\b" + SCHEME + "[^<>\\s]+",
            URI2 = "\\b" + HOST_OR_IP + PATH + QUERY_FRAG + "(?!\\w)",

            MAILTO = "mailto:",
            EMAIL = "(?:" + MAILTO + ")?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@" + HOST_OR_IP + QUERY_FRAG + "(?!\\w)",

            URI_RE = new RegExp("(?:" + URI1 + "|" + URI2 + "|" + EMAIL + ")", "ig"),
            SCHEME_RE = new RegExp("^" + SCHEME, "i"),

            quotes = {
                "'": "`",
                '>': '<',
                ')': '(',
                ']': '[',
                '}': '{',
                'Â»': 'Â«',
                'â€º': 'â€¹'
            },

            default_options = {
                callback: function (text, href) {
                    return href ? '<a href="' + href + '" title="' + href + '">' + text + '<\/a>' : text;
                },
                punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
            };

        return function (txt, options) {
            options = options || {};

            // Temp variables.
            var arr,
                i,
                link,
                href,

            // Output HTML.
                html = '',

            // Store text / link parts, in order, for re-combination.
                parts = [],

            // Used for keeping track of indices in the text.
                idx_prev,
                idx_last,
                idx,
                link_last,

            // Used for trimming trailing punctuation and quotes from links.
                matches_begin,
                matches_end,
                quote_begin,
                quote_end;

            // Initialize options.
            for (i in default_options) {
                if (options[i] === undefined) {
                    options[i] = default_options[i];
                }
            }

            // Find links.
            while (arr = URI_RE.exec(txt)) {

                link = arr[0];
                idx_last = URI_RE.lastIndex;
                idx = idx_last - link.length;

                // Not a link if preceded by certain characters.
                if (/[\/:]/.test(txt.charAt(idx - 1))) {
                    continue;
                }

                // Trim trailing punctuation.
                do {
                    // If no changes are made, we don't want to loop forever!
                    link_last = link;

                    quote_end = link.substr(-1);
                    quote_begin = quotes[quote_end];

                    // Ending quote character?
                    if (quote_begin) {
                        matches_begin = link.match(new RegExp('\\' + quote_begin + '(?!$)', 'g'));
                        matches_end = link.match(new RegExp('\\' + quote_end, 'g'));

                        // If quotes are unbalanced, remove trailing quote character.
                        if (( matches_begin ? matches_begin.length : 0 ) < ( matches_end ? matches_end.length : 0 )) {
                            link = link.substr(0, link.length - 1);
                            idx_last--;
                        }
                    }

                    // Ending non-quote punctuation character?
                    if (options.punct_regexp) {
                        link = link.replace(options.punct_regexp, function (a) {
                            idx_last -= a.length;
                            return '';
                        });
                    }
                } while (link.length && link !== link_last);

                href = link;

                // Add appropriate protocol to naked links.
                if (!SCHEME_RE.test(href)) {
                    href = ( href.indexOf('@') !== -1 ? ( !href.indexOf(MAILTO) ? '' : MAILTO )
                            : !href.indexOf('irc.') ? 'irc://'
                            : !href.indexOf('ftp.') ? 'ftp://'
                            : 'http://' )
                        + href;
                }

                // Push preceding non-link text onto the array.
                if (idx_prev != idx) {
                    parts.push([txt.slice(idx_prev, idx)]);
                    idx_prev = idx_last;
                }

                // Push massaged link onto the array
                parts.push([link, href]);
            }

            // Push remaining non-link text onto the array.
            parts.push([txt.substr(idx_prev)]);

            // Process the array items.
            for (i = 0; i < parts.length; i++) {
                html += options.callback.apply(window, parts[i]);
            }

            // In case of catastrophic failure, return the original text;
            return html || txt;
        };

    })();

    /**
     * Test server response time
     */
    w.pingTest = function () {
        var t0 = performance.now();
        $.get('/api/pingtest', null, function (data) {
            var t1 = performance.now();
            console.log("Call took " + (t1 - t0) + " milliseconds.");
            console.log(data);
        })
    }

})(window);