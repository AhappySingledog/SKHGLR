$(function () {
    $(document).bind("contextmenu", function (e) { return false; });//禁用右键菜单

    $(".nav-tabs").on('click', 'a', function (e) { e.preventDefault(); $(this).tab('show'); });

    var params = window._tool.params, mc = new Mcookie();

    /**
     * 菜单文档对象
     * @param {any} data
     */
    function getMeuns(data) {
        var id = data.SYS,
            $box = $('<div class="mbox"/>'),
            $body = $('<div class="mbox_body"/>').appendTo($box),
            $footer = $('<div class="mbox_footer"/>').appendTo($box),
            $container = $('<div class="mcontainer"/>').appendTo($('<div/>').appendTo($body)),
            $meun = $('<div id="meun_' + id + '" class="ztree"></div>').appendTo($('<div style="overflow:auto; height:100%"/>').appendTo($('<div class="msider"/>').appendTo($container))),
            $form = $('<form id="form_' + id + '" class="layui-form" action=""/>').appendTo($('<div style="overflow:auto; height:100%"/>').appendTo($('<div class="mcontent"/>').appendTo($container))),
            $smeun = $('<a id="smeun_' + id + '" class="layui-btn layui-btn-small">全选菜单</a>').appendTo($footer),
            $nmeun = $('<a id="nmeun_' + id + '" class="layui-btn layui-btn-small">全消菜单</a>').appendTo($footer),
            $sfunc = $('<a id="sfunc_' + id + '" class="layui-btn layui-btn-small">全选功能</a>').appendTo($footer),
            $ufunc = $('<a id="ufunc_' + id + '" class="layui-btn layui-btn-small">全消功能</a>').appendTo($footer),
            $reset = $('<a id="reset_' + id + '" class="layui-btn layui-btn-small layui-btn-warm"> &nbsp;重 &nbsp;置 &nbsp;</a>').appendTo($footer),
            $Ok = $('<a id="ok_' + id + '" class="layui-btn layui-btn-small layui-btn-normal"> &nbsp;确 &nbsp;认 &nbsp;</a>').appendTo($footer);
        $form.append($('<div style="text-align: center;width:100%"><span style= "font-size:40px; color: lightsteelblue; height: 400px;line-height: 400px">请选择组织</span></div>'));
        return $box;
    }

    /**
     * 获取菜单数据
     * @param {any} id
     * @param {any} meuns
     */
    function initMeunTree(uid, id, meuns, rmeuns) {
        var layer = layui.layer,
            form = layui.form,
            cookie = mc.getCookie(id),
            cfg = { data: { key: { name: "MENUNAME", title: "MENUNAME" } }, callback: { onClick: treeClick, onCheck: treeCheck, onCollapse: onCollapse, onExpand: onExpand }, check: { enable: true } },
            ztree = $.fn.zTree.init($('#meun_' + id), cfg, getTree(getCheck(meuns, rmeuns), 'PARENTID', -1));
        $('#smeun_' + id).click(allMeuns);
        $('#nmeun_' + id).click(notMeuns);
        $('#sfunc_' + id).click(allFuncs);
        $('#ufunc_' + id).click(notFuncs);
        $('#reset_' + id).click(resetMeuns);
        $('#ok_' + id).click(setMeuns);

        function isChage(node) {
            var obj = node;
            isChage = function (data) {
                var val = data !== obj;
                return obj = data, val;
            }
            return true;
        }

        function initForm(rf, datas, disabled, title) {
            var $form = $('#form_' + id).attr("lay-filter", rf).addClass("layui-form").empty();
            if (datas.length > 0){
                datas.forEach(function (obj) {
                    $('<input style="margin: 4px" type="checkbox" ' + (obj.checked ? 'checked' : '') + ' rf="' + rf + '" name="like[' + obj.CODE + ']" title="' + obj.NAME + '" ' + disabled + '>').appendTo($('<div/>').appendTo($form));
                });
                form.render('checkbox', rf);
                $form.find('div>div').click(checkClick);
            } else $form.append($('<div style="text-align: center;width:100%"><span style= "font-size:40px; color: lightsteelblue; height: 400px;margin-top: 200px">' + title + '<br/>没有定义功能</span></div>'));

        }

        function checkClick() {
            var $check = $(this).prev();
            if ($check.attr('disabled') !== true) {
                cookie.setCheck($check.attr('rf'), $check[0].name, $check[0].checked);
            }
        }

        function onCollapse(event, treeId, treeNode) {
            meuns.filter(function (o) { return o.GID === treeNode.GID }).forEach(function (o) { o.open = false; });
        }

        function onExpand(event, treeId, treeNode) {
            meuns.filter(function(o) { return o.GID === treeNode.GID }).forEach(function(o) { o.open = true; });
        }

        function treeClick(event, treeId, treeNode) {
            if (isChage(treeNode)) {
                var tid = treeNode.GID,
                    rf = treeId + tid,
                    disabled = treeNode.checked ? '' : 'disabled';
                var data = cookie.getVal(rf);
                if (Array.isArray(data)) { initForm(rf, data, disabled, treeNode.MENUNAME); }
                else {
                    var idx = layer.msg('正在获取数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 });
                    Promise.all([
                        publish('getDataX', { svn: 'OMS_SERVER', path: 'getFuncs', data: { mid: tid, uid: uid } }),
                        publish('getDataX', { svn: 'OMS_SERVER', path: 'getFuncsBySupRole', data: { mid: tid, rid: params.rid, type: params.type } })
                    ]).then(function (res) {
                        var vals = getCheck(res[0][0].data, res[1][0].data);
                        initForm(rf, vals, disabled, treeNode.MENUNAME); cookie.setVal(rf, vals); layer.close(idx);
                    });
                }
            }
        }

        function treeCheck(event, treeId, treeNode) {
            var $form = $('[lay-filter=' + treeId + treeNode.GID + ']');
            if (treeNode.checked) {
                $form.find('input').attr('disabled', false);
                $form.find('div').removeClass('layui-checkbox-disbaled layui-disabled');
            } else {
                $form.find('input').attr('disabled', true);
                $form.find('div').addClass('layui-checkbox-disbaled layui-disabled');
            }
        }

        function getData(path, vals) {
            return { 
                svn: "OMS_SERVER",
                path: path,
                type: 'post',
                data: {
                    rid: params.rid,
                    type: params.type,
                    a: vals.filter(function (o) { return o.checked }).map(function (o) { return o.GID }).join(','),
                    d: vals.filter(function (o) { return !o.checked }).map(function (o) { return o.GID }).join(',')
                }
            }
        }

        function allMeuns() {
            ztree.checkAllNodes(true);
            var $form = $('#form_' + id);
            $form.find('input').attr('disabled', false);
            $form.find('div').removeClass('layui-checkbox-disbaled layui-disabled');

        }

        function notMeuns() {
            ztree.checkAllNodes(false);
            var $form = $('#form_' + id);
            $form.find('input').attr('disabled', true);
            $form.find('div').addClass('layui-checkbox-disbaled layui-disabled');
            
        }

        function allFuncs() {
            $('#form_' + id).find('input').filter(function () { return !this.checked }).next().trigger('click');
        }

        function notFuncs() {
            $('#form_' + id).find('input').filter(function () { return this.checked }).next().trigger('click');
        }

        function setMeuns() {
            var idx = layer.msg('正在处理数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 });
            Promise.all([
                publish("getDataX", getData('setMeunsByRole', ztree.getChangeCheckedNodes())),
                publish("getDataX", getData('setFuncsByRole', cookie.getChanges()))
            ]).then(function (res) {
                layer.close(idx);
                var dt1 = res[0][0], dt2 = res[1][0];
                if (dt1.code !== '10000' )
                    layer.msg(dt1.message);
                else if (dt2.code !== '10000')
                    layer.msg(dt2.message);
                else 
                    layer.msg("更新成功");
            });
        }

        function resetMeuns() {
            var idx = layer.msg('正在更新数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 }),
                rf = $('#form_' + id).attr("lay-filter");
            publish('getDataX', { svn: 'OMS_SERVER', path: 'getMeunsOfSysByRole', data: { rid: params.rid, type: params.type, sys: id } }).then(function (res) {
                ztree = $.fn.zTree.init($('#meun_' + id), cfg, getTree(getCheck(meuns, res[0].data), 'PARENTID', -1)); cookie.clear();
                if (rf) {//判断是否有表单内容，有就初始化，避免空加载
                    var tid = rf.substr(('meun_' + id).length),
                        ms = ztree.getNodes().filter(function (o) { return o.GID === tid });
                    Promise.all([
                        publish('getDataX', { svn: 'OMS_SERVER', path: 'getFuncs', data: { mid: tid, uid: uid } }),
                        publish('getDataX', { svn: 'OMS_SERVER', path: 'getFuncsBySupRole', data: { mid: tid, rid: params.rid, type: params.type } })
                    ]).then(function (datas) {
                        var vals = getCheck(datas[0][0].data, datas[1][0].data);
                        if (ms.length > 0) initForm(rf, vals, ms[0].checked ? '' : 'disabled', ms[0].MENUNAME);
                        cookie.setVal(rf, vals);
                        layer.close(idx);
                    });
                } else layer.close(idx);
            });
            
        }
    }

    /**
     * 获取数据权限数据
     * @param {any} $el
     * @param {any} uid
     * @param {any} data
     */
    function initData(uid, $el, data) {

        var layer = layui.layer;
        publish('getDataX', { svn: 'OMS_SERVER', path: 'getDatas', data: { uid: uid, did: data.GID } }).then(function (res) {
            var id = data.STLX, datas = res[0].data;
            data.SFDJ === "1" ? initTree(id, datas) : initChecks(id, datas);
        });

        function getItem() {
            var $box = $('<div class="mbox"/>').appendTo($el),
                $body = $('<div class="mbox_body"/>').appendTo($box),
                $footer = $('<div class="mbox_footer"/>').appendTo($box),
                $div = $('<div style="overflow:auto; height:100%"/>').appendTo($('<div style="border: 1px solid rgb(217, 217, 217);"/>').appendTo($body));
            return {
                $target: $div,
                $sall: $('<a class="layui-btn layui-btn-small">全选</a>').appendTo($footer),
                $nall: $('<a class="layui-btn layui-btn-small">全消</a>').appendTo($footer),
                $reset: $('<a class="layui-btn layui-btn-small layui-btn-warm"> &nbsp;重 &nbsp;置 &nbsp;</a>').appendTo($footer),
                $set: $('<a class="layui-btn layui-btn-small layui-btn-normal"> &nbsp;确 &nbsp;认 &nbsp;</a>').appendTo($footer)
            }
        }

        /**
         * 树类型核心代码逻辑
         * @param {any} id
         * @param {any} datas
         */
        function initTree(id, datas) {
            var ztree, item = getItem(),
                $tree = $('<div id="data_' + id + '" class="ztree"></div>').appendTo(item.$target),
                cfg = { data: { key: { name: data.XSZD, title: data.XSZD } }, check: { enable: true }, callback: { onCollapse: onCollapse, onExpand: onExpand } };
            init();

            item.$sall.click(function () { ztree.checkAllNodes(true); });

            item.$nall.click(function () { ztree.checkAllNodes(false);});

            item.$reset.click(function () { var idx = layer.msg('正在更新数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 }); init().then(function () { layer.close(idx);}); });

            item.$set.click(function () { if (ztree) setDataVal(ztree.getCheckedNodes(true).map(function(o) { return o.GID; }).join(",")); });

            function init() {
                return publish('getDataX', { svn: 'OMS_SERVER', path: 'getDatasByRole', data: { rid: params.rid, type: params.type, did: data.GID } }).then(function (res) {
                    ztree = $.fn.zTree.init($tree, cfg, expend(getTree(getCheck(datas, res[0].data), data.GLZD)));
                });
            }

            function expend(tree) {
                function exp(dt) {
                    if (dt.children && dt.children.length === 1) {
                        var child = dt.children[0];
                        child.open = true;
                        exp(child);
                    }
                    return dt;
                }

                return tree.length === 1 ? tree.map(function(obj) { return exp($.extend(obj, { open: true })); }) : tree;
            }

            function onCollapse(event, treeId, treeNode) {
                datas.filter(function (o) { return o.GID === treeNode.GID }).forEach(function (o) { o.open = false; });
            }

            function onExpand(event, treeId, treeNode) {
                datas.filter(function (o) { return o.GID === treeNode.GID }).forEach(function (o) { o.open = true; });
            }
        }

        /**
         * 表单型核心代码逻辑
         * @param {any} id
         * @param {any} datas
         */
        function initChecks(id, datas) {
            var lf = "lay-filter_data_" + id,
                form = layui.form,
                item = getItem(),
                $form = $('<form id="form_' + id + '" class="layui-form" action=""/>').attr("lay-filter", lf).addClass("layui-form").appendTo(item.$target);
            init();

            item.$sall.click(function () { $form.find('input').filter(function () { return !this.checked }).next().trigger('click'); });

            item.$nall.click(function () { $form.find('input').filter(function () { return this.checked }).next().trigger('click'); });
            
            item.$reset.click(function () { var idx = layer.msg('正在更新数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 }); init().then(function () { layer.close(idx);}); });

            item.$set.click(function () { setDataVal($form.find('input').filter(function () { return this.checked }).map(function () { return $(this).attr('gid'); }).toArray().join(','));});

            function init() {
                return publish('getDataX', { svn: 'OMS_SERVER', path: 'getDatasByRole', data: { rid: params.rid, type: params.type, did: data.GID } }).then(function (res) {
                    $form.empty();
                    var vals = res[0].data;
                    datas.forEach(function (obj) {
                        var checked = vals.some(function (o) { return o.GID === obj.GID }) ? 'checked' : '';
                        $('<input style="margin: 4px" type="checkbox" ' + checked + ' gid="' + obj.GID + '" name="like[' + obj.GID + ']" title="' + obj[data.XSZD] + '">').appendTo($('<div/>').appendTo($form));
                    });
                    form.render('checkbox', lf);
                });
            }
        }

        /**
         * 设置数据权限
         * @param {any} ids
         */
        function setDataVal(ids) {
            var idx = layer.msg('正在更新数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 });
            publish('getDataX', {
                svn: 'OMS_SERVER',
                type: 'post',
                path: 'setDatasByRole',
                data: { rid: params.rid, type: params.type, did: data.GID, dids: ids }
            }).then(function (res) { layer.msg(res[0].message); layer.close(idx); });
        }
    }

    /**
     * 分组操作
     * @param {any} datas
     * @param {any} key
     */
    function group(datas, key) {
        var vals = {};
        datas.forEach(function(data) {
            var gp = data[key];
            if (!vals[gp]) vals[gp] = [];
            vals[gp].push(data);
        });
        return vals;
    }

    /**
     * 选择状态
     * @param {any} objs1
     * @param {any} objs2
     */
    function getCheck(objs1, objs2) {
        return (objs1 || []).map(function (o) {
            var ck = (objs2 || []).some(function (t) { return t.GID === o.GID });
            return $.extend({ checked: ck, scheck: ck }, o);
        });
    }

    /**
     * 结构化树
     * @param {any} datas
     * @param {any} pkey
     * @param {any} pid
     */
    function getTree(datas, pkey, pid) {
        return (datas || []).filter(function (obj) { return obj[pkey] == pid }).map(function (item) {
            return item.children = getTree(datas, pkey, item.GID), item;
        });
    }

    /**
     * 缓存对象
     */
    function Mcookie() {
        var cookies = {};

        this.getCookie = function(sys) {
            return cookies[sys] || (cookies[sys] = new Titem());
        };

        function Titem() {
            var obj = {};
            this.clear = function () { obj = {} };
            this.getVal = function(key) {
                return obj[key];
            };
            this.getVals = function () {
                return Object.keys(obj).map(function(key) { return obj[key]; });
            };
            this.getChanges = function () {
                return Object.keys(obj).map(function (key) { return obj[key]; }).reduce(function(n, o) {return n.concat(o);}, []).filter(function (o) { return o.checked !== o.scheck});
            }
            this.setVal = function(key, val) {
                obj[key] = val;
            };
            this.setCheck = function (key, code, val) {
                var items = obj[key] || [];
                items.filter(function(x) { return 'like[' + x.CODE + ']' === code }).forEach(function(item) { item.checked = val; });
            }
        }
    }

    /**
     * 核心内容初始化
     */
    layui.use(['layer', 'form'], function (layer) {
        var idx = layer.msg('正在获取数据,请稍后。。。', { icon: 16, shade: 0.03, fixed: true, time: 0 });
        publish('getUserInfo').then(function (us) {
            var uid = us[0].USERID,
                data = { uid: uid },
                classes = [['active'], ['in active']],
                reqs = {
                    ROLE: [
                        { path: 'getMeuns', data: data },
                        { path: 'getMeunsByRole', data: params },
                        { path: 'getSystems', data: data },
                        { path: 'getDataDef', data: data }
                    ],
                    JOB: [
                        { path: 'getMeuns', data: data },
                        { path: 'getMeunsByRole', data: params },
                        { path: 'getSystemsByRole', data: params },
                        { path: 'getDataDef', data: data }
                    ]
                };

            function initMeunView(datas, mgroup, rgroup) {
                var $tab = $("#sysTab"), $panel = $("#sysPanel");
                datas.forEach(function (sys, i) {
                    var id = sys.SYS, name = sys.SYSNAME;
                    $('<li role="presentation" class="' + (classes[0][i] || '') + '"><a href="#' + id + '">' + name + '</a></li>').appendTo($tab);
                    $('<div role="tabpanel" class="tab-pane fade ' + (classes[1][i] || '') + '" id="' + id + '" style="height: 100%"/>').appendTo($panel).append(getMeuns(sys));
                    initMeunTree(uid, id, mgroup[id], rgroup[id]);
                });
            }

            function initDataView(datas) {
                var $tab = $("#dtTab"), $panel = $("#dtPanel");
                datas.forEach(function (dt, i) {
                    var id = dt.STLX, name = dt.LXMC;
                    $('<li role="presentation" class="' + (classes[0][i] || '') + '"><a href="#' + id + '">' + name + '</a></li>').appendTo($tab);
                    var $body = $('<div role="tabpanel" class="tab-pane fade ' + (classes[1][i] || '') + '" id="' + id + '" style="height: 100%"/>').appendTo($panel);
                    initData(uid, $body, dt);
                });
            }

            Promise.all(reqs.JOB.map(function (req) { return publish('getDataX', { svn: 'OMS_SERVER', path: req.path, data: req.data })})).then(function (res) {
                var mdata = res[0][0], rdata = res[1][0], sdata = res[2][0], ddata = res[3][0];
                if (mdata.code === "10000" && sdata.code === "10000") initMeunView(sdata.data, group(mdata.data, "SYS"), group(rdata.data, "SYS"));
                else layer.msg(mdata.message || sdata.message);
                if (ddata.code === "10000") initDataView(ddata.data);
                else layer.msg(ddata);
                layer.close(idx);
            });
        });
    });
})