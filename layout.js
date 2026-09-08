// 公共布局：注入侧边栏 + 菜单折叠 / 高亮交互
// 三个页面（index / monthCard / addMonthCard）共用本文件
(function () {
    // 侧边栏 HTML 模板（统一结构，避免每个页面手写不一致）
    var sidebarHTML =
        '<aside class="sidebar">' +
            '<div class="logo">园区管理系统</div>' +
            '<ul class="menu">' +
                '<li class="menu-item" data-page="index">' +
                    '<a href="index.html">工作台</a>' +
                '</li>' +
                '<li class="menu-item">' +
                    '<span>园区管理</span>' +
                    '<ul class="sub-menu">' +
                        '<li><a href="#">区域管理</a></li>' +
                    '</ul>' +
                '</li>' +
                '<li class="menu-item">' +
                    '<span>行车管理</span>' +
                    '<ul class="sub-menu">' +
                        '<li data-page="monthCard"><a href="monthCard.html">月卡管理</a></li>' +
                        '<li><a href="#">停车缴费管理</a></li>' +
                        '<li><a href="#">计费规则管理</a></li>' +
                    '</ul>' +
                '</li>' +
                '<li class="menu-item"><span>物业管理</span></li>' +
                '<li class="menu-item"><span>一体机管理</span></li>' +
                '<li class="menu-item"><span>系统管理</span></li>' +
            '</ul>' +
        '</aside>';

    // 注入到占位元素（页面里放 <div id="sidebar-mount"></div>）
    var mount = document.getElementById('sidebar-mount');
    if (mount) {
        mount.outerHTML = sidebarHTML;
    }

    // 菜单折叠：点击一级菜单 span 切换子菜单显示
    var menuSpans = document.querySelectorAll('.menu-item > span');
    for (var i = 0; i < menuSpans.length; i++) {
        menuSpans[i].addEventListener('click', function () {
            var sub = this.nextElementSibling;
            if (sub) {
                sub.classList.toggle('show');
            }
        });
    }

    // 菜单高亮：根据当前页面文件名匹配 a[href]
    var pageName = location.pathname.split('/').pop();
    var allLi = document.querySelectorAll('.menu-item li, .sub-menu li');
    for (var j = 0; j < allLi.length; j++) {
        var li = allLi[j];
        var link = li.querySelector('a');
        if (link && link.getAttribute('href') === pageName) {
            li.classList.add('active');
            // 子菜单项：展开父级子菜单
            var parentSub = li.closest('.sub-menu');
            if (parentSub) {
                parentSub.classList.add('show');
            }
        }
    }
})();
