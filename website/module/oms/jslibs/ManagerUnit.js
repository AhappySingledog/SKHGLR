$(function () {
    var ogn = 'NAME', un = 'TRUENAME', jn = 'NAME';

    /**
     * 返回结果
     * @param {any} res
     */
    function result(res) {
        return { success: res.code === "10000", message: res.message }
    }

    /**
     * 打开对话框
     * @param {any} id
     * @param {any} title
     * @param {any} param
     * @param {any} wd
     */
    function openDialog(id, title, param, wd) {
        publish("showDialog",
            {
                id: id,
                title: title,
                width: wd || 800,
                height: 400,
                url: "module/oms/htmls/Element.html",
                minable: false,
                maxable: false,
                mask: true,
                params: param,
                closeable: true
            });
    }

    /**
     * 修改用户信息
     * @param {any} data
     */
    function updateUser(data) {
        var param = {
            tname: UeserRefView,
            render: { enable: true, left: 150 },
            cfg: { edite: { } },
            cols: 2, //显示每行显示4个字段
            token: 'updateUserTable',
            where: 'gid=' + data.GID
        };
        openDialog(UeserRefView, "人员信息修改：" + (data[un] || ''), param,  600);
    }
    
    /**
     * 关联权限
     * @param {any} data
     */
    function relevance(data) {
        publish("showDialog",
            {
                id: 'relevance-' + data.OID,
                title: '关联权限',
                width: 1042,
                height: 590,
                url: "module/oms/htmls/Relational.html",
                minable: false,
                maxable: false,
                mask: true,
                params: data,
                closeable: true
            });
    }

    /**
     * 重置密码
     * @param {any} data
     */
    function resetPw(data) {
        var layer = layui.layer;
        layer.confirm('确认要重置用户【' + data[un] + '】密码?', { icon: 3, title: '重置确认' }, function (index) {
            layer.close(index);
            var idx = layer.msg('正在处理数据，请稍后', { icon: 16, shade: 0.03, fixed: true, time: 0 });
            publish('getDataX', { svn: 'OMS_SERVER', path: 'ResetUserPw', data: { objid: data.USID } }).then(function (res) {
                layer.close(idx);
                layer.msg(res[0].message);
            });
        });
    }

    /**
     * 删除用户
     * @param {any} data
     */
    function deleteUser(data) {
        var layer = layui.layer;
        layer.confirm('确认要删除用户【' + (data[un] || '') + '】?', { icon: 2, title: '删除确认' }, function (index) {
            layer.close(index);
            var idx = layer.msg('正在处理数据，请稍后', { icon: 16, shade: 0.03, fixed: true, time: 0 });
            publish('getDataX', { svn: 'OMS_SERVER', path: 'deleteUser', data: { uid: data.USID } }).then(function(res) {
                var msg = result(res[0]); layer.close(idx); layer.msg(msg.message);
                if (msg.success) publish('updateUserTable');
            });
        });
    }

    /**
     * 修改角色
     * @param {any} data
     */
    function updateRole(data) {
        var param = {
            tname: RoleRefView,
            render: { enable: true },
            cfg: { width: { REMARK: '100%' }, edite: { ORGNAME: false } },
            token: 'updateRoleTable',
            where: 'gid=' + data.GID
        };
        openDialog(RoleRefView, "角色修改：" + data.NAME, param, 600);
    }

    /**
     * 权限管理
     * @param {any} data
     */
    function roleRights(data) {
        publish("showDialog",
            {
                id: 'rights',
                title: "功能权限管理",
                url: "module/oms/htmls/RightsManager.html",
                width: 1042,
                height: 602,
                minable: false,
                maxable: false,
                mask: true,
                params: { rid: data.GID, type: "ROLE" },
                closeable: true
            });
    }

    /**
     * 删除操作
     * @param {any} data
     */
    function deleteRole(data) {
        var layer = layui.layer;
        layer.confirm('确认要删除角色【' + data.NAME + '】?', { icon: 2, title: '删除确认' }, function (index) {
            layer.close(index);
            var idx = layer.msg('正在处理数据，请稍后', { icon: 16, shade: 0.03, fixed: true, time: 0 });
            publish('getDataX', { svn: 'OMS_SERVER', path: 'deleteRole', data: { rid: data.GID, type: "ROLE" } }).then(function (res) {
                var msg = result(res[0]); layer.close(idx); layer.msg(msg.message);
                if (msg.success) publish('updateRoleTable');
            });
        });
    }

    /**
     * 关联系统
     */
    function rRefSys(data) {
        publish("showDialog",
            {
                id: 'rights-' + data.GID,
                title: "关联系统",
                url: "module/oms/htmls/SysRelManger.html",
                width: 720,
                height: 480,
                minable: false,
                maxable: false,
                mask: true,
                params: { rid: data.GID, type: "ROLE" },
                closeable: true
            });
    }

    /**
     * 修改岗位
     * @param {any} data
     */
    function updateJob(data) {
        var param = {
            tname: JobRefView,
            render: { enable: true },
            token: 'updateGwTable',
            where: 'gid=' + data.GID
        };
        openDialog(JobRefView, "岗位修改：" + data[jn], param, 600);
    }

    /**
     * 权限管理
     * @param {any} data
     */
    function jobRights(data) {
        publish("showDialog",
            {
                id: 'rights-' + data.OID,
                title: "功能权限管理",
                url: "module/oms/htmls/RightsManager.html",
                width: 1042,
                height: 602,
                minable: false,
                maxable: false,
                mask: true,
                params: {rid: data.GID, type: "JOB"},
                closeable: true
            });
    }

    /**
     * 删除操作
     * @param {any} data
     */
    function deleteJob(data) {
        var layer = layui.layer;
        layer.confirm('确认要删除岗位【' + data[jn] + '】?', { icon: 2, title: '删除确认' }, function (index) {
            layer.close(index);
            var idx = layer.msg('正在处理数据，请稍后', { icon: 16, shade: 0.03, fixed: true, time: 0 });
            publish('getDataX', { svn: 'OMS_SERVER', path: 'deleteRole', data: { rid: data.GID, type: "JOB" } }).then(function (res) {
                var msg = result(res[0]); layer.close(idx); layer.msg(msg.message);
                if (msg.success) publish('updateGwTable');
            });
        });
    }

    /**
     * 关联系统
     */
    function jRefSys(data) {
        publish("showDialog",
            {
                id: 'rights-' + data.OID,
                title: "关联系统",
                url: "module/oms/htmls/SysRelManger.html",
                width: 720,
                height: 480,
                minable: false,
                maxable: false,
                mask: true,
                params: { rid: data.GID, type: "JOB" },
                closeable: true
            });
    }

    /**
     * 鼠标右键
     * @param {any} tree
     * @param {any} userid
     */
    function rightMenu(tree, uid) {
        var layer = layui.layer;

        function fetch($rowElem) {
            var nodeid = $rowElem[0].id;
            return tree.getNodeByTId(nodeid.substr(0, nodeid.length - 5));
        }

        function addOrg(node) {
            publish("getDataX", { svn: "OMS_SERVER", path: "getSubType", data: { type: node.lx } }).then(function (res) {
                publish("showDialog",
                    {
                        id: 'OrgMamager',
                        title: '添加组织机构',
                        width: 520,
                        height: 350,
                        url: "module/oms/htmls/OrgAdd.html",
                        minable: false,
                        maxable: false,
                        mask: true,
                        params: {
                            uid: uid,
                            oid: node.gid,
                            lxs: res[0].data,
                            callBack: function (data) {
                                var qdata = JSON.parse(data.json),
                                    wx = Object.keys(qdata).filter(function (key) { return qdata[key]; }).map(function (key) { return key + "='" + qdata[key] + "'" }).join(" and "),
                                    datas = { tname: "O_ORG_TREE", page: 1, size: 1, where: "LXID IN(SELECT MAX(GID) FROM ORG_" + data.type + " WHERE " + wx + ")" };
                                publish("getDataX", { svn: "OMS_SERVER", path: "QueryData", data: datas }).then(function (qds) {
                                    var val = qds[0].data.datas[0]; val.vaild = 1;
                                    tree.addNodes(node, addImg(Object.keys(val).reduce(function (a, b) { return a[b.toLowerCase()] = val[b], a }, {})));
                                });
                            }
                        },
                        closeable: true
                    });
                openDialog('OrgMamager', '添加组织机构', param, 820);
            });
        }

        function updateOrg(node) {
            var param = {
                tname: "ORG_" + node.lx,
                update: true,
                render: { enable: true, left: 145 },
                //cfg: { width: { X_ORG_INTRODUCTION: '100%', X_ORG_REMARK: '100%' } },
                where: 'gid=' + node.lxid,
                path: 'UpdateStruct',
                getData: function (data, old) {
                    return { type: node.lx, json: JSON.stringify($.extend({ GID: old.GID }, data)) }
                },
                callBack: function (data) {
                    var js = JSON.parse(data.json);
                    node.name = node.title = js[ogn];
                    tree.updateNode(node);
                    publish('updateOrgProp');
                }
            };
            openDialog('OrgMamager', '修改组织机构【' + node.title + '】', param, 820);
        }

        function viewOrg(node) {
            var param = {
                tname: "ORG_" + node.lx,
                render: { enable: false, left: 145 },
                //cfg: { width: { X_ORG_INTRODUCTION: '100%', X_ORG_REMARK: '100%' } },
                where: 'gid=' + node.lxid
            };
            openDialog('OrgMamager', '查看组织机构【' + node.title + '】', param, 820);
        }

        function deleteOrg(node) {
            var idx = layer.msg('数据请求中', { icon: 16, shade: 0.03, fixed: true, time: 0 });
            publish("getDataX", { svn: "OMS_SERVER", path: "DeleteStruct", data: { objid: node.lxid, type: node.lx } }).then(function (res) {
                layer.msg(res[0].message);
                if (res[0].code == '10000') tree.removeNode(node);
                layer.close(idx);
            });
        }

        function addRole(node) {
            var param = {
                tname: RoleRefView,
                render: { enable: true },
                attr: { ORGNAME: node.title },
                cfg: { width: { REMARK: '100%' }, edite: { ORGNAME: false } },
                token: 'updateRoleTable',
                path: 'addRole',
                getData: function (data) { return { type: "ROLE", data: JSON.stringify($.extend({ ORGID: node.gid, RID: node.lxid, CREATER: uid }, data)) } }
            };
            openDialog(RoleRefView, '添加角色', param, 600);
        }

        function addJob(node) {
            var param = {
                tname: JobRefView,
                render: { enable: true },
                token: 'updateGwTable',
                path: 'addRole',
                getData: function (data) { return { type: "JOB", data: JSON.stringify($.extend({ ORGID: node.gid }, data)) } }
            };
            openDialog(JobRefView, '添加岗位', param, 600);
        }

        function addUser(node) {
            publish("showDialog", {
                id: 'regedit',
                title: '第一步、填写登录信息(1/2)',
                width: 520,
                height: 350,
                row: 1,
                url: "module/oms/htmls/Regedit.html",
                minable: false,
                maxable: false,
                mask: true,
                attrs: [{ ORGID: node.gid }],
                params: { uid: uid },
                closeable: true
            });
        }

        return new BootstrapMenu('#orgtree .node_name', {
            fetchElementData: fetch,
            actions: [
                {
                    name: '添加组织人员',
                    iconClass: 'glyphicon glyphicon-user',
                    isShown: function (node) { return node.vaild > 0 && node.gid > 0 && !$("#ry").is(":hidden"); },
                    onClick: addUser
                }, {
                    name: '添加角色',
                    iconClass: 'glyphicon glyphicon-user',
                    isShown: function (node) { return node.vaild > 0 && node.gid > 0 && !$("#role").is(":hidden"); },
                    onClick: addRole
                }, {
                    name: '添加组织岗位',
                    iconClass: 'glyphicon glyphicon-user',
                    isShown: function (node) { return node.vaild > 0 && node.gid > 0 && !$("#gw").is(":hidden"); },
                    onClick: addJob
                }, {
                    name: '添加组织机构',
                    iconClass: 'glyphicon glyphicon-plus',
                    isShown: function (node) { return node.vaild > 0 && node.gid >= 1; },
                    onClick: addOrg
                }, {
                    name: '查看组织机构',
                    iconClass: 'glyphicon glyphicon-th-large',
                    onClick: viewOrg
                }, {
                    name: '修改组织机构',
                    iconClass: 'glyphicon glyphicon-edit',
                    isShown: function (node) { return node.vaild > 0 && node.gid >= 1; },
                    onClick: updateOrg
                }, {
                    name: '删除组织机构',
                    iconClass: 'glyphicon glyphicon-remove',
                    isShown: function (node) { return node.pid >=0 && node.vaild > 0 && node.gid > 0 && !node.children; },
                    onClick: deleteOrg
                }
            ]
        });
    }

    /**
     * 添加图标
     * @param {any} data
     */
    function addImg(data) {
        if (data.lx == 0) {
            data.icon = "../images/tree/partment.png";
            data.iconOpen = "../images/tree/partment.png";
            data.iconClose = "../images/tree/partment1.png";
        } else {
            data.icon = "../images/tree/bm.png";
            data.iconOpen = "../images/tree/bm.png";
            data.iconClose = "../images/tree/bm1.png";
        }
        return data;
    }

    $(document).bind("contextmenu", function (e) { return false; });//禁用右键菜单

    /**
     * 核心逻辑
     */
    layui.use(['mform', 'layer', 'mtable'], function (mform, layer, mtable) {
        mform.config({ svn: 'OMS_SERVER' });
        var odq = { svn: 'OMS_SERVER', path: 'QueryStruct', xpath: 'data.datas[0]', loading: true },
            rtable = getQueryTable("#role", RoleRefView, { width: { REMARK: 320 } }, 185, "#rolesibar", { update: updateRole, authority: roleRights, delete: deleteRole, refsys: rRefSys}),
            jtable = getQueryTable("#gw", JobRefView, { fixed: { X_JOB_NAME: true } }, 185, "#rolesibar", { update: updateJob, authority: jobRights, delete: deleteJob, refsys: jRefSys }),
            utable = getQueryTable("#ry", "U_USER", { fixed: { X_EMPLOYEE_CNAME: true }, width: { X_EMPLOYEE_CNAME: 80 } }, 215, "#userbar", { update: updateUser, relevance: relevance, reset: resetPw, delete: deleteUser }),
            form = mform("#unit");

        var idx = layer.msg('数据请求中', { icon: 16, shade: 0.03, fixed: true, time: 0 });
        publish('getUserInfo').then(function (us) {
            var uid = us[0].USERID;
            initUserQuery();
            publish("getDataX", { svn: "OMS_SERVER", path: "getOrganizeTree", data: { uid: uid } }).then(function (res) {
                var cfg = { data: { key: { name: "title", title: "title" } }, callback: { onClick: treeClick } };
                var $tree = $.fn.zTree.init($("#orgtree"), cfg, getTreeData(res[0].data));
                rightMenu($tree, uid);
                form.setDataReq(odq);
                layer.close(idx);
            });
        });

        $("#tabList a").click(function (e) {
            e.preventDefault();
            $(this).tab('show');
            if ($(this).text() === "角色列表") { rtable.layout(); }
            else if ($(this).text() === "人员列表") { utable.layout(); }
            else if ($(this).text() === "岗位列表") { jtable.layout(); }
        });

        function getFileReq(tname) {
            return { svn: 'OMS_SERVER', path: 'GetFlds', xpath: 'data', data: { tname: tname } };
        }

        function getDataReq(tname) {
            return {
                svn: 'OMS_SERVER',
                path: 'QueryData',
                xpath: { data: 'data.datas', count: 'data.count' },
                loading: true,
                data: function (params) {
                    return {
                        tname: tname,
                        page: params.pgno,
                        size: params.limit
                    };
                }
            }
        }

        function getQueryTable(select, tname, cfg, wd, toolbar, tools) {
            return mtable(select).setClsConfig(cfg).toolClick(tools).setFiledReq(getFileReq(tname)).setDataReq(getDataReq(tname)).fields({ title: '操作', name: 'opp', width: wd, fixed: 'right', align: 'center', toolbar: toolbar });
        }

        function getValue(data) {
            addImg(data);
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
        
        function isChage(node) {
            var obj = node;
            isChage = function (data) {
                var val = data !== obj;
                return obj = data, val;
            }
            return true;
        }

        function treeClick(event, treeId, treeNode) {
            if (isChage(treeNode)) {
                initArr(treeNode.lx, treeNode.lxid);
                initGanwei(treeNode.lx, treeNode.gid * treeNode.vaild);
                initUser(treeNode.lx, treeNode.gid * treeNode.vaild);
                initRole(treeNode.lx, treeNode.gid * treeNode.vaild);
            }
        }

        function initArr(lx, lxid) {
            form.refTable("ORG_" + lx).setDataReq('data', { type: lx, where: 'gid=' + lxid, page: 1, size: 1 }).render({ enable: false });
        }

        function initUser(lx, orid) {
            utable.setDataReq('data', function (params) {
                return { tname: "U_USER", where: 'ORGID=' + orid + ')', page: params.page, size: params.size };
            }).renderOnce({}, true).refresh(1);
        }

        function initGanwei(lx, orid) {
            jtable.setDataReq('data', function (params) {
                return { tname: JobRefView, where: 'ORGID = ' + orid, page: params.page, size: params.size };
            }).renderOnce({ height: "full-45"}, true).refresh(1);
        }

        function initRole(lx, lxid) {
            rtable.setDataReq('data', function (params) {
                return { tname: RoleRefView, where: 'rid=' + lxid, page: params.page, size: params.size };
            }).renderOnce({ height: "full-45"}, true).refresh(1);
        }

        function initUserQuery() {
            var nodeid, src = 'updateUserQuery';

            initUser = function (lx, orid) {
                nodeid = orid;
                $(".queryOper input[type='text']").last().val('');
                utable.setDataReq('data', function (params) {
                    return { tname: "U_USER", where: 'ORGID=' + orid, page: params.page, size: params.size };
                }).renderOnce({height: 'full-80'}, true).refresh(1);
            }

            initTool($(".queryOper"), [{ name: 'USERNAME', alias: '登录名称' }, { name: 'TRUENAME', alias: '用户名称' }], src);

            subscribe({
                sub: src,
                func: function(where) {
                    utable.setDataReq('data', function (params) {
                        return { tname: "U_USER", where: 'ORGID=' + nodeid + ' AND ' + where, page: params.page, size: params.size };
                    }).refresh(1);
                }
            });
        }

        function initTool($target, flds, src) {
            var $sl = $('<select/>').appendTo($target);
            var $s2 = $('<select/>').appendTo($target);
            flds.forEach(function(obj) {
                $sl.append($('<option value="' + obj.name + '">' + obj.alias + '</option>'));
            });
            var $input = $('<input type="text" style="width: 300px" autocomplete="off" class="layui-input layui-btn-small" placeholder="请输入值"/>').appendTo($target);
            var $btn = $('<a class="layui-btn layui-btn-normal layui-btn-small">&nbsp;&nbsp;查&nbsp;&nbsp;询&nbsp;&nbsp;</a>').appendTo($target);
            $s2.append($('<option value="like">模糊</option>'));
            $s2.append($('<option value="=">等于</option>'));
            layui.form.render('select');
            $btn.click(function() {
                var where = '1=1', val = $input.val().replace(/ /g, ''), mc = $s2.val(), fd = $sl.val();
                if (val) where = mc === 'like' ? (fd + " like '%" + val + "%'") : (fd + "='" + val + "'");
                publish(src, where);
            });
        }
        
        subscribe({ sub: 'updateOrgProp', func: function () { form.refresh(); } });
        subscribe({ sub: 'updateRoleTable', func: function () { rtable.refresh(); } });
        subscribe({ sub: 'updateGwTable', func: function () { jtable.refresh(); } });
        subscribe({ sub: 'updateUserTable', func: function () { utable.refresh(); } });
    });
});