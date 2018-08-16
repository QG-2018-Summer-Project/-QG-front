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
(function clearInput() {
    var clearInputButton = document.getElementsByClassName('clear-input-button');
    
    EventUtil.addHandler(clearInputButton[0], 'click', function () {
        setStartContent("");
        if (map.hasOwnProperty('startMarker')) {
            map.remove(map.startMarker);
        }
    });
    EventUtil.addHandler(clearInputButton[1], 'click', function () {
        setEndContent("");
        if (map.hasOwnProperty('endMarker')) {
            map.remove(map.endMarker);
        }
    });
})();
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
    
    if ((map.startMarker.getPosition().lng === map.endMarker.getPosition().lng) && (map.startMarker.getPosition().lat === map.endMarker.getPosition().lat)) {
        alert('起点和终点不能相同！请重新选择!');
        map.remove(map.endMarker);
        return; 
    }
    
    console.log('起点' + map.startMarker.getPosition());
    console.log('终点' + map.endMarker.getPosition());


    window.driving = new AMap.Driving({
        hideMarkers: true,
        showTraffic: false,
        outlineColor: 'black',
        policy: 11
    }); 
    console.log(driving);

    driving.search(start, end, function(status, result) {
        //driving.clear();
        if (status === 'no_data') {
            alert('没有结果');
        } else {
            console.log(result);
            //清除所有的路线
            clearAllRoutes();
            var routes = result.routes;
            map.routes = [];
           
            
            //如果有多条路线，把他们全画出来，并且进行请求
            switch(routes.length) {
                case 1: {
                    //如果只有一条路线，直接画出来，不用请求
                    drawRoute(routes, 1);
                    break;
                } case 2: {
                    drawRoute(routes, 2);
                    break;
                } case 3: {
                    drawRoute(routes, 3);
                    break;
                }
            }
        }
    });
}
/**
 * 绘制路线
 * @param {*} routes 
 * @param {*} length 
 */
function drawRoute(routes, length) {
    //不同的路线颜色不相同
    var colors = [
        'blue',
        'red',
        'yellow'
    ];
    for (var i = 0; i < length; i++) {
        var route = routes[i],
            steps = route.steps,
            paths = [];

        for (let i = 0, step; i < steps.length; i++) {
            step = steps[i];
            paths = paths.concat(step.path);
        }
        if (paths.length > 0) {
            paths = [paths];
        }
        addOverlays(paths, colors[i]);
    }
    
}

function addOverlays(paths, color) {
    var _overlays = [];
    for (let i = 0, path; i < paths.length; i++) {
        path = new AMap.Polyline({
            map: map,
            path: paths[i],
            lineJoin: 'round',
            strokeColor: color, //线颜色
            strokeOpacity: 0.8, //styleOptions.strokeOpacity, //线透明度
            strokeWeight: 6, //线宽
            showDir: true,
            zIndex: 50, //默认zindex为50
            isOutline: true,
            outlineColor: '#fff',
        });
        _overlays.push(path);
    }
    //添加到map对象中
    map.routes.push(_overlays[0]);

    //绑定事件
    AMap.event.addListener(_overlays[0], 'click', selectRoute);

    console.log(map.routes);
    map.setFitView();
}
/**
 * 选择或者点击某条路线时的callback函数
 * @param {*} event 
 */
function selectRoute(event) {
    for (let i = 0; i < map.routes.length; i++) {
        map.routes[i].setOptions({
            zIndex: 50,
            strokeOpacity: 0.6, 
        });
    }
    event.target.setOptions({
        strokeOpacity: 1, 
        zIndex: 51
    });
}
function showRoutesPanel() {

}
/**
 * 清除所有路线
 */
function clearAllRoutes() {
    if (map.hasOwnProperty('routes')) {
        for (let i = 0; i < map.routes.length; i++) {
            map.remove(map.routes[i]);
        }
    } else {
        return;
    }
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
            };
        }
    }
    //去除最后一个数组项
    route[0].steps.pop();
    console.log(route[0]);
}

// me.addOverlays = function(walkPaths, busPaths, railwayPaths, styleOptions) {
//     var map = this.options.map;
//     styleOptions = styleOptions || {
//         strokeOpacity: 1
//     };
//     var _overlays = [];
    

//     //绘制乘车的路线
//     for (let i = 0, busPath; i < busPaths.length; i++) {
//         busPath = new AMap.Polyline({
//             map: map,
//             path: busPaths[i],
//             lineJoin: 'round',
//             strokeColor: "#0091ff", //线颜色
//             strokeOpacity: styleOptions.strokeOpacity, //线透明度
//             strokeWeight: 6 //线宽
//         });
//         busPath.isOfficial = true;
//         _overlays.push(busPath);
//     }
//     //绘制火车发站与到站之间的
//     for (let i = 0, railwayPath; i < railwayPaths.length; i++) {
//         railwayPath = new AMap.Polyline({
//             map: map,
//             path: railwayPaths[i],
//             strokeColor: "gray", //线颜色
//             strokeStyle: "dashed",
//             strokeOpacity: styleOptions.strokeOpacity, //线透明度
//             strokeWeight: 4 //线宽
//         });
//         railwayPath.isOfficial = true;
//         _overlays.push(railwayPath);
//     }
//     //绘制步行的路线
//     for (let i = 0, walkPath; i < walkPaths.length; i++) {
//         walkPath = new AMap.Polyline({
//             map: map,
//             path: walkPaths[i],
//             strokeColor: "gray", //线颜色
//             strokeStyle: "dashed",
//             strokeOpacity: styleOptions.strokeOpacity, //线透明度
//             strokeWeight: 6 //线宽
//         });
//         walkPath.isOfficial = true;
//         _overlays.push(walkPath);
//     }
//     return _overlays;
// };