$(function () {
    $(document).bind("contextmenu", function (e) { return false; });//禁用右键菜单

    $(".nav-tabs").on('click', 'a', function (e) { e.preventDefault(); $(this).tab('show'); });

    var params = window._tool.params,
        size = 60,
        jn = 'NAME',
        jnt1 = '标准岗位名称',
        jnt2 = '岗位分类名称',
        jn1 = 'FLD1',
        jn2 = 'FLD2';

    function getValue(data) {
        if (data.lx == 0) {
            data.icon = "../images/tree/partment.png";
            data.iconOpen = "../images/tree/partment.png";
            data.iconClose = "../images/tree/partment1.png";
        } else {
            data.icon = "../images/tree/bm.png";
            data.iconOpen = "../images/tree/bm.png";
            data.iconClose = "../images/tree/bm1.png";
        }
        (data.children || []).forEach(getValue);
        return data;
    }

    function getTreeData(data) {

        function expend(dt) {
            if (dt.children && dt.children.length === 1) {
                var child = dt.children[0];
                child.open = true;
                expend(child);
            }
            return dt;
        }

        var td = $.extend(getValue(data), {
            open: true,
            icon: '../images/tree/building.png',
            iconOpen: '../images/tree/building.png',
            iconClose: '../images/tree/building1.png'
        });
        return [expend(td)];
    }

    function openAttr(param) {
        publish("showDialog",
            {
                id: 'ROLE_ATTR',
                title: '查看属性',
                width: 800,
                height: 400,
                url: "module/oms/htmls/Element.html",
                minable: false,
                maxable: false,
                mask: true,
                params: param,
                closeable: true
            });
    }

    function refRights(param) {
        publish("showDialog",
            {
                id: 'RIGHTS',
                title: "功能权限管理",
                url: "module/oms/htmls/RightsManager.html",
                width: 1042,
                height: 602,
                minable: false,
                maxable: false,
                mask: true,
                params: param,
                closeable: true
            });
    }

    function updateJob(datas) {
        var css = "card-select", $target = $('#jobcard').empty();

        if (datas.length > 0)
            datas.forEach(initItem);
        else
            $target.append($('<div style="text-align: center;width:100%"><span style="font-size:40px; color: lightsteelblue; height: 400px;line-height: 400px">未定义岗位</span></div>'));

        function initItem(data) {
            var $item = $('<div class="card-item" style="width:20%"/>').appendTo($target);
            var $card = $('<div class="card ' + (data.CHECKED === "1" ? css : '') + '"/>').appendTo($item);
            var $header = $('<div class="card-header"/>').appendTo($card);
            var $body = $('<div class="card-body"/>').appendTo($card);
            var $footer = $('<div class="card-footer"/>').appendTo($card);
            var $check = $('<input type="checkbox" style="outline:none" ' + (data.CHECKED === "1" ? 'checked' : '') + '/>').click(function () {
                var that = this,layer = layui.layer, idx = layer.msg('数据请求中', { icon: 16, shade: 0.03, fixed: true, time: 0 });
                publish("getDataX", {
                    svn: "OMS_SERVER",
                    path: that.checked ? 'setUserOfOnlyRole' : 'removeUserOfRole',
                    data: { rid: data.GID, type: "JOB", uid: params.USID }
                }).then(function(res) {
                    layer.close(idx);
                    layer.msg(res[0].message);
                    if (res[0].code === "10000") {
                        if (that.checked) {
                            $('.card').removeClass(css);
                            $('.card-header>input').each(function(i, o) { o.checked = false; });
                            $card.addClass(css);
                            that.checked = true;
                        } else $card.removeClass(css);
                    }
                    else that.checked = !that.checked;
                });
            });
            $header.append($('<span style="font-size: 16px;white-space:nowrap">' + (data[jn] || "") + '</span>'));
            $header.append($check);
            $body.html('<table><tbody><tr><td style="font-weight:bold;width: 100px;">' + jnt1 + '：</td><td>' + (data[jn1] || "") + '</td></tr><tr><td style="font-weight:bold;width: 100px">' + jnt2 + '：</td><td>' + (data[jn2] || "") + '</td></tr></tbody ></table >');
            $footer.append($('<a>属性</a>').click(function () { openAttr({ tname: JobRefView, render: { enable: false }, where: 'gid=' + data.GID })}));
            $footer.append($('<a>权限</a>').click(function () { refRights({ rid: data.GID, type: "JOB" }) }));
        }
    }

    function updateSrole(datas) {
        var css = "card-select", $target = $('#rcard').empty();

        if (datas.length > 0)
            datas.forEach(initItem);
        else
            $target.append($('<div style="text-align: center;width:100%"><span style="font-size:40px; color: lightsteelblue; height: 400px;line-height: 400px">未选择角色</span></div>'));

        function initItem(data) {
            var $item = $('<div class="card-item" style="width:20%"/>').appendTo($target);
            var $card = $('<div class="card ' + css + '"/>').appendTo($item);
            var $header = $('<div class="card-header"/>').appendTo($card);
            var $body = $('<div class="card-body"/>').appendTo($card);
            var $footer = $('<div class="card-footer"/>').appendTo($card);
            var $check = $('<input type="checkbox" style="outline:none" checked />').click(function () {
                var that = this, layer = layui.layer, idx = layer.msg('数据请求中', { icon: 16, shade: 0.03, fixed: true, time: 0 });
                publish("getDataX", {
                    svn: "OMS_SERVER",
                    path: 'removeUserOfRole',
                    data: { rid: data.GID, type: "ROLE", uid: params.USID }
                }).then(function (res) {
                    layer.close(idx); layer.msg(res[0].message);
                    if (res[0].code === "10000") {
                        $item.remove();
                        publish('refreshRole');
                        if ($target.children().length < 1) {
                            $target.append($('<div style="text-align: center;width:100%"><span style="font-size:40px; color: lightsteelblue; height: 400px;line-height: 400px">未选择角色</span></div>'));
                            layui.laypage.render({ elem: 'rpg', curr: 1, limit: size, count: 0, layout: ['count', 'prev', 'page', 'next', 'skip']});
                        }
                    }
                    else that.checked = true;
                });
            });
            $header.append($('<span style="font-size: 16px;white-space:nowrap">' + data.NAME + '</span>'));
            $header.append($check);
            $body.html('<table><tbody><tr><td><span style="font-weight:bold">角色代码：</span></td><td>' + (data.CODE || "") + '</td></tr><tr><td><span style="font-weight:bold">组织编码：</span></td><td>' + (data.ORGCODE || "") + '</td></tr></tbody ></table >');
            $footer.append($('<a>属性</a>').click(function () { openAttr({ tname: RoleRefView, render: { enable: false }, where: 'GID=' + data.GID, cfg: { width: { REMARK: '100%' } } }) }));
            $footer.append($('<a>权限</a>').click(function () { refRights({ rid: data.GID, type: "ROLE" }) }));
        }
    }
    
    function updateRole(datas) {
        var css = "card-select", $target = $('#rolecard').empty();

        datas.forEach(initItem);

        function initItem(data) {
            var $item = $('<div class="card-item"/>').appendTo($target);
            var $card = $('<div class="card ' + (data.CHECKED === "1" ? css : '')  +'"/>').appendTo($item);
            var $header = $('<div class="card-header"/>').appendTo($card);
            var $body = $('<div class="card-body"/>').appendTo($card);
            var $footer = $('<div class="card-footer"/>').appendTo($card);
            var $check = $('<input type="checkbox" style="outline:none" ' + (data.CHECKED === "1" ? 'checked' : '') + '/>').click(function () {
                var that = this, layer = layui.layer, idx = layer.msg('数据请求中', { icon: 16, shade: 0.03, fixed: true, time: 0 });
                return publish("getDataX", {
                    svn: "OMS_SERVER",
                    path: that.checked ? 'setUserOfRole' : 'removeUserOfRole',
                    data: { rid: data.GID, type: "ROLE", uid: params.USID }
                }).then(function(res) {
                    layer.close(idx); layer.msg(res[0].message);
                    if (res[0].code === "10000") {
                        that.checked ? $card.addClass(css) : $card.removeClass(css);
                        publish('refreshSrole');
                    }
                    else that.checked = !that.checked;
                });
            });
            $header.append($('<span style="font-size: 16px;white-space:nowrap">' + data.NAME + '</span>'));
            $header.append($check);
            $body.html('<table><tbody><tr><td><span style="font-weight:bold">角色代码：</span></td><td>' + (data.CODE || "") + '</td></tr><tr><td><span style="font-weight:bold">组织编码：</span></td><td>' + (data.ORGCODE || "") + '</td></tr></tbody ></table >');
            $footer.append($('<a>属性</a>').click(function () { openAttr({ tname: 'O_ROLE_EX', render: { enable: false }, where: 'GID=' + data.GID, cfg: { width: { REMARK: '100%' }}}) }));
            $footer.append($('<a>权限</a>').click(function () { refRights({ rid: data.GID, type: "ROLE" }) }));
        }
    }

    layui.use(['laypage', 'layer'], function (laypage, layer) {
        var spg = 1, rpg = 1, oid = 0, uid;

        layer.msg('数据请求中', { icon: 16, shade: 0.03, fixed: true, time: 0 });
        publish('getUserInfo').then(function (us) {
            publish("getDataX", { svn: "OMS_SERVER", path: "getOrganizeTree", data: { uid: uid = us[0].USERID } }).then(function (res) {
                jobGopage(1);
                sRoleGopage(1);
                var cfg = { data: { key: { name: "title", title: "title" } }, callback: { onClick: treeClick } };
                $.fn.zTree.init($("#orgtree"), cfg, getTreeData(res[0].data));
            });
        });

        function jobGopage(pg) {
            var idx = layer.msg('正在获取数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 }),
                data = { uid: params.USID, type: 'JOB', where: 'ORGID = ' + params.ORGID, page: pg, size: size };
            publish('getDataX', { svn: 'OMS_SERVER', path: 'getRefRoles', data: data }).then(function (res) {
                if (res[0].code === "10000") {
                    var vals = res[0].data;
                    updateJob(vals.datas);
                    laypage.render({ elem: 'jobpg', curr: vals.page, limit: vals.size, count: vals.count, layout: ['count', 'prev', 'page', 'next', 'skip'], jump: function (obj, first) { if (!(first || pg === obj.curr)) jobGopage(obj.curr); } });
                }
                layer.close(idx);
            });
        }

        function sRoleGopage(pg) {
            spg = pg;
            var idx = layer.msg('正在获取数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 }),
                data = { uid: uid, sid: params.USID, type: 'ROLE', page: pg, size: size };
            publish('getDataX', { svn: 'OMS_SERVER', path: 'getSrefRoles', data: data }).then(function (res) {
                if (res[0].code === "10000") {
                    var vals = res[0].data;
                    updateSrole(vals.datas);
                    laypage.render({ elem: 'rpg', curr: vals.page, limit: vals.size, count: vals.count, layout: ['count', 'prev', 'page', 'next', 'skip'], jump: function (obj, first) { if (!(first || pg === obj.curr)) sRoleGopage(obj.curr); } });
                }
                layer.close(idx);
            });
        }

        function roleGopage(pg, lxid) {
            rpg = pg, oid = lxid;
            var idx = layer.msg('正在获取数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 }),
                data = { uid: params.USID, type: 'ROLE', where: 'rid =' + lxid, page: pg, size: size };
            publish('getDataX', { svn: 'OMS_SERVER', path: 'getRefRoles', data: data }).then(function (res) {
                if (res[0].code === "10000") {
                    var vals = res[0].data;
                    updateRole(vals.datas);
                    laypage.render({ elem: 'rolepg', curr: vals.page, limit: vals.size, count: vals.count, layout: ['count', 'prev', 'page', 'next', 'skip'], jump: function (obj, first) { if (!(first || pg === obj.curr)) roleGopage(obj.curr, lxid); } });
                }
                layer.close(idx);
            });
        }

        function isChage(node) {
            var obj = node;
            isChage = function (data) {
                var val = data !== obj;
                return obj = data, val;
            }
            return true;
        }

        function treeClick(event, treeId, treeNode) {
            //if (isChage(treeNode)) roleGopage(1, treeNode.lxid * treeNode.vaild);
            if (isChage(treeNode)) roleGopage(1, treeNode.lxid);
        }

        subscribe({ sub: 'refreshRole', func: function () { roleGopage(rpg, oid); } });
        subscribe({ sub: 'refreshSrole', func: function () { sRoleGopage(spg); } });
    });
});