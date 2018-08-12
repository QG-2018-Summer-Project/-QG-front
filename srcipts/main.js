var map = null;  // 地图的引用
/**
 * 异步加载地图
 */
window.onLoad  = function(){
    
    setTimeout(() => {
        //移除加载动画
        partRight.removeChild(loading);
            map = new AMap.Map('map-container', {
            zoom: 10,
            //广州市区的坐标
            center: [113.23, 23.13],
            
        });
        AMap.plugin(['AMap.ToolBar','AMap.Autocomplete'],function() {//异步加载插件
            var toolbar = new AMap.ToolBar({
                "direction": false,
                "position": "RB" //将插件置于右下方
            });
            map.addControl(toolbar);
            // 实例化Autocomplete
            var autoOptions = {
                //city 限定城市，默认全国
                city: '广州',
                input: ''
            };
            var autoComplete = new AMap.Autocomplete(autoOptions);
           
        });
    }, 2500);
};
var url = 'https://webapi.amap.com/maps?v=1.4.8&key=38db8101e26b0719fd8148bd78bde6f9&callback=onLoad',
    jsapi = document.createElement('script'),
    partRight = document.getElementsByClassName('panel-right-container')[0],
    loading = document.getElementsByClassName('loading-container')[0];

jsapi.charset = 'utf-8';
jsapi.src = url;
document.head.appendChild(jsapi);

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
    
        EventUtil.addHandler(showPanelButton, 'click', function () {
            ClassUtil.toggleClass(panel, 'hide-panel');
        });
    
        /**
         * 显示二级菜单
         */
        var navFirst = document.getElementsByClassName('nav-1'),
            showNavButton = document.getElementsByClassName('show-nav-button ');
    
        (function () {
            for (let i = 0; i < showNavButton.length; i++) {
                EventUtil.addHandler(showNavButton[i], 'click', function () {
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
                $('.part-right .switch-mode img:eq(0)').attr('src', '../images/icon_time.png')
            });
        } else {
            $('.date-switch-container').animate({
                width: '560px'
            }, 250, function() {
                $('.part-right .switch-mode img:eq(0)').attr('src', '../images/icon_cross_large_normal.png')
            });
        }
    }

    /**
     * @version 1.0
     * @author
     * @description 对右边部分进行事件监听
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
                // 点击某个地方，然后获得经纬度
                break;
            }
        }
        // 点击时间右边的箭头后，将箭头进行旋转。
        for (i = 0; i < 4; i++) {
            if (event.target == $('.static')[i]) {
                ClassUtil.toggleClass($('.static')[i], 'date-transform');
                continue;  // 将点击的块旋转，然后直接跳过这一步下一步，避免改块被切回原来的状态
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
// heatmapDisplay({
//     pointSet : [{
//         lon: 113.23,
//         lat: 23.13,
//         weight : 20
//     }] 
// });