layui.use(['element', 'mtable', 'layer', 'form'], function (element, mtable, layer, form) {

    var svn = 'NET_SERVER', sub = 'webAction',  showFlds = [
        { fidx: -1, field: 'XH', title: '序号', width: 100 },
        { title: '操作', name: 'opp', width: 100, fixed: 'right', align: 'center', toolbar: '#sibar' }
    ];

    $(function () {
        mtable.config({ svn: svn, sub: sub });
        $.ajax({ dataType: 'json', url: '../../../cfg/datas.json', async: false, success: init });

        function init(datas) {
            debugger;
            var $div = $('<div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief"/>');
            var $tabs = $('<ul class="layui-tab-title"/>').appendTo($div);
            var $content = $('<div class="layui-tab-content"></div>').appendTo($div);
            datas.map(function (data) {
                var $li = $('<li></li>').text(data.name).appendTo($tabs);
                var $item = $('<div class="layui-tab-item"></div>').appendTo($content);
                $item.append(addItem(data.items));
                if (data.select) {
                    $li.addClass('layui-this');
                    $item.addClass('layui-show');
                }
            });
            $(document.body).append($div);
            element.init();
        }

        function addItem(datas) {
            var $div = $('<div class="layui-tab layui-tab-card" lay-filter="docDemoTabBrief"/>');
            var $tabs = $('<ul class="layui-tab-title"/>').appendTo($div);
            var $content = $('<div class="layui-tab-content"></div>').appendTo($div);
            datas.map(function (data) {
                var $li = $('<li></li>').text(data.name).appendTo($tabs).click(function () {
                    publish('select/' + data.data.table);
                });
                var $item = $('<div class="layui-tab-item"></div>').appendTo($content);
                $item.append(addTableQuery(data.data));
                if (data.select) {
                    $li.addClass('layui-this');
                    $item.addClass('layui-show');
                    setTimeout(function () { $li.trigger('click');}, 50);
                }
            });
            return $div;
        }

        function addTableQuery(data) {
            var $div = $('<div class="tableQuery"></div>');
            var $oper = $('<div class="oper layui-form"></div>').appendTo($div);
            var $table = $('<div class="table"></div>').appendTo($('<div/>').appendTo($div));
            bindCmds(data, mtable($table).refTable(data.table).fields(showFlds).unVisable('GID,id').setDataReq('data', defQuery).setDataReq('loading', true).updateData(adapter).updateFieldData(initTool($oper, data)).toolClick(toolClik(data)));
            return $div;
        }

        function initTool($target, opts) {
            var $sl = $('<select style="margin-right: 4px" name=""/>').appendTo($target);
            var $s2 = $('<select style="margin-right: 4px; width: 80px" name=""/>').appendTo($target);
            var $input = $('<input type="text" style="margin-right: 4px; width: 300px" autocomplete="off" class="layui-input layui-btn-small" placeholder="请输入值"/>').appendTo($target);
            var $btn = $('<a class="layui-btn layui-btn-normal layui-btn-small">&nbsp;&nbsp;查&nbsp;&nbsp;询&nbsp;&nbsp;</a>').appendTo($target);
            var $btnAdd = $('<a class="layui-btn layui-btn-small">&nbsp;&nbsp;添&nbsp;&nbsp;加&nbsp;&nbsp;</a>').appendTo($target);
            $s2.append($('<option value="like">模糊</option>'));
            $s2.append($('<option value="=">等于</option>'));
            form.render('select');
            return function (fld) {
                var table = this.tableName;
                fld.fields.forEach(function(obj) {
                    $sl.append($('<option value="' + obj.name + '">' + obj.alias + '</option>'));
                    form.render('select');
                });
                $btn.click(function() {
                    var where = '1=1', val = $input.val().replace(/ /g, ''), mc = $s2.val(), fld = $sl.val();
                    if (val) where = mc === 'like' ? (fld + " like '%" + val + "%'") : (fld + "='" + val + "'");
                    publish('query/' + table, where);

                });
                $btnAdd.click(function () {insert(table, opts); });
                return fld.fields;
            }
        }

        function bindCmds(data, table) {
             subscribe([
                {
                    sub: 'select/' + data.table,
                    func: function() {
                        table.renderOnce({ height: 'full-114' }, true);
                    }
                },
                {
                    sub: 'refresh/' + data.table,
                    func: function() {
                        table.refresh();
                    }
                 },
                {
                    sub: 'query/' + data.table,
                    func: function(where) {
                        table.setDataReq('data', defQuery(where)).refresh(1);
                    }
                }
            ]);
        }

        function defQuery() {
            var ops = arguments[0];
            if (typeof ops === 'string')
                return function (params) {
                    return $.extend({}, params, { pageno: params.page, pagesize: params.size, f: 'json',where: ops });
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

        function getKeyName(obj) {
            return obj ? "【" + obj + "】" : "";
        }

        function toolClik(ops) {
            return {
                update: function(data) {
                    var param = {
                        svn: svn,
                        tname: ops.table,
                        cols: ops.cols,
                        render: { enable: true },
                        token: 'refresh/' + ops.table,
                        where: "gid='" + (data.GID || data.id) + "'"
                    };
                    openDialog(ops.table, '修改内容' + getKeyName(data[ops.key]), param, ops.width || 600);
                },
                delete: function(data) {
                    layer.confirm('确认要删除' + getKeyName(data[ops.key]) + '中的数据?', { icon: 2, title: '删除确认' }, function (index) {
                        layer.close(index);
                        var idx = layer.msg('正在处理数据，请稍后', { icon: 16, shade: 0.03, fixed: true, time: 0 });
                        publish('delData', { svn: svn, tableName: ops.table, ids: data.GID || data.id }).then(function (res) {
                            layer.close(idx);
                            var result = res[0].deleteResults[0];
                            if (result.success) {
                                publish('showTopMsg', '删除成功').then(function () { publish('refresh/' + ops.table);});
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
                    width: wd || 800,
                    height: 400,
                    url: "./module/whng/html/Element.html",
                    minable: false,
                    maxable: false,
                    mask: true,
                    params: param,
                    closeable: true
                });
        }
    });
});