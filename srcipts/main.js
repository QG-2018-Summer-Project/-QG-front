/**
 * 异步加载地图
 */
(function() {
    var url = 'https://webapi.amap.com/maps?v=1.4.8&key=38db8101e26b0719fd8148bd78bde6f9&callback=loadMap',
         UIurl = 'https://webapi.amap.com/ui/1.0/main.js?v=1.0.11',
        jsapi = document.createElement('script'),
        ui = document.createElement('script');
        
   
    jsapi.src = url;
   
    //加载地图js文件
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
            rotateEnable: true,
            isHotspot: true,
        });
        //异步加载插件
        AMap.plugin(['AMap.ToolBar', 'AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Geolocation', 'AMap.ControlBar', 'AMap.Driving'], pluginOptions);
        //启动UI
        // activeUI();
        //初始化定位
        geolocation.getCurrentPosition(); 
        //开启地图热点功能
        activeHotSpot();
   }, 1500);
}

/**
 * 地图热点功能
 */
function activeHotSpot() {
    var placeSearch = new AMap.PlaceSearch({
        city: "广州",
        citylimit: true,
        autoFitView: true
    });
    var clickEventListener = map.on('hotspotclick', function(e) {
        console.log('定位成功:' + '[' + e.lnglat.getLng() + ',' + e.lnglat.getLat() + ']');
        map.setZoomAndCenter(17, [e.lnglat.getLng(), e.lnglat.getLat()]);
        
        placeSearch.getDetails(e.id, function(status, result) {
            console.log(result);
            if (status === 'complete' && result.info === 'OK') {
                //开启信息窗口
                var poiInfo = result.poiList.pois[0];
                
                showInfoWindow(poiInfo.name, poiInfo.location);
                
            } 
        });
    });
}
function setStartContent(content) {
    var startInput = document.getElementById('start-input');
    startInput.value = content;
}
function setEndContent(content) {
    var endInput = document.getElementById('end-input');
    endInput.value = content;
}

/**
 * 展示详细信息窗口功能
 * @param {string} content 
 * @param {object} location 
 */
function showInfoWindow(content, location) {
    
    var infoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        content:    '<div id="info-box"><div id="close-container"><button id="close-button">x</button></div>' +
                    '<p id="content">'+ content + '</p>' +                    
                    '<div class="set-button-container">' +
                    '<button id="start-button" class="set-button">设为起点</button>' +
                    '<button id="end-button" class="set-button">到这里去</button></div></div>',
        offset: new AMap.Pixel(-2, -22) //left: -2, top: -20
    });
    
    
    infoWindow.open(map, location);
        
    //手动异步

    setTimeout(() => {
        var closeButton = document.getElementById('close-button'),
            startButton = document.getElementById('start-button'),
            endButton = document.getElementById('end-button');

        EventUtil.addHandler(startButton, 'click', function() {
            selectMarker(0);
            setStartContent(content);
            EventUtil.removeHandler(startButton, 'click');
        });
        EventUtil.addHandler(endButton, 'click', function() {
            selectMarker(1);
            setEndContent(content);
            EventUtil.removeHandler(endButton, 'click');
        });
        EventUtil.addHandler(closeButton, 'click', function() {
            selectMarker();
            EventUtil.removeHandler(closeButton, 'click');
        });
    }, 0);
    /**
     * 点击不同的按钮有不同的图标
     * @param {int} type 
     */
    function selectMarker(type) {
        switch(type) {
            case 0: { //设置为起点
                if (map.hasOwnProperty('startMarker')) {
                    map.remove(map.startMarker);
                } 
                if (map.hasOwnProperty('selectMarker')) {
                    map.remove(map.selectMarker);
                } 
                if (map.hasOwnProperty('endMarker')) {
                    map.remove(map.endMarker);
                }
                //把点加到地图对象上
                map.startMarker = addMarker(location, -9, -3);
                infoWindow.close();
                break;
            } case 1: { //设置为终点
                if (map.hasOwnProperty('startMarker')) {
                    map.remove(map.startMarker);
                } 
                if (map.hasOwnProperty('endMarker')) {
                    map.remove(map.endMarker);
                }
                if (map.hasOwnProperty('selectMarker')) {
                    map.remove(map.selectMarker);
                }
                map.endMarker = addMarker(location, -97, -3);
                //开始导航
                startRoute(map.startMarker.getPosition(), location);
                infoWindow.close();
                break;
            } default: {
                infoWindow.close();
            }
        }
    }
}

function startRoute(start, end) {
    var driving = new AMap.Driving({
        map: map,
        hideMarkers: true,
        showTraffic: false,
        extensions: 'all',
        outlineColor: 'black',
        Policy: 0
    }); 

    // driving.setPolicy(1);
    // driving.setPolicy(2);
    // driving.setPolicy(4);
    
    driving.search(start, end, function(status, result) {
        //driving.clear();
        if (status === 'no_data') {
            alert('没有结果');
        } else {
            console.log(result);
        }
    });

    
    
}

