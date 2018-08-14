
/**
 * 异步加载地图
 */
(function() {
    var url = 'https://webapi.amap.com/maps?v=1.4.8&key=38db8101e26b0719fd8148bd78bde6f9&callback=onLoad',
        jsapi = document.createElement('script');
       
    jsapi.charset = 'utf-8';
    jsapi.src = url;
    document.head.appendChild(jsapi);
})();

window.onLoad  = function(){
    loadMap();
};

/**
 * 加载地图和插件
 */
function loadMap() {
   setTimeout(() => {
       var partRight = document.getElementsByClassName('panel-right-container')[0],
           loading = document.getElementsByClassName('loading-container')[0];
       //移除加载动画
       partRight.removeChild(loading);
       window.map = new AMap.Map('map-container', {
           zoom: 10,
           //广州市区的坐标
           center: [113.23, 23.13],
       });
       //异步加载插件
       AMap.plugin(['AMap.ToolBar', 'AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Geolocation'], pluginOptions);
   }, 1500);
}

/**
 * 插件的选项
 */
function pluginOptions() {

    //缩放工具条
    var toolbar = new AMap.ToolBar({
        "direction": false,
        "position": "RB", //将插件置于右下方
        "locate": false
    });
    map.addControl(toolbar);
    //定位插件
    window.geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, //使用高精度定位
        timeout: 10000, //超过10秒后停止定位，默认：无穷大
        showButton: false,
        zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见
    });
    map.addControl(geolocation);
    AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
    AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息
    //解析定位结果
    function onComplete(data) {
        var str = ['定位成功'];
        str.push('经度：' + data.position.getLng());
        str.push('纬度：' + data.position.getLat());
        if (data.accuracy) {
            str.push('精度：' + data.accuracy + ' 米');
        } //如为IP精确定位结果则没有精度信息
        str.push('是否经过偏移：' + (data.isConverted ? '是' : '否'));
        console.log(str);
    }
    //解析定位错误信息
    function onError(data) {
        console.log('locate error');
    }
    // 实例化Autocomplete
    var autoSearch = new AMap.Autocomplete({
        //city 限定城市，默认全国
        city: '广州',
        citylimit: true,
        input: 'search-input'
    });
    var autoStart = new AMap.Autocomplete({
        //city 限定城市，默认全国
        city: '广州',
        citylimit: true,
        input: 'start-input'
    });
    var autoEnd = new AMap.Autocomplete({
        //city 限定城市，默认全国
        city: '广州',
        citylimit: true,
        input: 'end-input'
    });
    //地图搜索选项
    const placeoptions = {
        map: map,
        autoFitView: true
    };
    //构造地点查询类
    var placeSearch = new AMap.PlaceSearch(placeoptions);  
    // var startSearch = new AMap.PlaceSearch(placeoptions);  
    // var endSearch = new AMap.PlaceSearch(placeoptions);  
    //注册监听，当选中某条记录时会触发
    AMap.event.addListener(autoSearch, 'select', select);
    AMap.event.addListener(autoStart, 'select', select);
    AMap.event.addListener(autoEnd, 'select', select);
    AMap.event.addListener(placeSearch, 'markerClick', getMakerData);
    // AMap.event.addListener(startSearch, 'markerClick', getMakerData);
    // AMap.event.addListener(endSearch, 'markerClick', getMakerData);
    function select(e) {
        placeSearch.setCity(e.poi.adcode);
        placeSearch.search(e.poi.name);  //关键字查询查询
    }
    //获取选取点的信息
    function getMakerData(e) {
        console.log(e.data);
    }     
}

/**
 * 引入多个插件
 */

