function tabsInit(target) {
    layui.use('element', function () {
        var ids = [], element = layui.element;
        ids.id = 0;

        element.on('tab(' + target + ')', function(data){
            data.elem.find(".layui-tab-close").off("click").click(function() {
                publish('delTab', {id: data.elem.find('iframe').data("idx")});
            });
        });

        function getUrl(url) {
            return url + (url.indexOf('?') > 0 ? "&" : "?") + "_timemap=" + new Date().getTime();
        }

        subscribe([
            {
                sub: "addTab",
                func: function (ops) {
                    var idx = ops.id;
                    if (idx) {
                        if (ids.some(function (o) { return idx === o.id })) {
                            element.tabChange(target, idx);
                        } else {
                            var $iframe = $('<iframe id="iframe_' + (++ids.id) + '" scrolling="auto" height="100%" width="100%" frameborder="0" scrolling="no" allowtransparency="true" src="' + getUrl(ops.url) + '"></iframe>').data("idx", idx);
                            element.tabAdd(target, { id: idx, title: ops.title, content: $iframe }).tabChange(target, idx);
                            var win = $iframe[0].contentWindow;
                            win._params = ops.params;
                            publish("regeditWindow", win);
                            ids.push({ id: idx, win: win });
                        }
                       
                    }
                }
            },
            {
                sub: "delTab",
                func: function (ops) {
                    var idx = ops.id;
                    if (idx) {
                        var obj = ids.filter(function (o) { return idx === o.id })[0];
                        if (obj) {
                            var fwin = obj.win;
                            if (fwin.navigator.userAgent.indexOf("Chrome") > -1 || fwin.navigator.userAgent.indexOf("Firefox") > -1) {
                                var event = fwin.document.createEvent('HTMLEvents');
                                event.initEvent("unload", true, true);
                                event.eventType = 'm-sys-close';
                                fwin.document.dispatchEvent(event);
                            }
                            fwin.document.write('');
                            fwin.close();
                            element.tabDelete(target, idx);
                            ids = ids.filter(function (o) { return idx !== o.id });
                        }
                    }
                }
            }
        ]);
    });
}