define(["jquery", "lodash", "frame/winCore"], function ($, _) {

    /**
     * 数据操作对象
     */
    var invokeCall = function (f, args, context) { if (typeof f === 'function') return f.call(context, args); return args },
        resolve = function (callback) { return function (res) { invokeCall(callback, res[0]); } },
        reject = function (callback) { return function(res) { invokeCall(callback, { error: '请求失败', desc: res[0] }); } },
        sPublish = function (topic, options, callback) { return publish(topic, options).then(resolve(callback), reject(callback))},
        lQuery = {
            name: 'layer',
            metas: {},
            fieldsCache: {},
            layeridValid: function (layerid) { return _.isNumber(layerid) || (layerid % 1 === 0); },
            getMetas: function (callback, svn, proxy) {
                if (lQuery.metas[svn]) { invokeCall(callback, _.cloneDeep(lQuery.metas[svn])); }
                publish('webAction', { svn: svn, proxy: proxy, path: 'metas', data: { f: 'json' } }).then(function (res) {
                    invokeCall(callback, _.cloneDeep(lQuery.metas[svn] = res[0].metainfo));
                }, reject(callback));
            },
            getField: function (layerid, callback, svn, proxy) {
                if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn: svn, proxy: proxy, path: layerid, data: { f: 'json' } }, callback);
            },
            getData: function (layerid, parm, callback, svn, proxy) {
                if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn: svn, proxy: proxy, type: 'post', path: layerid + '/query', data: _.merge({ f: 'json' }, parm) }, callback);
            },
            getIdentify: function (parm, callback, svn, proxy) {
                sPublish('webAction', { svn: svn, proxy: proxy, type: 'post', path: 'identify', data: _.merge({ f: 'json' }, parm) }, callback);
            },
            append: function (layerid, adds, callback, svn, proxy) {
                if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn: svn, proxy: proxy, type: 'post', dataType: 'json', path: layerid + '/applyEdits', data: { f: 'json', adds: JSON.stringify(_.castArray(adds).map(function (obj) { return { attributes: obj } })) } }, callback);
            },
            update: function (layerid, updates, callback, svn, proxy) {
                if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn: svn, proxy: proxy, type: 'post', dataType: 'json', path: layerid + '/applyEdits', data: { f: 'json', updates: JSON.stringify(_.castArray(updates).map(function(obj) { return { attributes: obj } })) } }, callback);
            },
            del: function (layerid, ids, callback, svn, proxy) {
                if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn: svn, proxy: proxy, type: 'post', dataType: 'json', path: layerid + '/applyEdits', data: { f: 'json', deletes: ids } }, callback);
            }
        },
        tQuery = {
            name: 'table',
            fieldsCache: {},
            getField: function (name, callback, svn, proxy) {
                if (name) {
                    var table = svn + proxy + name;
                    if (tQuery.fieldsCache[table]) { invokeCall(callback, _.cloneDeep(tQuery.fieldsCache[table])); }
                    publish('webAction', { svn: svn, proxy: proxy, path: '/table/' + name, data: { f: 'json' } }).then(function (res) {
                        invokeCall(callback, _.cloneDeep(tQuery.fieldsCache[table] = _(res[0].fields).sortBy('findex').value()));
                    }, reject(callback));
                }
            },
            getData: function (name, parm, callback, svn, proxy) {
                if (name) sPublish('webAction', { svn: svn, proxy: proxy, type: 'post', path: '/table/' + name + '/query', data: _.merge({ f: 'json' }, parm) }, callback);
            },
            append: function (name, adds, callback, svn, proxy) {
                if (name) sPublish('webAction', { svn: svn, proxy: proxy, type: 'post', dataType: 'json', path: '/table/' + name + '/applyEdits', data: { f: 'json', adds: JSON.stringify(_.castArray(adds).map(function (obj) { return { attributes: obj } })) } }, callback);
            },
            update: function (name, updates, callback, svn, proxy) {
                if (name) sPublish('webAction', { svn: svn, proxy: proxy, type: 'post', dataType: 'json', path: '/table/' + name + '/applyEdits', data: { f: 'json', updates: JSON.stringify(_.castArray(updates).map(function (obj) { return { attributes: obj } })) } }, callback);
            },
            del: function (name, ids, callback, svn, proxy) {
                if (name) sPublish('webAction', { svn: svn, proxy: proxy, type: 'post', dataType: 'json', path: '/table/' + name + '/applyEdits', data: { f: 'json', deletes: ids } }, callback);
            }
        },
        Query = function (ops) { return ops.lx == 'l' ? lQuery : tQuery; },
        queryKey = function(ops) {return ops.lx == 'l' ? ops.layerid : ops.tableName;}

    /**
     * 解析配置项
     * @param {any} data
     */
    function getService(data) {
        var pys = data.proxy || [],
            svs = data.service || [],
            cfgs = svs.map(function (sv) {
                return _.merge({}, sv, { proxyName: sv.proxy }, { proxy: pys.filter(function (y) { return (y.name || '') === sv.proxy;})[0] });
            });

        function combin(url1, url2) {
            if (url1 && url2) {
                var f1 = url1.lastIndexOf('/') + 1 === url1.length,
                    f2 = url2.indexOf('/') === 0;
                if (f1 && f2) { return url1 + url2.substr(1); }
                else if (f1 || f2) { return url1 + url2; }
                else { return url1 + '/' + url2; }
            }
            return url1;
        }

        return function (key, path, proxy, notproxy) {
            var cfg = cfgs.filter(function(x) { return x.name === key; })[0],
                pt = combin(cfg && cfg.url || key, path),
                py = proxy ? (pys.filter(function (y) { return (y.name || '') === proxy})[0]) || { url: proxy } : cfg && cfg.proxy;
            if(notproxy){return pt;}
            return (py ? (py.url && py.url + '?') : '') + pt + (pt.indexOf('?') >= 0 ? '' : '?');
        }
    }

    /**
     * 核心模块
     * @param {*配置数据} data 
     */
    function regedit(data) {
        var url = getService(data);
        subscribe([
            {
                sub: 'url',
                func:function(opt){
                    return new Promise(function(success, error){
                        success(url(opt.svn, opt.path, opt.proxy,opt.notproxy));
                    });
                }
            },
            {
                sub: 'webAction',
                func: function(opt) {
                    return new Promise(function(success, error) {
                        $.ajax({
                            url: url(opt.svn, opt.path, opt.proxy),
                            data: opt.data || {},
                            type: opt.type || 'get',
                            dataType: opt.dataType || 'jsonp',
                            jsonp: opt.jsonp || 'callback',
                            timeout: opt.timeout || 30000,
                            success: success,
                            error: error
                        });
                    });
                }
            }, {
                sub: 'getFieldVal', /* 获取枚举织*/
                func: function(opt) {
                    return new Promise(function(fulfill) {
                        tQuery.getField(opt.tableName, function(result) {
                            var resObject = {};
                            for (let i = 0; i < opt.fields.length; i++) {
                                for (let j = 0; j < result.length; j++) {
                                    if (opt.fields[i] === result[j].name) {
                                        resObject[opt.fields[i]] = [{ dbval: '--请选择--', dispval: '' }]
                                            .concat(result[j].values);
                                    }
                                }
                            }
                            fulfill(resObject);
                        }, opt.svn, opt.proxy);
                    });
                }
            }, {
                sub: 'getField', /* 获取元数据 */
                func: function(opt) {
                    return new Promise(function(fulfill){ return tQuery.getField(opt && opt.tableName || opt, fulfill, opt.svn, opt.proxy);});
                }
            }, {
                sub: 'getFldDbmeta', /* 获取枚举值 */
                func: function(opt) {
                    return new Promise(function (fulfill) {
                        tQuery.getField(opt && opt.tableName || opt, function (result) {
                            fulfill({
                                items: _(result)
                                    .filter(function (obj) { return obj.values.length > 0; })
                                    .map(function (obj) {
                                        return { name: obj.name, alias: obj.alias, values: obj.values }
                                    })
                                    .value(),
                                containFld: function (fld) {
                                    return _.some(this.items, { name: fld });
                                },
                                getDbVal: function (fld, val) {
                                    var item = _.find(this.items, function (obj) { return obj.name == fld; });
                                    if (item) {
                                        var vals = _.find(item.values, function (obj) { return obj.dbval == val; });
                                        return vals && vals.dispval || '';
                                    }
                                    return '';
                                },
                                getDispVal: function (fld, val) {
                                    var item = _.find(this.items, function (obj) { return obj.name == fld; });
                                    if (item) {
                                        var vals = _.find(item.values, function (obj) { return obj.dispval == val; });
                                        return vals && vals.dbval || '';
                                    }
                                    return '';
                                }
                            });
                        }, opt.svn, opt.proxy);
                    });
                }
            }, {
                sub: 'getData', /* 获取数据 */
                func: function(opt) {
                    return new Promise(function (fulfill) { Query(opt).getData(queryKey(opt), opt.data, fulfill, opt.svn, opt.proxy)});
                }
            }, {
                sub: 'appendData', /* 添加数据 */
                func: function(opt) {
                    return new Promise(function (fulfill) { Query(opt).append(queryKey(opt), opt.attr, fulfill, opt.svn, opt.proxy) });
                }
            }, {
                sub: 'updateData', /* 更新数据 */
                func: function (opt) {
                    return new Promise(function (fulfill) { Query(opt).update(queryKey(opt), opt.attr, fulfill, opt.svn, opt.proxy) });
                }
            }, {
                sub: 'delData', /* 删除数据*/
                func: function(opt) {
                    return new Promise(function (fulfill) { Query(opt).del(queryKey(opt), opt.ids, fulfill, opt.svn, opt.proxy) });
                } 
            }, {
                sub: 'getMeta', /* 删除数据*/
                func: function(opt) {
                    return new Promise(function (fulfill) { lQuery.getMetas(fulfill, opt.svn || opt, opt.proxy) });
                }
            }
        ]);
    }

    $.ajax({ dataType: 'json', url: './cfg/taskServices.json', async: false, success: regedit });
});