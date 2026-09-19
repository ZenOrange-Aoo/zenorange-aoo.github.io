
//首页数据渲染：统一走 data.js 数据层读取
var monthCardData = loadMonthCardData();

//本地暂无企业/一体杆/收费模块，用 localStorage 模拟存储
function getMockNum(key, def) {
    var v = localStorage.getItem(key);
    if (v === null) {
        localStorage.setItem(key, def);
        return def;
    }
    return Number(v);
}

//渲染首页统计卡片
function renderHomeStat() {
    //年度累计收费（元）：千分位格式化
    document.getElementById('yearFee').innerText = formatMoney(getMockNum('yearFee', 56800));
    //入驻企业总数
    document.getElementById('companyCount').innerText = getMockNum('companyCount', 36);
    //一体杆总数
    document.getElementById('poleCount').innerText = getMockNum('poleCount', 8);
    //月卡车辆总数：实时读取月卡数据
    document.getElementById('totalMonthCard').innerText = monthCardData.length;
}

window.onload = function () {
    renderHomeStat();
}