/**
 * 热力图 
 * 
*/
// var loca = Loca.create('container', {
    //     mapStyle: 'amap://styles/midnight',
    //     zoom: 11,
    //     center: [116.397428, 39.90923]
    // });
    // //创建图层
    // var layer = Loca.visualLayer({
    //     container: loca,
    //     type: 'heatmap',
    //     shape: 'normal'
    // });
    // //数据
    // for (var i = 0; i < heatmapData.length; i++) {
    //     console.log(heatmapData[i]);
    // }

    // var list = [];
    // var i = -1, length = heatmapData.length;
    // while (++i < length) {
    //     var item = heatmapData[i];
    //     list.push({
    //         coordinate: [item.lng, item.lat],
    //         count: item.count
    //     })
    // }

    // layer.setData(list, {
    //     lnglat: 'coordinate',
    //     value: 'count'
    // });
    // //添加数据
    
    // //设置样式
    // layer.setOptions({
    //     style: {
    //         radius: 25,
    //         opacity: [0.1, 0.9],
    //     },
    //     gradient: {
    //         0.5: '#2c7bb6',
    //         0.65: '#abd9e9',
    //         0.7: '#ffffbf',
    //         0.9: '#fde468',
    //         1.0: '#d7191c'
    //     }
    // });
    // //绘制图层
    // layer.render();


(function () {
    /**
     * 隐藏或者显示左面板功能
     */
    var panel = document.getElementsByClassName('panel-left-container')[0];
    showPanelButton = document.getElementsByClassName('panel-button')[0];

    EventUtil.addHandler(showPanelButton, 'click', function() {
        // ClassUtil.toggleClass(panel, 'hide-panel');
        if (ClassUtil.hasClass(panel, 'hide-panel')) {
            ClassUtil.removeClass(panel, 'hide-panel');
            showPanelButton.innerHTML = '‹';
        } else {
            ClassUtil.addClass(panel, 'hide-panel');
            showPanelButton.innerHTML = '›';
        }
    });

    /**
     * 显示二级菜单
     */
    var navFirst = document.getElementsByClassName('nav-1'),
        showNavButton = document.getElementsByClassName('show-nav-button ');

    (function () {
        for (let i = 0; i < showNavButton.length; i++) {
            EventUtil.addHandler(showNavButton[i], 'click', function() {
                ClassUtil.toggleClass(navFirst[i], 'show-nav-animatiton');
            });
        }
    })();
})();
    

/**
 * @author zwb
 * @description 将所做的js包在整个函数内部，避免用完后变量成为全局变量。
 */
