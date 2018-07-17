/*
 * by mei 系统框架
 */
define(["jquery", "lodash", "frame/regedit", "plugs/dialog/layer"], function ($, _) {
    (function () { //全局注入
        window.token = document.title;
        document.title = "蛇口海关录入系统";
        var topidx = -1,
            single = (function () {
                var items = [];

                function contain(id) { return _.some(function(obj) { return obj.id == id});}

                function add(id, idx) {
                    if (!contain(id, idx))
                        items.push({ id: id, idx: idx });
                }

                function del(idx) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].idx == idx) {
                            items.splice(i, 1);
                        }
                    }
                }

                function getIndex(id) {
                    var item = _.filter(function (obj) { return obj.id == id })[0];
                    return item && item.idx || -1;
                }

                return { contain: contain, getIndex: getIndex, add: add, del: del };
            })();

        function trydo(func) { if (typeof func == "function") try { func(); } catch (e) { } }

        function getDialogOption(obj) {
            var ds = $.extend({ width: 893, height: 600 }, obj);
            var option = {
                title: ds.title || "窗口",
                shadeClose: ds.shadeClose === true, //点击弹层外区域关闭
                shade: (ds.mask === true || (obj.params != null && obj.params.mask === true)) ? [0.2, '#393D49'] : (obj.params != null && obj.params.shade != null ? obj.params.shade : 0),
                maxmin: ds.maxmin != null ? ds.maxmin : (ds.maxable != null ? ds.maxable : false),
                area: [ ds.width + "px", ((obj.paddingHeight === true || (obj.params != null && obj.params.paddingHeight === true)) ? (ds.height + 33) : ds.height) + "px" ], //显示大小
                offset: ds.offset != null ? ds.offset : ($.isNumeric(ds.top) && $.isNumeric(ds.left) ? [ds.top + "px", ds.left + "px"] : "auto"), //偏移位置
                time: $.isNumeric(ds.time) ? ds.time : 0, //自动关闭事件
                end: function (idx) {
                    single.del(idx);
                    trydo(ds.onClose); //兼容老版本
                    trydo(ds.close); //兼容老版本
                    trydo(ds.closed); //兼容老版本
                },
                _tool: obj
            };
            if (obj.url)
                return $.extend(option, { type: 2, content: obj.url });
            else 
                return $.extend(option, { type: 1, content: obj.content });
        }

        publish("webAction", {svn: "login.jsp", data: {token: window.token}}).then(function(res){
            subscribe([
                {
                    sub:"getUserInfo",
                    func: function() {
                        return _.cloneDeep({USERID: res[0].user.usid, user: res[0].user, org: res[0].org});
                    }
                },
                {
                    sub:"getMenus",
                    func: function() {
                        return _.cloneDeep(res[0].menus);
                    }
                }
            ]);
        });

        subscribe([
            {
                sub: 'getDataX',//兼容老的订阅方式
                func: function (option) {
                    return publish('webAction', option).then(function (res) { return res[0]; }, function (res) { return res[0]; });
                }
            }, {
                sub: "showTopMsg",
                func: function (option) { topidx = layer.msg(option); }
            }, {
                sub: "closeTopMsg",
                func: function (option) { layer.close(option); }
            }, {
                sub: "showDialog",
                func: function (option) {
                    if (option.id && single.contain(option.id)) return;
                    if (option.id)
                        single.add(option.id, window.layer.open(getDialogOption(option)));
                }
            }, {
                sub: "closeDialog",
                func: function (id) {
                    var idx = single.getIndex(id);
                    if (idx > 0) layer.close(idx);
                    else {
                        idx = single.getIndex("dialog-" + id);
                        if (idx > 0) layer.close(idx);
                    }
                }
            }
        ]);
    })();

    var $iframe = $('<iframe scrolling="auto" frameborder="0" allowtransparency="true" src="./module/layout/html/index.html"></iframe>');
    $(document.body).append($iframe);
    publish("regeditWindow", $iframe[0].contentWindow);
});