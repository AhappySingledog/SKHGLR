publish("getUserInfo").then(function(res){
    layui.use(['element', 'mtable', 'layer', 'form','upload'], function (element, mtable, layer, form, upload) {

        var svn = 'NET_SERVER', sub = 'webAction',
        showFlds = [{ fidx: -1, field: 'XH', title: '序号', width: 100 }].concat(res[0].user.isadmin == '1' ? [{ title: '操作', name: 'opp', width: 100, fixed: 'right', align: 'center', toolbar: '#sibar' }] : []);
    
        $(function () {
            var pts = window._params;
            mtable.config({ svn: svn, sub: sub });
    
            publish("getData",{lx:"t",tableName:"TBL_MASTERSLAVER",data:{where:" type = '"+  pts.configUrl +"' order by indx"},svn:svn}).then(function(res){
                var data = res[0].features;
                if(data.length > 0){
                    var $div = $('<div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief"/>');
                    var $tabs = $('<ul class="layui-tab-title"/>').appendTo($div);
                    var $content = $('<div class="layui-tab-content"></div>').appendTo($div);
                    data.map(function (item) {
                        var $li = $('<li></li>').text(item.attributes.NAME).appendTo($tabs);
                        var $item = $('<div class="layui-tab-item"></div>').appendTo($content);
                        $item.append(addTableQuery({table:item.attributes.TABLENAME,width:1000,cols:2},false));
                        if (item.attributes.ISMASTER=='1') {
                            $li.addClass('layui-this');
                            $li.text(item.attributes.NAME + "(主表)");                        
                            $item.addClass('layui-show');
                        }else{
                            $li.text(item.attributes.NAME + "(从表)");
                        }
                    });
                    $(document.body).append($div);
                    element.init();
                }else{
                    $(document.body).append(addTableQuery({table:pts.configUrl,width:1000,cols:2},true));
                }
            }).catch(function(error){
                layer.alert("请配置主从表关系信息");
            });
    
            function addTableQuery(data,isOne) {
                var $div = $('<div class="tableQuery"></div>');
                var $oper = $('<div class="oper layui-form"></div>').appendTo($div);
                var $table = $('<div class="table"></div>').appendTo($('<div/>').appendTo($div));
                bindCmds(data, mtable($table).refTable(data.table).fields(showFlds).unVisable('GID,id').setDataReq('data', defQuery).setDataReq('loading', true).updateData(adapter).updateFieldData(initTool($oper, data)).toolClick(toolClik(data)).renderOnce({ height:isOne?'full-34':"full-73"}, true));
                return $div;
            }
    
            function initTool($target, opts) {
                var $sl = $('<select style="margin-right: 4px;width:150px" name=""/>').appendTo($target);
                var $s2 = $('<select style="margin-right: 4px; width: 150px" name=""/>').appendTo($target);
                var $input = $('<input type="text" style="margin-right: 4px; width: 300px" autocomplete="off" class="layui-input layui-btn-small" placeholder="请输入值"/>').appendTo($target);
                var $btn = $('<a class="layui-btn layui-btn-normal layui-btn-small">&nbsp;&nbsp;查&nbsp;&nbsp;询&nbsp;&nbsp;</a>').appendTo($target);
                var $btnAdd = $('<a class="layui-btn layui-btn-small">&nbsp;&nbsp;添&nbsp;&nbsp;加&nbsp;&nbsp;</a>').appendTo($target);
                var $templetDown = $('<a class="layui-btn layui-btn-small">&nbsp;&nbsp;模板下载&nbsp;&nbsp;</a>').appendTo($target);
                var $batchImport = $('<a class="layui-btn layui-btn-small">&nbsp;&nbsp;批量上传&nbsp;&nbsp;</a>').appendTo($target);
    
                $s2.append($('<option value="like">模糊</option>'));
                $s2.append($('<option value="=">等于</option>'));
                form.render('select');
                return function (fds) {
                    var table = this.tableName;
                    fds.fields.filter(function (obj) { return obj.visible && obj.name != 'GID' && obj.name != 'gid'}).forEach(function (obj) {
                        $sl.append($('<option value="' + obj.name + '">' + obj.alias + '</option>'));
                        form.render('select');
                    });
                    $btn.click(function () {
                        var where = '1=1', val = $input.val().replace(/ /g, ''), mc = $s2.val(), fld = $sl.val();
                        if (val) where = mc === 'like' ? (fld + " like '%" + val + "%'") : (fld + "='" + val + "'");
                        publish('query/' + table, where);
                    });
                    $btnAdd.click(function () { insert(table, opts); });
                    $templetDown.click(function () { templetDown(table);});
                    publish("url",{ svn: "SKHG_SERVER", path:"/excel/upload",notproxy:true}).then(function(res){
                        var url = res[0];
                        upload.render({
                            elem: $batchImport,
                            data:{table:table},
                            url: url,
                            accept: 'file',
                            before: function(obj){layer.load();}
                            ,done: function(res){
                                layer.closeAll('loading');
                                if(res.isSuccess){
                                    publish("refresh/" + table);
                                }else{
                                    layer.alert(res.msg);
                                }
                            }
                            ,error: function(index, upload){layer.closeAll('loading'); }
                        });
                    });
                    return fds.fields;
                }
            }
    
            function bindCmds(data, table) {
                subscribe([
                    {
                        sub: 'refresh/' + data.table,
                        func: function () {
                            table.refresh();
                        }
                    },
                    {
                        sub: 'query/' + data.table,
                        func: function (where) {
                            table.setDataReq('data', defQuery(where)).refresh(1);
                        }
                    }
                ]);
            }
    
            function defQuery() {
                var ops = arguments[0];
                if (typeof ops === 'string')
                    return function (params) {
                        return $.extend({}, params, { pageno: params.page, pagesize: params.size, f: 'json', where: ops });
                    }
                return $.extend({}, ops, { pageno: ops.page, pagesize: ops.size, f: 'json' });
            }
    
            function extend(obj, key, val) {
                return obj[key] = val, obj;
            }
    
            function adapter(data) {
                var ops = { svn: svn, path: 'table/' + this.tableName + '/query', data: { f: 'json', where: this._data.where, returnCountOnly: true } };
                var xh = (this._data.pageno - 1) * this._data.pagesize + 1;
                return publish('webAction', ops).then(function (res) {
                    return {
                        count: res[0].count,
                        data: data.features.map(function (obj, i) { return extend(obj.attributes, "XH", xh + i); })
                    };
                });
            }
    
            function insert(table, ops) {
                if (table == "SK_LJYBSQB" || table == "SK_LJDBSQB") {
                    var param = {
                        svn: svn,
                        sub: 'appendData',
                        tname: ops.table,
                        cols: ops.cols,
                        render: { enable: true },
                        token: 'refresh/' + ops.table
                    };
                    publish("showDialog", {
                        id: table,
                        title: '添加内容',
                        width: 800,
                        height: 400,
                        url: "./module/metas/html/Element2.html",
                        minable: false,
                        maxable: false,
                        mask: true,
                        params: param,
                        closeable: true
                    });
                }
                else {
                    var param = {
                        svn: svn,
                        sub: 'appendData',
                        tname: ops.table,
                        cols: ops.cols,
                        render: { enable: true },
                        token: 'refresh/' + ops.table
                    };
                    openDialog(ops.table, '添加内容', param, ops.width || 600);
                }
            }
    
            function templetDown(table){
                publish("url",{ svn: "SKHG_SERVER", path:"/excel/down?table=" + table,notproxy:true}).then(function(res){
                    var url = res[0];
                    window.location.href = url;
                });
            }
    
            function getKeyName(obj) {
                return obj ? "【" + obj + "】" : "";
            }
    
            function toolClik(ops) {
                return {
                    update: function (data) {
                        var param = {
                            svn: svn,
                            tname: ops.table,
                            cols: ops.cols,
                            render: { enable: true },
                            token: 'refresh/' + ops.table,
                            where: "gid='" + (data.GID || data.id) + "'"
                        };
                        openDialog(ops.table, '修改内容' + getKeyName(data[ops.key]), param, ops.width || 900);
                    },
                    delete: function (data) {
                        layer.confirm('确认要删除' + getKeyName(data[ops.key]) + '中的数据?', { icon: 2, title: '删除确认' }, function (index) {
                            layer.close(index);
                            var idx = layer.msg('正在处理数据，请稍后', { icon: 16, shade: 0.03, fixed: true, time: 0 });
                            publish('delData', { svn: svn, tableName: ops.table, ids: data.GID || data.id }).then(function (res) {
                                layer.close(idx);
                                var result = res[0].deleteResults[0];
                                if (result.success) {
                                    publish('showTopMsg', '删除成功').then(function () { publish('refresh/' + ops.table); });
                                }
                                else
                                    layer.msg(result.error.description);
                            });
                        });
                    }
                };
            }
    
            function openDialog(id, title, param, wd) {
                publish("showDialog",
                    {
                        id: id,
                        title: title,
                        width: wd,
                        height: 400,
                        url: "./module/metas/html/Element.html",
                        minable: false,
                        maxable: false,
                        mask: true,
                        params: param,
                        closeable: true
                    });
            }
        });
    });
});