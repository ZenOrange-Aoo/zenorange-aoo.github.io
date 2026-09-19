
//月卡管理页：统一走 data.js 数据层（查询 / 分页 / 批量删除 / 查看 / 续费 / 删除）
var monthCardData = loadMonthCardData();
var PAGE_SIZE = 5;
var currentPage = 1;

//按查询条件过滤
function getFilteredList() {
    var carNo = document.getElementById('qCarNo').value.trim();
    var status = document.getElementById('qStatus').value;
    var list = [];
    for (var i = 0; i < monthCardData.length; i++) {
        var c = monthCardData[i];
        if (carNo && c.carNo.indexOf(carNo) === -1) { continue; }
        if (status !== '' && String(c.status) !== status) { continue; }
        list.push(c);
    }
    return list;
}

//状态标签：0=可用，1=已过期
function statusTag(s) {
    return s === 0
        ? '<span class="tag tag-on">可用</span>'
        : '<span class="tag tag-off">已过期</span>';
}

//渲染表格（当前页）+ 分页条
function renderTable() {
    var list = getFilteredList();
    var pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (currentPage > pageCount) { currentPage = pageCount; }
    var start = (currentPage - 1) * PAGE_SIZE;
    var pageList = list.slice(start, start + PAGE_SIZE);

    var tbody = document.getElementById('tbody');
    if (pageList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:#909399;">暂无数据</td></tr>';
    } else {
        var html = '';
        for (var i = 0; i < pageList.length; i++) {
            var c = pageList[i];
            html += '<tr>' +
                '<td><input type="checkbox" class="row-check" value="' + c.id + '"></td>' +
                '<td>' + (start + i + 1) + '</td>' +
                '<td>' + c.carNo + '</td>' +
                '<td>' + c.ownerName + '</td>' +
                '<td>' + c.phone + '</td>' +
                '<td>' + c.startDate + '</td>' +
                '<td>' + c.endDate + '</td>' +
                '<td>' + c.remainDay + ' 天</td>' +
                '<td>' + formatMoney(c.amount) + '</td>' +
                '<td>' + statusTag(c.status) + '</td>' +
                '<td>' +
                    '<button class="btn btn-mini" onclick="viewCard(' + c.id + ')">查看</button> ' +
                    '<button class="btn btn-mini" onclick="location.href=\'addMonthCard.html?id=' + c.id + '\'">编辑</button> ' +
                    '<button class="btn btn-mini" onclick="renewCard(' + c.id + ')">续费</button> ' +
                    '<button class="del-btn btn-mini" onclick="delCard(' + c.id + ')">删除</button>' +
                '</td>' +
                '</tr>';
        }
        tbody.innerHTML = html;
    }
    renderPageBar(pageCount, list.length);
    document.getElementById('checkAll').checked = false;
}

//渲染分页条
function renderPageBar(pageCount, total) {
    var html = '<span class="page-info">共 ' + total + ' 条</span>';
    for (var p = 1; p <= pageCount; p++) {
        html += '<button class="page-btn ' + (p === currentPage ? 'cur' : '') + '" onclick="goPage(' + p + ')">' + p + '</button>';
    }
    document.getElementById('pageBar').innerHTML = html;
}

function goPage(p) {
    currentPage = p;
    renderTable();
}

//查询：回到第1页
function queryList() {
    currentPage = 1;
    renderTable();
}

//重置查询条件
function resetQuery() {
    document.getElementById('qCarNo').value = '';
    document.getElementById('qStatus').value = '';
    currentPage = 1;
    renderTable();
}

//全选/取消全选
function toggleAll(box) {
    var checks = document.querySelectorAll('.row-check');
    for (var i = 0; i < checks.length; i++) { checks[i].checked = box.checked; }
}

//批量删除勾选项
function batchDel() {
    var checks = document.querySelectorAll('.row-check:checked');
    if (checks.length === 0) { alert('请先勾选要删除的月卡'); return; }
    if (!confirm('确定删除选中的 ' + checks.length + ' 条月卡吗？')) { return; }
    var ids = [];
    for (var i = 0; i < checks.length; i++) { ids.push(Number(checks[i].value)); }
    var newList = [];
    for (var j = 0; j < monthCardData.length; j++) {
        if (ids.indexOf(monthCardData[j].id) === -1) { newList.push(monthCardData[j]); }
    }
    monthCardData = newList;
    saveMonthCardData(monthCardData);
    renderTable();
}

//查看详情弹窗
function viewCard(id) {
    var c = findCardById(id);
    if (!c) { return; }
    document.getElementById('viewBody').innerHTML =
        '<p><b>车牌号：</b>' + c.carNo + '</p>' +
        '<p><b>车主姓名：</b>' + c.ownerName + '</p>' +
        '<p><b>手机号：</b>' + c.phone + '</p>' +
        '<p><b>有效期：</b>' + c.startDate + ' 至 ' + c.endDate + '</p>' +
        '<p><b>剩余天数：</b>' + c.remainDay + ' 天</p>' +
        '<p><b>支付金额：</b>' + formatMoney(c.amount) + ' 元</p>' +
        '<p><b>状态：</b>' + (c.status === 0 ? '可用' : '已过期') + '</p>';
    document.getElementById('viewModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('viewModal').style.display = 'none';
}

//续费：结束日期延长30天并重算剩余天数/状态（已过期的从今天起算）
function renewCard(id) {
    var c = findCardById(id);
    if (!c) { return; }
    if (!confirm('确定为 ' + c.carNo + ' 续费 30 天吗？')) { return; }
    var baseTs = computeRemainDay(c.endDate) < 0
        ? new Date(formatDate(Date.now()) + ' 00:00:00').getTime()
        : new Date(c.endDate + ' 00:00:00').getTime();
    var newEnd = formatDate(baseTs + 30 * DAY_MS);
    var updated = buildMonthCard(c.id, c.carNo, c.ownerName, c.phone, c.startDate, newEnd, c.amount);
    for (var i = 0; i < monthCardData.length; i++) {
        if (monthCardData[i].id === id) { monthCardData[i] = updated; }
    }
    saveMonthCardData(monthCardData);
    renderTable();
}

//删除单条
function delCard(id) {
    if (!confirm('确定删除该月卡吗？')) { return; }
    var newList = [];
    for (var i = 0; i < monthCardData.length; i++) {
        if (monthCardData[i].id !== id) { newList.push(monthCardData[i]); }
    }
    monthCardData = newList;
    saveMonthCardData(monthCardData);
    renderTable();
}

window.onload = function () {
    renderTable();
};