(function() {
    /**
     * @version 1.0
     * @author
     * @description 将选择的时间段区域进行展开或者缩小，当宽度为560时候缩小，当宽度为0时候展开。由于弹出串口没有做到适应窗口大小，所以还未定稿
     */
    function dateAreaAnimate() {
        if ($('.date-switch-container').css('width') == '560px') {
            $('.date-switch-container').animate({
                width: '48px'
            }, 250 ,function() {
                $('.part-right .switch-mode img:eq(0)').attr('src', '../images/icon_time.png');
            });
        } else {
            $('.date-switch-container').animate({
                width: '560px'
            }, 250, function() {
                $('.part-right .switch-mode img:eq(0)').attr('src', '../images/icon_cross_large_normal.png');
            });
        }
    }

/**
 * @description 时间段处理模块
 */
(function getQuantumTimeModel() {
    /**
     * @version 1.0
     * @description 对于选择时间段的下拉栏的显示
     * @param {jQuery Object} 列表对象
     */
    function showList(listTarget) {
        if (ClassUtil.hasClass(listTarget, 'down-list-transform') == false) {  // 只有不在显示状态时候才能够进行消失
            listTarget.style.display = 'block';
            // 设置超时调用，避免没有出现动画效果
            setTimeout(function() {
                ClassUtil.addClass(listTarget, 'down-list-transform');
            }, 20);
        }
    }

    /**
     * @description 将下拉框消失
     * @param {*} downList 下拉框dom结点的对象引用
     */
    function hiddenDownList(downList) {
        if (ClassUtil.hasClass(downList, 'down-list-transform') == true) {
            ClassUtil.removeClass(downList, 'down-list-transform');
            setTimeout(function() {
                downList.style.display = 'none';
            }, 400);
        }
    }

    /**
     * @description 更新选择日期的下拉栏
     * @param {String} containerClassName 下拉栏的类名start-date-list或者end-date-list
     * @param {String} dateString 数据类型为2008/09/05的日期
     */
    function dateChoiceAreaRenew(containerClassName ,dateString) {
        var i,
            dateNumber,
            year = dateString.split('/')[0],
            month = dateString.split('/')[1],
            maxDate,
            currentDate = new Date();

        $('.'+ containerClassName +' .choice-date-container')[0].innerHTML = '';  // 日期片段初始化
        $('.'+ containerClassName +' .year-select-switch span')[0].innerText = year + '年';
        $('.'+ containerClassName +' .month-select-switch span')[0].innerText = month + '月';
        dateNumber = parseInt(dateString.split('/')[2]);
        /* 以下代码块是初始化日历主体内容 */
        date = new Date(dateString.split('/')[0], dateString.split('/')[1], 1);  // 获得这个月第一天是星期几
        for (i = 0; i < parseInt(date.getDay()); i++) {
            $('.'+ containerClassName +' .choice-date-container')[0].innerHTML += '<b></b>';
        }

        date.setMonth(parseInt(dateString.split('/')[1]));    // 判断这个月最多有几天
        date.setDate(0);
        maxDate = date.getDate();

        if (year == currentDate.getFullYear() && month == (currentDate.getMonth() + 1)) {
            maxDate = currentDate.getDate();
        }

        for (i = 1; i <= maxDate; i++) {
            $('.'+ containerClassName +' .choice-date-container')[0].innerHTML += '<li>'+ i +'</li>';
        }
        $('.'+ containerClassName +' .choice-date-container li:eq('+ (dateNumber-1) +')').attr('class', 'date-choiced');  // 初始化已经选择的日期
        $('.'+ containerClassName +' .choice-date-container').attr('choice-number', dateNumber-1);   // 标记已经选择的日期
    }

    /**
     * @description 对时间下拉的初始化
     * @param {String} containerClassName 容器的类名
     * @param {String} timeString 时间的字符串，格式为09:34
     */
    function timeChoiceAreaRenew(containerClassName, timeString) {
        $('.'+ containerClassName +' .hours-switch span')[0].innerText = timeString.split(':')[0] + '时';
        $('.'+ containerClassName +' .minutes-switch span')[0].innerText = timeString.split(':')[1] + '分';
    }

    /**
     * @version 1.0
     * @description 选择时间段的延伸栏的事件监听
     * @param {object} event 事件对象
     */
    function dateContainerListen(event) {
        switch(event.target) {
            case $('.date-container div div')[0]: {
                showList($('.start-date-list')[0]);
                dateChoiceAreaRenew('start-date-list', $(event.target).prev()[0].innerText);   // 初始化日历
                break;
            }

            case $('.date-container div div')[1]: {
                showList($('.start-time-list')[0]);
                timeChoiceAreaRenew('start-time-list', $(event.target).prev()[0].innerText);
                break;
            }

            case $('.date-container div div')[2]: {
                showList($('.end-date-list')[0]);
                dateChoiceAreaRenew('end-date-list', $(event.target).prev()[0].innerText);   // 初始化日历
                break;
            }

            case $('.date-container div div')[3]: {
                showList($('.end-time-list')[0]);
                timeChoiceAreaRenew('end-time-list', $(event.target).prev()[0].innerText);
                break;
            }
        }
    }

    /**
     * @version 1.0
     * @description 对选择下拉选择框内容的选择年份，选择月份进行监听
     * @param {Object} event 事件监听对象 
     */
    function dateSelectListListen(event) {
        var year = parseInt($(event.target).parents('.date-list')[0].getElementsByTagName('span')[0].innerText),
            month = parseInt($(event.target).parents('.date-list')[0].getElementsByTagName('span')[1].innerText),
            number = parseInt(event.target.innerText),
            // currentDate = new Date(),
        
        month = month < 10? '0' + month : month;
        number = number < 10? '0' + number : number;
        event.stopPropagation();

        /* 进行监听时候，更改年份或者月份,并且将点击选择具体日期进行刷新更改 */
        if ($(event.target).parent('ul').attr('class') == 'year-select-list') {
            year = number;      
            month = '01'; // 选择年份后，月份默认为
            $(event.target).parents('.date-list')[0].getElementsByClassName('year-select-switch')[0].getElementsByTagName('span')[0].innerText = number + '年';
            $(event.target).parents('.date-list')[0].getElementsByClassName('month-select-switch')[0].getElementsByTagName('span')[0].innerText = '01月';
            dateChoiceAreaRenew($(event.target).parents('.date-list').attr('class').split(' ')[1], year + '/' + month + '/' + 1);  // 对下拉列表中的点击选择区域进行初始化
        } else {
            month = number;
            $(event.target).parents('.date-list')[0].getElementsByClassName('month-select-switch')[0].getElementsByTagName('span')[0].innerText = number + '月';
            dateChoiceAreaRenew($(event.target).parents('.date-list').attr('class').split(' ')[1], year + '/' + month + '/' + 1);
        }
        /* 对日期下拉表进行隐藏 */
        hiddenDownList($(event.target).parents('.scroll-cut')[0]);
    }

    /**
     * @description 对时间下拉表进行监听
     * @param {object} event 监听事件对象
     */
    function timeSelectListListen(event) {
        var i;
        event.stopPropagation();  // 阻止事件继续冒泡
        // console.log($(event.target).parents('time-switch-container')[0])
        /* 选择列表 */
        if (event.target.tagName == 'LI') {
            var text = parseInt(event.target.innerText);
            text = text < 10? '0' + text : text;
            if ($(event.target).parent('ul').attr('class') == 'hours-select-list') {
                $(event.target).parents('.time-switch-container')[0].getElementsByTagName('span')[0].innerText = text + '时';
                $(event.target).parents('.time-switch-container')[0].getElementsByTagName('span')[1].innerText = '0分';
            } else {
                $(event.target).parents('.time-switch-container')[0].getElementsByTagName('span')[1].innerText = text + '分';
            }
        }
        hiddenDownList($(event.target).parents('.time-scroll-cut')[0]);  // 选择完成后隐藏该下拉栏
    }

    /**
     * @description 下拉列表的年份初始化，由于年份第一次初始化后，并不会发生改变，所以只是执行一次就够了
     */
    (function() {
        var date = new Date(),
            year = date.getFullYear(),
            i;
        // console.log(year)
        for (i = year; i >= 1960; i--) {
            $('.year-select-list')[0].innerHTML += '<li>'+ i +'年</li>';
            $('.year-select-list')[1].innerHTML += '<li>'+ i +'年</li>';
        }
    })();

    /**
     * @description 对月份的下拉表进行初始化，点击下拉时候会用到
     * @param {object} monthSelect 月份下拉框的对象
     */
    function monthSelectRenew(monthSelect) {
        var i,
            time = new Date(),
            year = parseInt($(monthSelect).parents('.choice-year-month-select-container')[0].getElementsByTagName('span')[0].innerText),
            monthNumber;

        /* 若是当年，则不可过当月 */
        if (year == time.getFullYear()) {
            monthNumber = time.getMonth() + 1;
        } else {
            monthNumber = 12;
        }

        monthSelect.innerHTML = '';
        for (i = 1; i <= monthNumber ; i++) {
            monthSelect.innerHTML += '<li>'+ i +'月</li>'
        }
    }

    /**
     * @description 对小时下拉框进行初始化
     * @param {object} hoursSelect 小时下拉框对象
     */
    function hoursSelectRenew(hoursSelect) {
        var i;
        hoursSelect.innerHTML = '';

        for (i = 0; i < 24; i++) {
            hoursSelect.innerHTML += '<li>'+ i +'时</li>';
        }
    }

    /**
     * @description 对分钟框进行初始化
     * @param {object} minutesSelect 选择分钟的下拉框对象
     */
    function minutesSelectRenew(minutesSelect) {
        var i;
            minutesSelect.innerHTML = '';

        for (i = 0; i < 60; i++) {
            minutesSelect.innerHTML += '<li>'+ i +'分</li>';
        }
    }

    /**
     * @version 1.0
     * @description 限制终止选择时间的上限，先将传回的分钟数化为其它单位，然后一个单位一个单位进行比较
     * @param {Number} minutes 查询最大的分钟数。
     */
    function endTimeCheck() {
        var startDate = $('#start-date span')[0].innerText.split('/'),
            startTime = $('#start-time span')[0].innerText.split(':'),
            endDate = $('#end-date span')[0].innerText.split('/'),
            endTime = $('#end-time span')[0].innerText.split(':'),
            startFullTime = startDate[0] + startDate[1] + startDate[2] + startTime[0] + startTime[1],
            endFullTime = endDate[0] + endDate[1] + endDate[2] + endTime[0] + endTime[1];
            // spanHours = parseInt(minutes / 60),
            // spanMinutes = minutes % 60;
            /* 默认跨度的最大上限是一天，只要超过一天，则会将上限的日期化为跟下限日期一样 */
            if (startFullTime > endFullTime) {
                $('#end-date span')[0].innerText = $('#start-date span')[0].innerText;
                $('#end-time span')[0].innerText = $('#start-time span')[0].innerText;
            }
    }

    /**
     * @description 对下拉列表进行事件监听
     * @param {Object} event 选择日期的下拉列表的事件监听
     */
    function dateDownListListen(event) {
        var i;
        /* 阻止事件被传播，防止document监听到事件使这个下拉表消失 */
        event.stopPropagation();

        /* 选择日期 */
        if (event.target.tagName == 'LI' && typeof $(event.target).parent('.choice-date-container')[0] !== 'undefined') {
            var choicedNumber = parseInt($(event.target).parent('div').attr('choice-number'));
            $(event.target).parent('div').attr('choice-number', parseInt(event.target.innerText) - 1);
            if (choicedNumber !== 'undefined') {
                $(event.target).parent('div').children('li:eq('+ choicedNumber +')').removeClass('date-choiced');
            }
            $(event.target).addClass('date-choiced');
        }
        
        switch($(event.target).attr('class')) {
            /* 按取消键 */
            case 'cancel': {
                hiddenDownList($(event.target).parents('.date-list')[0]);
                break;
            }
            
            /* 按确定键 */
            case 'certain': {
                var dateSpan,
                    year = parseInt($(event.target).parents('.date-list')[0].getElementsByTagName('span')[0].innerText),
                    month = parseInt($(event.target).parents('.date-list')[0].getElementsByTagName('span')[1].innerText),
                    date = (parseInt($(event.target).parents('.date-list').children('.choice-date-container').attr('choice-number')) + 1);

                month = month < 10?'0' + month : month;
                date = date < 10? '0' + date : date;
                if (ClassUtil.hasClass($(event.target).parents('.date-list')[0], 'start-date-list') == true) {  // 当它是起始时间段的时候
                    dateSpan = $('#start-date span')[0];
                } else {
                    dateSpan = $('#end-date span')[0];
                }
                /* 将时间填满 */
                dateSpan.innerText = year
                                    + '/' 
                                    + month
                                    + '/'
                                    + date;
                hiddenDownList($(event.target).parents('.date-list')[0]);  // 隐藏下拉表
                endTimeCheck();
                break;
            }
        }

        switch($(event.target).parent('div').attr('class')) {
            /* 点击选择年份 */
            case 'year-select-switch': {
                showList($(event.target).parents('.date-list')[0].getElementsByClassName('scroll-cut')[0]);
                break;
            }

            /* 选择月份 */
            case 'month-select-switch': {
                showList($(event.target).parents('.date-list')[0].getElementsByClassName('scroll-cut')[1]);
                monthSelectRenew($(event.target).parents('.date-list')[0].getElementsByClassName('month-select-list')[0]);
                break;
            }
        }

        /* 点击到时间下拉表，对年份或者月份下拉表进行隐藏，这一步是因为将事件冒泡阻止了 */
        for (i = 0; i < 4; i++) {
            hiddenDownList($('.scroll-cut')[i]);
        }
    }

    /**
     * @description 选择时间下拉表的事件监听
     * @param {object} event 事件对象
     */
    function timeDownListListen(event) {
        var i;
        event.stopPropagation();  // 阻止事件传播

        switch($(event.target).parent('div').attr('class')) {
            /* 当选择的是分钟，展示分钟下拉框 */
            case 'minutes-switch': {
                showList($(event.target).parents('.time-switch-container')[0].getElementsByClassName('time-scroll-cut')[1]);
                break;
            }

            /* 选择的是小时，展示小时下拉框 */
            case 'hours-switch' : {
                showList($(event.target).parents('.time-switch-container')[0].getElementsByClassName('time-scroll-cut')[0]);
                break;
            }
        }

        switch($(event.target).attr('class')) {
            /* 按取消键 */
            case 'cancel': {
                hiddenDownList($(event.target).parents('.time-list')[0]);
                break;
            }

            /* 按确定键 */
            case 'certain': {
                var minutes = parseInt($(event.target).parents('.time-list')[0].getElementsByTagName('span')[1].innerText),
                    hours = parseInt($(event.target).parents('.time-list')[0].getElementsByTagName('span')[0].innerText),
                    timeSpan = null;

                minutes = minutes < 10 ? '0' + minutes : minutes;
                hours = hours < 10 ? '0' + hours : hours;
                
                if (ClassUtil.hasClass($(event.target).parents('.time-list')[0], 'start-time-list')) {
                    timeSpan = $('#start-time span')[0];
                } else {
                    timeSpan = $('#end-time span')[0];
                }

                timeSpan.innerText = hours + ':' + minutes;
                hiddenDownList($(event.target).parents('.time-list')[0]);
                endTimeCheck();
                break;
            }
        }
 
        /* 点击到时间下拉表，对分钟或者小时下拉表进行隐藏，这一步是因为将事件冒泡阻止了 */
        for (i = 0; i < 4; i++) {
            hiddenDownList($('.time-scroll-cut')[i]);
        }
    }


    /* 添加事件监听区域 */
    EventUtil.addHandler($('.date-container')[0], 'click', dateContainerListen);
    EventUtil.addHandler(document, 'click', function() {
        var i;

        /* 对所有下拉栏进行隐藏 */
        for (i = 0; i < 2; i++) {
            hiddenDownList($('.date-list')[i]);
            hiddenDownList($('.time-list')[i]);
        }
        for (i = 0; i < 4; i++) {
            hiddenDownList($('.time-scroll-cut')[i]);
            hiddenDownList($('.scroll-cut')[i]);
        }
    })
    for (i = 0; i < 4; i++) {
        EventUtil.addHandler($('.scroll-cut')[i], 'click', dateSelectListListen);
        EventUtil.addHandler($('.time-scroll-cut')[i], 'click', timeSelectListListen);
    }

    for (i = 0; i < 2; i++) {
        EventUtil.addHandler($('.time-list')[i], 'click', timeDownListListen);
        EventUtil.addHandler($('.date-list')[i], 'click', dateDownListListen);
    }
    /* 初始化小时和分钟下拉框 */
    hoursSelectRenew($('.hours-select-list')[0]);
    hoursSelectRenew($('.hours-select-list')[1]);
    minutesSelectRenew($('.minutes-select-list')[0]);
    minutesSelectRenew($('.minutes-select-list')[1]);
})();


    /**
     * @version 1.0
     * @author
     * @description 对右边地图悬浮的标签部分进行事件监听
     * @param {object} event 事件监听对象 
     */
    function partRightClickListen(event) {
        var i;

        switch(event.target) {
            /* 切换选择时间段的区域的展示或者收缩 */
            case $('.part-right .switch-mode img')[0]: {
                if ($('.date-switch-container').is(':animated') == true) {
                    return;
                }
                dateAreaAnimate();
                break;
            }

            /* 切换热力图 */
            case $('.switch-box li img')[0]: {
                // 调用切换热力图的函数
                // realTimeHeatmapRequest();
                timeQuantumHeatmapRequest();
                break;
            }

            /* 取某个点的经纬度 */
            case $('.switch-box li img')[1]: {
                geolocation.getCurrentPosition(); 
                break;
            }
        }
        // 点击时间右边的箭头后，将箭头进行旋转。
    }

    /**
     * @version 1.0
     * @description 对于数据展示区域的点击事件进行监听
     * @param {object} event 事件对象
     */
    function dataShowContainerClickListen(event) {
        switch(event.target) {
            /* 关闭数据展示层 */
            case $('#close-show')[0]: {
                $('.panel-right-container').css('z-index', '0');
                break;
            }

            case $('.left-arrow')[0]: {
                // 左箭头触发事件
                break;
            }

            case $('.right-arrow')[0]: {
                // 右箭头触发事件
                break;
            }
            
        }
    }


    EventUtil.addHandler($('.part-right')[0], 'click', partRightClickListen);
    EventUtil.addHandler($('#close-show')[0], 'click', dataShowContainerClickListen);
    // EventUtil.addHandler()
})();

