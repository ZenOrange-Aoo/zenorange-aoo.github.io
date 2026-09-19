
// ========== 月卡数据层：三个页面共用 ==========
// 存储约定：key = monthCardData，数组元素字段：
// id（Date.now 生成）、carNo 车牌、ownerName 车主、phone 手机号、
// startDate/endDate（YYYY-MM-DD）、amount 支付金额、
// remainDay 剩余有效天数、status（0=可用，1=已过期，由结束日期自动判断）
var MONTH_CARD_KEY = 'monthCardData';

var DAY_MS = 24 * 60 * 60 * 1000;

//手机号正则：11位，1开头，第二位3-9
var PHONE_RE = /^1[3-9]\d{9}$/;
//国内车牌正则：省份简称+地区字母+5位标准牌/6位新能源牌
var PLATE_RE = /^[\u4e00-\u9fa5][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}$/;

//日期补零
function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
}

//时间戳 -> YYYY-MM-DD
function formatDate(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

//剩余有效天数 = 结束日期 - 今天（已过期为负数）
function computeRemainDay(endDate) {
    var end = new Date(endDate + ' 00:00:00').getTime();
    var today = new Date(formatDate(Date.now()) + ' 00:00:00').getTime();
    return Math.ceil((end - today) / DAY_MS);
}

//状态自动判断：0=可用，1=已过期
function computeStatus(endDate) {
    return computeRemainDay(endDate) >= 0 ? 0 : 1;
}

//金额千分位格式化，保留两位小数
function formatMoney(num) {
    var s = (Number(num) || 0).toFixed(2);
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

//组装一条月卡对象（保存前统一走这里，自动算剩余天数和状态）
function buildMonthCard(id, carNo, ownerName, phone, startDate, endDate, amount) {
    return {
        id: id,
        carNo: carNo,
        ownerName: ownerName,
        phone: phone,
        startDate: startDate,
        endDate: endDate,
        amount: amount,
        remainDay: computeRemainDay(endDate),
        status: computeStatus(endDate)
    };
}

//默认模拟数据：本地无数据时启用（日期相对今天生成，保证可用/已过期都有）
function createDefaultMonthCardData() {
    var now = Date.now();
    return [
        buildMonthCard(1, '赣A12345', '张伟', '13800001111', formatDate(now - 15 * DAY_MS), formatDate(now + 75 * DAY_MS), 900),
        buildMonthCard(2, '赣A67890', '李娜', '13912345678', formatDate(now - 40 * DAY_MS), formatDate(now + 20 * DAY_MS), 1800),
        buildMonthCard(3, '赣B11111', '王强', '18766665555', formatDate(now - 90 * DAY_MS), formatDate(now - 10 * DAY_MS), 1200)
    ];
}

//读取：优先 localStorage；无数据或旧格式（缺少endDate字段）则重建默认模拟数据
function loadMonthCardData() {
    var raw = localStorage.getItem(MONTH_CARD_KEY);
    if (raw === null) {
        var defaults = createDefaultMonthCardData();
        saveMonthCardData(defaults);
        return defaults;
    }
    var list = JSON.parse(raw);
    //兼容旧版数据（只有carNo/status），自动替换为默认模拟数据
    if (!Array.isArray(list) || list.length === 0 || !list[0].endDate) {
        defaults = createDefaultMonthCardData();
        saveMonthCardData(defaults);
        return defaults;
    }
    return list;
}

//保存：统一入口，写 localStorage
function saveMonthCardData(list) {
    localStorage.setItem(MONTH_CARD_KEY, JSON.stringify(list));
}

//按 id 查找月卡（页面需先定义全局 monthCardData）
function findCardById(id) {
    for (var i = 0; i < monthCardData.length; i++) {
        if (monthCardData[i].id === id) {
            return monthCardData[i];
        }
    }
    return null;
}