/**
 * 在地图上添加一个点
 * @param {*} location 
 * @param {*} offLeft 
 * @param {*} offTop 
 */
function addMarker(location, offLeft, offTop) {
    var marker = new AMap.Marker({
        position: location,
        animation: 'AMAP_ANIMATION_DROP',
        map: map,

        icon: new AMap.Icon({            
            size: new AMap.Size(25, 34),  //图标大小
            image: "../images/poi-marker.png",
            imageSize: [437, 267],
            imageOffset: new AMap.Pixel(offLeft, offTop)
        }) 
    });
    

    AMap.event.addListener(marker, 'click', function() {
        
    });
    return marker;
}

/**
 * 轨迹巡航配置
 */

function activeUI() {
    

    AMapUI.loadUI(['misc/PathSimplifier'], function(PathSimplifier) {
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
                    [100.340417, 27.376994],
        
                    [108.426354, 37.827452],
                    [113.392174, 31.208439],
                    [124.905846, 42.232876],
                    [113.32703, 23.132175],
                    [113.393116, 23.039404]
                ]
            }, 
        ]);

        //创建一个巡航器
        var navg0 = pathSimplifierIns.createPathNavigator(0, //关联第1条轨迹
            {
                loop: false, //循环播放
                speed: 1000000
            });

        //navg0.start();
        // pathSimplifierIns.hide();
    }
}

/**
 * 插件的选项
 */
function pluginOptions() {
    //定位插件
    window.geolocation = new AMap.Geolocation({
        //enableHighAccuracy: true, //使用高精度定位
        timeout: 10000, //超过10秒后停止定位，默认：无穷大
        showButton: false,
        zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见
    });

    map.addControl(geolocation);
    AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
    AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息

    //解析定位结果
    function onComplete(data) {
        // var str = ['定位成功'];
        // str.push('经度：' + data.position.getLng());
        // str.push('纬度：' + data.position.getLat());
        // if (data.accuracy) {
        //     str.push('精度：' + data.accuracy + ' 米');
        // } //如为IP精确定位结果则没有精度信息
        // str.push('是否经过偏移：' + (data.isConverted ? '是' : '否'));
        console.log('定位成功');
    }
    //解析定位错误信息
    function onError(data) {
       console.log('定位失败');
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
    
    //注册监听，当选中某条记录时会触发
    AMap.event.addListener(autoSearch, 'select', select);
    AMap.event.addListener(autoStart, 'select', select);
    AMap.event.addListener(autoEnd, 'select', select);
    
    function select(e) {
        console.log(e.poi);
        // 设置缩放级别和中心点
        map.setZoomAndCenter(14, [e.poi.location.lng, e.poi.location.lat]);
        //把搜索得出的marker加到地图上 
        map.selectMarker = new AMap.Marker({
            map: map,
            position: [e.poi.location.lng, e.poi.location.lat],
            animation: 'AMAP_ANIMATION_DROP',
        });
        AMap.event.addListener(map.selectMarker, 'click', function() {
            showInfoWindow(e.poi.name, map.selectMarker.getPosition());
            console.log(map.selectMarker.getPosition());
        });
    }

}

/**
 * 隐藏或者显示左面板功能
 */
(function () {    
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
     * @version 1.0
     * @author
     * @description 将选择的时间段区域进行展开或者缩小，当宽度为520时候缩小，当宽度为0时候展开。由于弹出串口没有做到适应窗口大小，所以还未定稿
     */    
(function() {
    
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

function analysisRouteData(data, index) {
    console.log(data);

    var route = [ //路径
        {
            index: index.toString(), //第几条路线
            steps: [ //要经历的步骤
                {
                    path: [ //此路段坐标集合
                        {

                        }
                    ],
                    start_location: {},
                    end_location: {},
                    time: "", //经过这个路段要多久
                }
            ],
            allTime: "", //高德地图预测的时间
            distance: "" //起点和终点之间的距离
        }
    ];
    route[0].allTime = data.time.toString();
    route[0].distance = data.distance.toString();

    for (let i = 0; i < data.steps.length; i++) {
        route[0].steps[i].path = [];

        route[0].steps[i].start_location = {
            lon: data.steps[i].start_location.lng,
            lat: data.steps[i].start_location.lat
        };
        route[0].steps[i].end_location = {
            lon: data.steps[i].end_location.lng,
            lat: data.steps[i].end_location.lat,
        };
        route[0].steps[i].time = data.steps[i].time.toString();

        route[0].steps.push({

        });
        for (let j = 0; j < data.steps[i].path.length; j++) {
            route[0].steps[i].path[j] = {
                lon: data.steps[i].path[j].lng,
                lat: data.steps[i].path[j].lat
            }
        }
    }
    //去除最后一个数组项
    route[0].steps.pop();
    console.log(route[0]);
}

