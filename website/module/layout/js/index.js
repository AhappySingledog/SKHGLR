$(function () {

    layui.use('element', function () { });

    publish("getMenus").then(function (res) {

        res[0].filter(function (o) { return o.bottom === 1; }).map(function(obj){ $("#btns").append($("<a/>").text(obj.nodeName).click(function(){publish(obj.configUrl);}));});

        var mb = new MeunBar('.sidebar');
        mb.show({
            log: { title: "蛇口海关录入系统", src: "../images/log.png" },
            meuns: res[0].filter(function (o) { return o.bottom === 0; })
        });
        tabsInit("main-tabs");
    });

    var exp = false;
    $("#expend").click(function () {
        publish("setMenuMini", exp = !exp);
        $(this).html(exp ? "&#xe65b;" : "&#xe65a;");
    });

    subscribe(
        [
            {
                sub: "showManager",
                func: function () {
                    publish("showDialog",
                        {
                            id: "OmsManager",
                            title: "组织单元管理",
                            width: 1200,
                            height: 600,
                            minable: false,
                            maxable: false,
                            url: "./module/oms/htmls/ManagerUnit.html",
                            mask: true,
                            closeable: true
                        });
                }
            },
            {
                sub: "updatePw",
                func: function () {
                    publish("getUserInfo").then(function(res){
                        publish("showDialog",
                        {
                            id: "updatePw",
                            title: "修改用户密码",
                            width: 300,
                            height: 170,
                            minable: false,
                            maxable: false,
                            url: "./module/layout/html/updatePw.html",
                            params: { username: res[0].user.username },
                            mask: true,
                            closeable: true
                        });
                    });                    
                }
            },
            {
                sub: "safeExit",
                func: function () {
                    top.location.href = top.location.href.split("?")[0] + "?exit";
                }
            }
        ]);
});