/**
 * @version 1.0 
 * @description 实时更新热力图的请求函数
 */
function realTimeHeatmapRequest() {
    var jsonObj = {},
        container = $('#map-container')[0],
        leftTop = map.containTolnglat(new AMap.Pixel(0.000001, 0.000001)),   // 左上角坐标
        rightBottom = map.containTolnglat(new AMap.Pixel(container.clientWidth, container.clientHeight));    // 右下角坐标
        time = new Date();

        
    jsonObj.leftTopLon = leftTop.getLng();
    jsonObj.leftTopLat = leftTop.getLat();
    jsonObj.rightBottomLon = rightBottom.getLng();
    jsonObj.rightBottomLat = rightBottom.getLat();
    jsonObj.currentTime = window.currentDate + (time.getHours() < 0? '0' + time.getHours():time.getHours())
                                             + ':' + (time.getMinutes() < 10? '0' + time.getMinutes(): time.getMinutes())
                                             + ':' + (time.getSeconds() < 10? '0' + time.getSeconds():time.getSeconds());
    
    $.ajax({
        url: 'http://'+ window.ip +':8080/qgtaxi/maps/liveheatmap',
        type: 'post',
        data: JSON.stringify(jsonObj),
        dataType: 'json',
        processData: false,
        contentType: 'application/json',
        success: function(responseObj) {
            heatmapDisplay(responseObj)
        },
        error: function() {
            alert('失败');
        }
        });
}

