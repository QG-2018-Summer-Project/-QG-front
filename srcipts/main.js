
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
     * @version 1.0
     * @description 对于选择时间段的下拉栏的显示
     * @param {Object} clickTarget 点击想要选择的时间段的事件对象
     * @param {Number} rightLocation 绝对元素的相对于右边屏幕的位置
     * @param {'date'/'time'} type 显示框的类型，日期选择框或者时间选择框
     */
    function showList(clickTarget, rightLocation, type) {
        var text = $(clickTarget).prev()[0].innerText,
            i;
        
        if (type === 'date') {
            var date;
            $('.choice-date-container')[0].innerHTML = '';
            /* 下拉框的初始化 */
            $('.year-select-switch span')[0].innerText = text.split('/')[0] + '年';
            $('.month-select-switch span')[0].innerText = text.split('/')[1] + '月';
            date = new Date(text.split('/')[0], text.split('/')[1], 1);
            console.log(date.getDay())
            for (i = 0; i < parseInt(date.getDay()); i++) {
                $('.choice-date-container')[0].innerHTML += '<b></b>';
            }
            date.setMonth(parseInt(text.split('/')[1]));
            date.setDate(0);
            console.log(date.getDate())
            for (i = 1; i <= parseInt(date.getDate()); i++) {
                $('.choice-date-container')[0].innerHTML += '<li>'+ i +'</li>';
            }
            // for (i = 1; i < )

            $('.date-choice').css('right', rightLocation.toString() + 'px');
            $('.date-choice').css('display', 'block');
            // 设置超时调用，避免没有出现动画效果
            setTimeout(function() {
                ClassUtil.toggleClass($('.date-choice')[0], 'down-list-transform');
            }, 20);
        } else {
            // 时间选择区域的显示动画
        }
    }

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
                timeQuantumHeatmapRequest()
                break;
            }

            /* 取某个点的经纬度 */
            case $('.switch-box li img')[1]: {
                geolocation.getCurrentPosition(); 
                break;
            }
        }
        // 点击时间右边的箭头后，将箭头进行旋转。
        for (i = 0; i < 4; i++) {
            if (event.target == $('.static')[i]) {
                ClassUtil.toggleClass($('.static')[i], 'dropdown-transform');
                continue;  // 将点击的块旋转，然后直接跳过这一步,进入下一步，避免改块被切回原来的状态
            }
            $('.static')[i].className = 'static';       // 将其他的标签切换到原来状态
        }
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

    /**
     * @version 1.0
     * @description 选择时间段的延伸栏的事件监听
     * @param {object} event 事件对象
     */
    function dateContainerListen(event) {
        switch(event.target) {
            case $('.date-container div div')[0]: {
                showList(event.target, 380, 'date');
                break;
            }

            case $('.date-container div div')[1]: {
                
                break;
            }

            case $('.date-container div div')[2]: {
                showList(event.target, 110, 'date');
                break;
            }

            case $('.date-container div div')[3]: {
                
                break;
            }
        }
    }

    EventUtil.addHandler($('.date-container')[0], 'click', dateContainerListen);
    EventUtil.addHandler($('.part-right')[0], 'click', partRightClickListen);
    EventUtil.addHandler($('#close-show')[0], 'click', dataShowContainerClickListen);
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
    
    jsonObj.leftTopLon = leftTop.getLng();
    jsonObj.leftTopLat = leftTop.getLat();
    jsonObj.rightBottomLon = rightBottom.getLng();
    jsonObj.rightBottomLat = rightBottom.getLat();
    jsonObj.currentTime = '2017-02-01 09:48:16';
    
    $.ajax({
        url: 'http://'+ window.ip +':8080/qgtaxi/maps/liveheatmap',
        type: 'post',
        data: JSON.stringify(jsonObj),
        dataType: 'json',
        processData: false,
        contentType: 'application/json',
        success: function(responseObj) {
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
 * @description 某一段时间内的热力图的展示的请求函数
 */
function timeQuantumHeatmapRequest() {
    var jsonObj = {},
        container = $('#map-container')[0],
        leftTop = map.containTolnglat(new AMap.Pixel(0.000001, 0.000001)),   // 左上角坐标
        rightBottom = map.containTolnglat(new AMap.Pixel(container.clientWidth, container.clientHeight));    // 右下角坐标
    
    jsonObj.leftTopLon = leftTop.getLng();
    jsonObj.leftTopLat = leftTop.getLat();
    jsonObj.rightBottomLon = rightBottom.getLng();
    jsonObj.rightBottomLat = rightBottom.getLat();
    jsonObj.startTime = '2017-02-01 09:28:16';
    jsonObj.endTime = '2017-02-01 09:48:16'
    console.log('时间段数据'+ JSON.stringify(jsonObj));
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
                radius: 25, //给定半径
                opacity: [0, 0.8]
            });
    });

    for (i = 0; i < pointSet.length; i++) {
        list.push({
            lng: pointSet[i].lon,
            lat:pointSet[i].lat,
            count: pointSet[i].weight
        });
    }
    heatmap.setDataSet({
        data: list
    });
}