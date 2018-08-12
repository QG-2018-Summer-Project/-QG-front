/**
 * 异步加载地图
 */
(function() {
    var url = 'https://webapi.amap.com/maps?v=1.4.8&key=38db8101e26b0719fd8148bd78bde6f9&callback=loadMap',
        UIurl = 'https://webapi.amap.com/ui/1.0/main.js?v=1.0.11',
        jsapi = document.createElement('script');
        ui = document.createElement('script');
        
    //加载地图js文件
    jsapi.src = url;
    document.head.appendChild(jsapi);
    //加载UI文件
    ui.src = UIurl;
    document.head.appendChild(ui);
})();

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
       //启动UI
       activeUI();
    
      
   }, 1500);
}
/**
 * 轨迹巡航配置
 */
function activeUI() {
    
    AMapUI.load(['ui/misc/PathSimplifier'], function(PathSimplifier) {
        if (!PathSimplifier.supportCanvas) {
            alert('当前环境不支持 Canvas！');
            return;
        }
        //启动页面
        initPage(PathSimplifier);

    });

    function initPage(PathSimplifier) {
        //创建组件实例
        var pathSimplifierIns = new PathSimplifier({
            zIndex: 100,
            map: map, //所属的地图实例
            getPath: function (pathData, pathIndex) {
                //返回轨迹数据中的节点坐标信息，[AMap.LngLat, AMap.LngLat...] 或者 [[lng|number,lat|number],...]
                return pathData.path;
            },
            getHoverTitle: function (pathData, pathIndex, pointIndex) {
                //返回鼠标悬停时显示的信息
                if (pointIndex >= 0) {
                    //鼠标悬停在某个轨迹节点上
                    return pathData.name + '，点:' + pointIndex + '/' + pathData.path.length;
                }
                //鼠标悬停在节点之间的连线上
                return pathData.name + '，点数量' + pathData.path.length;
            },
            renderOptions: {
                //轨迹线的样式
                pathLineStyle: {
                    strokeStyle: 'red',
                    lineWidth: 6,
                    dirArrowStyle: true
                }
            }
        });

        //在这里设置数据
        pathSimplifierIns.setData([
            {
                name: '轨迹0',
                path: [
                    // [100.340417, 27.376994],
        
                    // [108.426354, 37.827452],
                    // [113.392174, 31.208439],
                    // [124.905846, 42.232876]
                    // [113.32703, 23.132175],
                    // [113.393116, 23.039404]
                ]
            }, 
        ]);

        //创建一个巡航器
        var navg0 = pathSimplifierIns.createPathNavigator(0, //关联第1条轨迹
            {
                loop: false, //循环播放
                speed: 1000000
            });

        navg0.start();
        // pathSimplifierIns.hide();
    }
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
        console.log(e.poi);
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
    
(function() {
    /**
     * @version 1.0
     * @author
     * @description 将选择的时间段区域进行展开或者缩小，当宽度为520时候缩小，当宽度为0时候展开。由于弹出串口没有做到适应窗口大小，所以还未定稿
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
     * @author
     * @description 对右边部分进行事件监听
     * @param {object} event 事件监听对象 
     */
    function partRightClickListen(event) {
        switch(event.target) {
            case $('.part-right .switch-mode img')[0]: {
                if ($('.date-switch-container').is(':animated') == true) {
                    return;
                }
                dateAreaAnimate();
                break;
            }
            case $('.part-right .switch-box img')[1]: {
                geolocation.getCurrentPosition(); //定位调用语句
                break;
            }
        }
    }

    EventUtil.addHandler($('.part-right')[0], 'click', partRightClickListen);
    
})();