/**
 * @version 1.0
 * @description 某一段时间内的热力图的展示的请求函数
 */
function timeQuantumHeatmapRequest() {
    var jsonObj = {},
        container = $('#map-container')[0],
        leftTop = map.containTolnglat(new AMap.Pixel(0.000001, 0.000001)),   // 左上角坐标
        rightBottom = map.containTolnglat(new AMap.Pixel(container.clientWidth, container.clientHeight));    // 右下角坐标
    
    /* 判断是否选择日期 */
    if ($('#start-date span')[0].innerText.slice(0,1) == '-' || $('#start-time span')[0].innerText.slice(0,1) == '-') {
        console.log('请选择日期');
        return;
    }

    jsonObj.leftTopLon = leftTop.getLng();
    jsonObj.leftTopLat = leftTop.getLat();
    jsonObj.rightBottomLon = rightBottom.getLng();
    jsonObj.rightBottomLat = rightBottom.getLat();
    jsonObj.startTime = $('#start-date span')[0].innerText.replace(/\//g, '-') + ' ' + $('#start-time span')[0].innerText + ':00';
    jsonObj.endTime = $('#start-date span')[0].innerText.replace(/\//g, '-') + ' ' + $('#end-time span')[0].innerText + ':00';
    $.ajax({
        url: 'http://'+ window.ip +':8080/qgtaxi/maps/querymap',
        type: 'post',
        data: JSON.stringify(jsonObj),
        dataType: 'json',
        processData: false,
        contentType: 'application/json',
        success: function(responseObj) {
            console.log('时间段')
            console.log(JSON.stringify(responseObj));
            heatmapDisplay(responseObj)
        },
        error: function() {
            alert('失败');
        }
        });
}

/**
 * @version 1.0
 * @description 将传回的数据显示出来。
 * @param {Objec} jsonObj 传回的数据对象
 */
function heatmapDisplay(jsonObj) {
    var pointSet = jsonObj.pointSet,
        i,
        list = [],
        heatmap = null;

    map.plugin(["AMap.Heatmap"], function() {
            //初始化heatmap对象
            heatmap = new AMap.Heatmap(map, {
                radius: 15, //给定半径
                opacity: [0, 0.8],
                gradient:{
                    0.5: 'blue',
                    0.65: 'rgb(117,211,248)',
                    0.7: 'rgb(0, 255, 0)',
                    0.9: '#ffea00',
                    1.0: 'red'
                },
            });
    });

    for (i = 0; i < pointSet.length; i++) {
        list.push({
            lng: pointSet[i].lon,
            lat:pointSet[i].lat,
            count: pointSet[i].weight
        });
    }
    console.log(list);
    heatmap.setDataSet({
        data: list
    });
}