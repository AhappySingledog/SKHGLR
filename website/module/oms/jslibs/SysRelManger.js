$(function () {
    $(document).bind("contextmenu", function (e) { return false; });//禁用右键菜单
    
    layui.use(['layer'], function (layer) {
        var params = window._tool.params;
        var idx = layer.msg('正在获取数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 });
        publish('getUserInfo').then(function (us) {
            Promise.all([
                publish('getDataX', { svn: 'OMS_SERVER', path: 'getSystems', data: { uid: us[0].USERID } }),
                publish('getDataX', { svn: 'OMS_SERVER', path: 'getSystemsByRole', data: { rid: params.rid, type: params.type } })
            ]).then(function (res) {
                var s1 = res[0][0], s2 = res[1][0];
                if (s1.code === "10000" && s1.code === "10000") refresh(s1.data.map(function (o) { return o.checked = s2.data.some(function(i) { return o.GID === i.GID; }), o; }));
                else layer.msg(s1.message || s2.message);
                layer.close(idx);
            });
        });

        function refresh(datas) {
            var $target = $("#sys").empty();

            datas.forEach(initItem);

            function initItem(data) {
                var $card = $('<div class="sys-card' + (data.checked ? ' card-select':'') + '"/>').appendTo($('<div class="sys-item"/>').appendTo($target));
                var $header = $('<div class="sys-card-hander"><span class="sys-title">' + data.SYSNAME + '</span></div>').appendTo($card);
                var $body = $('<div class="sys-card-body">').appendTo($card);
                $header.append($('<div class="' + (data.checked ? 'checked' : 'uncheck')+'"><span class="glyphicon glyphicon-ok"></span></div>').click(function () {
                    var $el = $(this), status = $el.is('.checked');
                    setSysPromise(data.GID, status ? 0 : 1).then(function() {
                        if (status) {
                            $el.removeClass().addClass("uncheck");
                            $card.removeClass('card-select');
                        } else {
                            $el.removeClass().addClass("checked");
                            $card.addClass('card-select');
                        }
                    });
                }));
                $body.append($('<div style="background-image: url(../images/sys/' + data.SYS + '.png);"></div>'));
            }
        }

        function setSysPromise(sid, zt) {
            idx = layer.msg('正在处理数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 });
            return publish('getDataX', { svn: 'OMS_SERVER', path: 'setSystems', data: { rid: params.rid, type: params.type, sys:sid, zt: zt } }).then(function (res) {
                layer.close(idx);
                layer.msg(res[0].message);
                return res[0].code === "10000";
            });
        }
    });
});