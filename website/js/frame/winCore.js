/*
 * by mei 系统核心 支持异步调用和消息通知
 */
define(["core/arbiter", "core/promise", "lodash"], function (ab, por, _) {
    var arb = ab.create(),
        addEvent = (function () {
            if (document.addEventListener) {
                return function (el, type, fn) {
                    if (el.length) {
                        for (var i = 0; i < el.length; i++) {
                            addEvent(el[i], type, fn);
                        }
                    } else {
                        el.addEventListener(type, fn, false);
                    }
                };
            } else {
                return function (el, type, fn) {
                    if (el.length) {
                        for (var i = 0; i < el.length; i++) {
                            addEvent(el[i], type, fn);
                        }
                    } else {
                        el.attachEvent('on' + type,
                            function () {
                                return fn.call(el, window.event);
                            });
                    }
                };
            }
        })(),
        res = function (win) {
            var subs = [];

            function addToken(token) {
                if (_.isArray(token))
                    subs = subs.concat(token);
                else
                    subs.push(token);
                return token;
            }

            function subscribe(sub) {
                return addToken(arb.subscribe(sub.topic || sub.sub, sub.func, sub.options || {}, sub.context || null));
            }

            function unsubscribe(token) {
                for (var i = 0; i < subs.length; i++) {
                    if (subs[i].id === token.id) {
                        arb.unsubscribe(subs[i]);
                        subs.splice(i, 1);
                        break;
                    }
                }
            }

            win.Promise = Promise;

            win.subscribe = function (data) {
                if (_.isArray(data)) {
                    var tokens = [];
                    for (var i = 0; i < data.length; i++) {
                        tokens.push(subscribe(data[i]));
                    }
                    return tokens;
                } else {
                    if ((data.hasOwnProperty("topic") || data.hasOwnProperty("sub")) && data.hasOwnProperty("func")) {
                        return subscribe(data);
                    }
                    return null;
                }
            };

            win.unsubscribe = function (token) {
                if (_.isArray(token)) {
                    for (var i = 0; i < token.length; i++) {
                        unsubscribe(token[i]);
                    }
                } else
                    unsubscribe(token);
            }

            win.publish = function (topic, data, options) {
                return arb.publish(topic, data, options);
            };

            addEvent(win, "unload", function () {
                for (var i = 0; i < subs.length; i++) {
                    arb.unsubscribe(subs[i]);
                }
                subs = [];
            });
        };
    arb.subscribe("regeditWindow", function (win) { res(win); });
    arb.subscribe("regeditWin", function (ops) { res(ops.win); });
    res(window);
});
