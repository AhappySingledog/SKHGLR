function MeunBar(target) {
    var $target = $(target).removeClass("meunbox").addClass("meunbox");
    var mini = false, menus = {}, style = {
        padding: 36,
        className: "meun",
        miniClassName: "meun_mini",
        menuItem: "meun-item",
        fold: "meun-item-fold",
        expand: "meun-item-expand",
        active: "meun-item-active"
    }

    subscribe({
        sub: 'setMenuMini',
        func: function (opts) {
            var flg = opts === true;
            if (flg !== mini) {
                mini = flg;
                if (mini) {
                    $target.css({ width: 64 });
                    showMini();
                }
                else {
                    $target.css({ width: 300 });
                    show();
                }
            }
        }
    });

    function dispatch(menu) {
        if (menu.configUrl) publish("addTab", { id: "table_" + menu.id, title: menu.nodeName, url: "../../metas/html/index.html", params: menu });
    }

    function getLog(log) {
        var $log = $('<div class="loginfo"/>').text(log.title);
        $log.prepend($('<img src="' + log.src + '" />'));
        return $log;
    }

    function getItem(menu, lv) {
        lv = lv || 0;
        var $li = $('<li/>');
        var $title = $('<div></div>').appendTo($li).text(menu.nodeName);
        if (lv > 0) $title.css({ paddingLeft: lv * style.padding + "px" });
        if (menu.imgUrl) $title.prepend($('<img class="meun_img" src="' + menu.imgUrl + '" />'));
        if (menu.children && menu.children.length > 0) {
            $li.addClass(style.fold);
            var $ul = $('<ul/>').appendTo($li);
            menu.children.forEach(function (item) { $ul.append(getItem(item, lv + 1)); });
            $title.click(function () {
                if ($li.is("." + style.fold)) {
                    $li.removeClass().addClass(style.expand);
                    $ul.slideDown();
                } else {
                    $li.removeClass().addClass(style.fold);
                    $ul.slideUp();
                }
            });
        } else {
            $title.click(function () {
                if (!$title.is("." + style.active)) {
                    $("." + style.className + " ." + style.active).removeClass(style.active);
                    $title.addClass(style.active);
                    dispatch(menu);
                }
            });
        }
        return $li;
    }

    function getItemMini(menu, flg) {
        flg = flg === true;
        var $li = $('<li/>');
        var $div = $('<div/>').appendTo($li);
        if (flg) {
            $div.text(menu.nodeName);
            if (menu.imgUrl) $div.append($('<img src="' + menu.imgUrl + '" />')).addClass("meun_img");
            $div.click(function() { dispatch(menu); });
        }
        else $div.append($('<img src="' + menu.imgUrl + '" />').addClass("meun_mini_img")).css({ textAlign: "center" });
        if (menu.children && menu.children.length > 0) {
            var $ul = $('<ul/>').appendTo($li);
            menu.children.forEach(function (item) { $ul.append(getItemMini(item, true)); });
        }
        return $li;
    }

    function showMini() {
        $target.empty().append(getLog(menus.log));
        var $ul = $('<ul/>').addClass(style.className).addClass(style.miniClassName).appendTo($target);
        menus.meuns.forEach(function (item) {
            var obj = getItemMini(item);
            $ul.append(obj);
        });
    }

    function show() {
        $target.empty().append(getLog(menus.log));
        var $ul = $('<ul/>').addClass(style.className).appendTo($target);
        menus.meuns.forEach(function (item) {
            var obj = getItem(item);
            $ul.append(obj);
        });
    }

    this.show = function (datas) {
        menus = datas;
        show();
    }
}