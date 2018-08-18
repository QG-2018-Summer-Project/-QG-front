window.heatmap = null;
/**
 * 异步加载地图
 */
(function() {
    var url = 'https://webapi.amap.com/maps?v=1.4.8&key=38db8101e26b0719fd8148bd78bde6f9&callback=loadMap',
        jsapi = document.createElement('script');
   
    //加载地图js文件
    jsapi.src = url;
    document.head.appendChild(jsapi);
  
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
        AMap.plugin(['AMap.ToolBar', 'AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Geolocation', 'AMap.ControlBar', 'AMap.Driving', 'AMap.Heatmap', 'AMap.Geocoder'], pluginOptions);
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
        map.setZoomAndCenter(15, [e.lnglat.getLng(), e.lnglat.getLat()]);
        
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

/**
 * 设置起点输入内容
 * @param {string} content 
 */
function setStartContent(content) {
    var startInput = document.getElementById('start-input');
    startInput.value = content;
    clearInput();
}

/**
 * 设置终点输入内容
 * @param {string} content 
 */
function setEndContent(content) {
    var endInput = document.getElementById('end-input');
    endInput.value = content;
    clearInput();
}

/**
 * 清除起点和终点输入框的内容
 */
function clearInput() {
    var clearInputButton = document.getElementsByClassName('clear-input-button');
    
    EventUtil.addHandler(clearInputButton[0], 'click', function () {
        setStartContent("");
        if (map.hasOwnProperty('startMarker')) {
            map.remove(map.startMarker);
        }
        clearAllRoutes();
    });
    EventUtil.addHandler(clearInputButton[1], 'click', function () {
        setEndContent("");
        if (map.hasOwnProperty('endMarker')) {
            map.remove(map.endMarker);
        }
        clearAllRoutes();
    });
}

/**
 * 展示详细信息窗口功能
 * @param {string} content 
 * @param {object} location 
 */
function showInfoWindow(content, location) {
    // 避免重复点击重复打开窗口
    if (map.hasOwnProperty('infoWindow')) {
        if (map.infoWindow.getIsOpen()) {
            return;
        }
    }
    
    var infoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        content: '<div id="info-box"><div id="close-container"><button id="close-button">x</button></div>' +
        '<p id="content">'+ content + '</p>' +                    
        '<div class="set-button-container">' + 
        '<button id="start-button" class="set-button" >设为起点</button>' +
        '<button id="end-button" class="set-button">到这里去</button></div></div>',
        offset: new AMap.Pixel(-2, -22) //left: -2, top: -20
    });


    map.infoWindow = infoWindow;
    infoWindow.open(map, location);
    addInfoEvent(location, content);    
}

/**
 * 为按钮加上事件
 * @param {object} location 
 * @param {string} content
 */
function addInfoEvent(location, content) {
    function infoWindowListener(event) {
        switch(event.target) {
            case $('.amap-overlays button')[0]: {
                selectMarker(); 
                console.log(1);
                EventUtil.removeHandler(this, 'click', infoWindowListener);
                break;
            } case $('.amap-overlays button')[1]: {
                selectMarker(0, location);
                setStartContent(content);
                EventUtil.removeHandler(this, 'click', infoWindowListener);             
                break;
            } case $('.amap-overlays button')[2]: {
                selectMarker(1, location);
                setEndContent(content);
                EventUtil.removeHandler(this, 'click', infoWindowListener);
                break;
            } 
            
        }
    }
    EventUtil.addHandler($('.amap-overlays')[0], 'click', infoWindowListener);
    
    function selectMarker(type, location) {
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
                clearAllRoutes();
                map.clearInfoWindow();
                break;
            } case 1: { //设置为终点
                if (map.hasOwnProperty('endMarker')) {
                    map.remove(map.endMarker);
                }
                if (map.hasOwnProperty('selectMarker')) {
                    map.remove(map.selectMarker);
                }
                map.endMarker = addMarker(location, -97, -3);
                startRoute();
                map.clearInfoWindow();
                break;
            } default: {
                map.clearInfoWindow();
            }
        }
    }
}

/**
 * 开启导航功能
 * @param {object} start 
 * @param {object} end 
 */
function startRoute() {
    if (map.hasOwnProperty('startMarker') === false) {
        alert('请先设置一个起点！');
        map.remove(map.endMarker);
        return;
    } 
    var start = map.startMarker.getPosition(),
        end = map.endMarker.getPosition();
    
    if ((start.lng === end.lng) && (start.lat === end.lat)) {
        alert('起点和终点不能相同！请重新选择!');
        map.remove(map.endMarker);
        return; 
    }
    
    window.driving = new AMap.Driving({
        hideMarkers: true,
        showTraffic: false,
        outlineColor: 'black',
        policy: 11
    }); 

    driving.search(start, end, function(status, result) {
        if (status === 'no_data') {
            alert('没有结果');
        } else {
            // 清除上次规划出的所有的路线
            clearAllRoutes();
            var routes = result.routes;
            window.routesData = result.routes;
            // 把路径对象添加到map对象里
            map.routes = [];
           
            // 提取有用的路径信息
            var data = {
                routes: analysisRoutesData(routes)
            };
            console.log(data);
            
            //如果有多条路线，把他们全画出来，并且进行请求
            switch(routes.length) {
                case 1: {
                    //如果只有一条路线，直接画出来，不用请求
                    drawRoute(routes, 1);
                    showRoutesPanel();
                    break;
                } default: {
                    drawRoute(routes, routes.length);
                    showRoutesPanel();
                    sendRoutesData(data);
                }
            }    
        }
    });

    /**
     * 发送路径规划请求
     * @param {object} data 
     */
    function sendRoutesData(data) {
        console.log(data);
        $.ajax({
            url: 'http://' + ip +':8080/qgtaxi/roadandcar/querybestway',
    	    type: 'POST',
            data: JSON.stringify(data),
            dataType: 'JSON',
    	    processData: false,
    	    contentType: 'application/json',
            success: successCallback,
            error: errorCallback
        });
        function successCallback(result) {
            console.log(result);
            if (result.status === '2000') {
                showBestWay(result.index);
            } else {
                console.log('推荐失败');
            }
        }   
        function errorCallback() {
            console.log('请求失败');
        }
    }
}

/**
 * 显示推荐路线
 * @param {int} index 
 */
function showBestWay(index) {
    var routeLi = document.getElementsByClassName('route-li'),
        s = `<div class="recommand">推荐</div>`;
    routeLi[index].appendChild(s);
    routeLi[index].setAttribute('data-r', 'recommand');
}

/**
 * 清除推荐按钮
 */
function removeBestWay() {  
    var routeLi = document.getElementsByClassName('route-li');
    for (let i = 0; i < routeLi.length; i++) {
        if (routeLi[i].getAttribute('data-r') === 'recommand') {
            routeLi.removeChild(routeLi[i].lastElementChild);
        }
    }
}

/**
 * 绘制路线
 * @param {object} routes 
 * @param {int} length 
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
            paths = [],
            distance = route.distance,
            time = route.time;

        for (let i = 0, step; i < steps.length; i++) {
            step = steps[i];
            paths = paths.concat(step.path);
        }
        if (paths.length > 0) {
            paths = [paths];
        }
        addOverlays(paths, colors[i], distance, time);
    }
    
    
}

/**
 * 绘制路线
 * @param {Array} paths 
 * @param {string} color 
 */
function addOverlays(paths, color, distance, time) {
    var _overlays = [];
    var path;

    for (let i = 0; i < paths.length; i++) {
        path = new AMap.Polyline({
            map: map,
            path: paths[i],
            lineJoin: 'round',
            lineCap: 'round',
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
   
    var startPath = [map.startMarker.getPosition(), paths[0][0]],
        endPath = [paths[0][paths[0].length - 1], map.endMarker.getPosition()];

    // 添加路线起点样式
    path = new AMap.Polyline({
        map: map,
        path: startPath,
        lineJoin: 'round',
        strokeColor: 'grey', //线颜色
        strokeOpacity: 1,  //线透明度
        strokeWeight: 6, //线宽
        zIndex: 50, //默认zindex为50,
        strokeStyle: 'dashed',
        strokeDasharray: [5, 5]
    });
    _overlays.push(path);

    // 添加路线终点样式
    path = new AMap.Polyline({
        map: map,
        path: endPath,
        lineJoin: 'round',
        strokeColor: 'grey', //线颜色
        strokeOpacity: 1,  //线透明度
        strokeWeight: 6, //线宽
        zIndex: 50, //默认zindex为50,
        strokeStyle: 'dashed',
        strokeDasharray: [5, 5]
    });
    _overlays.push(path);
    
    _overlays[0].distance = distance;
    _overlays[0].time = time;
    
    // 添加到map对象中
    map.routes.push(_overlays[0]);
    map.startRoute = _overlays[1];
    map.endRoute = _overlays[2];

    // 调整视野
    map.setFitView();
}

/**
 * 处理返回后的路径数据
 * @param {object} data 
 * @param {int} index 
 */
function analysisRoutesData(data) {
    var routes = [];
    /**
     * 复制一个对象
     * @param {object} object 
     */
    function copyObj(object) {
        var newObj = {};
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                newObj[key] = object[key];
            }
        }
        return newObj;
    }

    for (let k = 0, route = {}; k < data.length; k++) {
        route.allTime = data[k].time;
        route.distance = data[k].distance;
        route.index = k + 1;
        route.steps = [];
        for (let i = 0, step = {}; i < data[k].steps.length; i++) {
            step.startLocation = {};
            step.endLocation = {};
            step.startLocation.lon = data[k].steps[i].start_location.lng;
            step.startLocation.lat = data[k].steps[i].start_location.lat;
            step.endLocation.lon = data[k].steps[i].end_location.lng;
            step.endLocation.lat = data[k].steps[i].end_location.lat;
            step.time = data[k].steps[i].time;
            step.length = data[k].steps[i].distance;
            step.path = [];
            for (let j = 0, path = {}; j < data[k].steps[i].path.length; j++) {
                path.lon =  data[k].steps[i].path[j].lng;
                path.lat =  data[k].steps[i].path[j].lat;
                step.path.push(copyObj(path));
            }   
            route.steps.push(copyObj(step));
        }
        routes.push(copyObj(route));
    }
    return routes;
}

/**
 * 选择或者点击某条路线时的callback函数
 * @param {object} event 
 */
function selectRoute(target) {
    var routeLi = document.getElementsByClassName('route-li');
        
    for (let i = 0; i < map.routes.length; i++) {
        map.routes[i].setOptions({
            zIndex: 50,
            strokeOpacity: 0.6, 
        });
        ClassUtil.removeClass(routeLi[i], 'route-highlight');
    }
  

    ClassUtil.addClass(routeLi[map.routes.indexOf(target)], 'route-highlight');

    target.setOptions({
        strokeOpacity: 1, 
        zIndex: 51
    });
}
/**
 * 点击二级菜单时某条路线高亮
 */
(function clickRouteSecondMenu() {
    var routeLi = document.getElementsByClassName('route-li');

    for (let i = 0; i < routeLi.length; i++) {
        EventUtil.addHandler(routeLi[i], 'click', clickRouteSecondMenuCallback);
    }    

})();

function clickRouteSecondMenuCallback(event) {
    selectRoute(map.routes[parseInt(event.target.getAttribute('data-r'))]);
}

/**
 * 显示道路规划的二级菜单
 */
function showRoutesPanel() {
    var routeContainer = document.getElementsByClassName('route-container')[0],
        switchModeButton = document.getElementsByClassName('show-second-menu-button')[1],
        modeclass;
    
    var routeTime = document.getElementsByClassName('route-time'),
        routeDistance = document.getElementsByClassName('route-distance');

    EventUtil.addHandler(switchModeButton, 'click', switchCallBack);    

    closeRoutesPanel();
    function switchCallBack() {
        ClassUtil.toggleClass(routeContainer, modeclass);
        ClassUtil.toggleClass(switchModeButton, 'show-second-menu-button-animation');
    }
    
    if (map.hasOwnProperty('routes')) {

        switch (map.routes.length) {
            case 1: {
                modeclass = 'route-mode-1';
                switchCallBack();
                break;
            } case 2: {
                modeclass = 'route-mode-2';
                switchCallBack();
                break;
            } case 3: {
                modeclass = 'route-mode-3';
                switchCallBack();
                break;
            }
        }

        for (let i = 0; i < map.routes.length; i++) {
            var data = analysisdata(map.routes[i]);

            routeTime[i].innerHTML = data[0];
            routeDistance[i].innerHTML = data[1];
            AMap.event.addListener(map.routes[i], 'click', selectRouteCallback);
        }
    }

    // 处理数据
    function analysisdata(route) {
        var distance = (route.distance / 1000) < 1? route.distance + '米': Math.round((route.distance / 1000) * 100) / 100 + '公里',
            min = Math.round(route.time / 60),
            time = min < 60 ? min + '分钟': Math.round((min / 60)) +'小时' + ((min % 60) >= 10 ? (min % 60) + '分钟': '0' + (min % 60) + '分钟');
            
        return [time, distance];
    }

    function selectRouteCallback(event) {
        selectRoute(event.target);
    }
    /**
     * 关闭路线推荐二级菜单
     */
    function closeRoutesPanel() {
        var routeContainer = document.getElementsByClassName('route-container')[0],
            switchModeButton = document.getElementsByClassName('show-second-menu-button')[1];
            
        // 清除事件
        // EventUtil.removeHandler(routeContainer, 'click', );
        EventUtil.removeHandler(switchModeButton, 'click', switchCallBack);

        // 清除路线绑定的事件
        for (let i = 0; i < map.routes.length; i++) {
            AMap.event.removeListener(map.routes[i], 'click', selectRouteCallback);
        }
        
        // 重置class
        switchModeButton.setAttribute('class', 'show-second-menu-button');
        routeContainer.setAttribute('class', 'route-container');
        
        //清除推荐路线样式
        removeBestWay();
    }
    // clickRouteSecondMenu();
}

/**
 * 清除所有路线
 */
function clearAllRoutes() {
    var routeLi = document.getElementsByClassName('route-li');

    if (map.hasOwnProperty('routes')) {
        for (let i = 0; i < map.routes.length; i++) {
            map.remove(map.routes[i]);
            ClassUtil.removeClass(routeLi[i], 'route-highlight');
        }
        map.remove(map.startRoute);
        map.remove(map.endRoute);
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
        zoomToAccuracy: true //定位成功后调整地图视野范围使定位位置及精度范围视野内可见
    });

    map.addControl(geolocation);
    AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
    AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息

    //解析定位结果
    function onComplete(data) {
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
    
    // 热力图插件
    window.heatmap = new AMap.Heatmap(map, {
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
        showSecondMenuButton = document.getElementsByClassName('show-second-menu-button');

    EventUtil.addHandler(showSecondMenuButton[0], 'click', function() {
        ClassUtil.toggleClass(navFirst[0], 'show-second-menu-animatiton');
    });
})();
    

/**
 * @author zwb
 * @description 将所做的js包在整个函数内部，避免用完后变量成为全局变量。
 */
(function() {
    /**
     * @version 1.0
     * @author
     * @description 将选择的时间段区域进行展开或者缩小，当宽度为608时候缩小，当宽度为0时候展开。由于弹出串口没有做到适应窗口大小，所以还未定稿
     * @param {string} targetClassName 目标的类名
     * @param {Number} 宽度数值
     */
    function dateAreaAnimate(targetClassName, widthNumber) {
        if ($('.'+ targetClassName).css('width') == widthNumber + 'px') {
            $('.'+ targetClassName).animate({
                width: '48px'
            }, 250 ,function() {
                $('.part-right .'+ targetClassName +' .switch-mode img:eq(0)').attr('src', '../images/icon_time.png');
            });
        } else {
            $('.'+ targetClassName).animate({
                width: widthNumber + 'px'
            }, 250, function() {
                $('.part-right .'+ targetClassName +' .switch-mode img:eq(0)').attr('src', '../images/icon_cross_small_normal.png');
            });
        }
    }

    /**
     * @description 将横拉行进行拉出和拉入
     * @param {jQuery Object} $animateTarget jq对象
     * @param {String} iconName 图标的名字
     */
    function modeAreaAnimate($animateTarget, iconName) {
        if ($animateTarget.css('width') == '168px') {
            $animateTarget.animate({
                width: '48px'
            }, 250, function() {
                $animateTarget.children('.switch-mode')[0].getElementsByTagName('img')[0].setAttribute('src', '../images/' + iconName);
            });
        } else {
            $animateTarget.animate({
                width: '168px'
            }, 250, function() {
                $animateTarget.children('.switch-mode')[0].getElementsByTagName('img')[0].setAttribute('src', '../images/icon_cross_small_normal.png');
            });
        }
    }

    /**
     * @description 切换模式的开关变化函数
     * @param {jQuery object} $switchTarget 开关所在容器对象
     * @param {String} iconUrl 图标的名称
     */
    function changeDisplayMode($switchTarget, iconUrl) {

    }

    /**
     * @description 对切换模式进行监听
     * @param {object} event 事件监听对象
     */
    function modeChangeListen(event) {
        switch(event.target) {
            case $('#normal-map img')[0]: {
                // 切换到普通地图
                if (ClassUtil.hasClass($('#normal-map')[0], 'mode-choiced') == true) {
                    return;
                }
                ClassUtil.removeClass($('#heat-map')[0], 'mode-choiced');
                ClassUtil.addClass($('#normal-map')[0], 'mode-choiced');
                /* 不再请求实时更新 */
                clearTimeout(window.realHeatmapTimeoutID);
                window.heatmap.hide();
                break;
            }

            case $('#heat-map img')[0]: {
                // 切换到热力图模式
                if (ClassUtil.hasClass($('#heat-map')[0], 'mode-choiced') == true) {
                    return;
                }
                ClassUtil.addClass($('#heat-map')[0], 'mode-choiced');
                ClassUtil.removeClass($('#normal-map')[0], 'mode-choiced');
                /* 请求实时更新 */
                window.heatmap.show();
                window.realHeatmapTimeoutID = setTimeout(realTimeHeatmapRequestTrigger, 5000);
                break;
            }

            case $('#past-tense img')[0]: {
                // 查询过去时间段
                if (ClassUtil.hasClass($('#past-tense')[0], 'mode-choiced') == true) {
                    return;
                }
                ClassUtil.addClass($('#past-tense')[0], 'mode-choiced');
                ClassUtil.removeClass($('#future-tense')[0], 'mode-choiced');
                break;
            }

            case $('#future-tense img')[0]: {
                // 预测未来数据
                if (ClassUtil.hasClass($('#future-tense')[0], 'mode-choiced') == true) {
                    return;
                }
                ClassUtil.addClass($('#future-tense')[0], 'mode-choiced');
                ClassUtil.removeClass($('#past-tense')[0], 'mode-choiced');
                break;
            }
        }
    }

    /**
     * @version 1.0
     * @author
     * @description 对右边地图悬浮的标签部分进行事件监听
     * @param {object} event 事件监听对象 
     */
    function partRightClickListen(event) {
        switch(event.target) {
            /* 切换选择时间段的区域的展示或者收缩 */
            case $('.part-right .date-switch-container .switch-mode img')[0]: {
                if ($('.date-switch-container').is(':animated') == true) {
                    return;
                }
                dateAreaAnimate('date-switch-container', 608);
                break;
            }

            /* 切换选择未来时间的展示或者收缩 */
            case $('.part-right .predict-date-switch-container .switch-mode img')[0]: {
                dateAreaAnimate('predict-date-switch-container', 334);
                break;
            }

            /* 切换热力图 */
            case $('.switch-box li .switch-mode img')[0]: {
                if ($(event.target).parents('li:eq(0)').is(':animated') == true) {
                    return;
                }
                modeAreaAnimate($(event.target).parents('li:eq(0)'), 'icon_change.png');
                // 调用切换热力图的函数
                // realTimeHeatmapRequest();
                // timeQuantumHeatmapRequest();
                break;
            }

            /* 切换时间模式 */ 
            case $('.switch-box li .switch-mode img')[1]: {
                if ($(event.target).parents('li:eq(0)').is(':animated') == true) {
                    return;
                }
                modeAreaAnimate($(event.target).parents('li:eq(0)'), 'icon_time jumping.png');
                break;
            }

            /* 取某个点的经纬度 */
            case $('.location-button img')[0]: {
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
    for (var i = 0; i < 4; i++) {
        EventUtil.addHandler($('.modeChoice img')[i], 'click', modeChangeListen);
    }
})();

/**
 * @description 展示数据图标
 * @param {String} chartType 数据图表的类型
 */
function showCharts(jsonObj) {
    var fullRateDates = jsonObj;

    fullRateOption = {
        title : {
            show: true,
            text : '出租车的载客率统计',
            x: 'center',
            y: '10px',
            textStyle: {
                fontSize: 15,
                fontWeight:600
            }
        },

        series: [
            {
                name: '出租车载客率统计',
                type: 'pie',
                radius: '75%',
                data: fullRateDates,
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter:  '{b}: {c}\n({d}%)',
                        textStyle: {
                            fontWeight: 300,
                            fontSize: 13
                        }
                    }
                },
                
                itemStyle: {
                    normal: {
                        label: {
                            show: true,
                            textStyle: {
                                fontWeight: 200,
                                fontSize: 10
                            },
                            formatter: 100
                        }
                    },
                    labelLine: {    //指示线状态
                    show: true,
                    smooth: 0.2,
                    length: 10,
                    length2: 20
                }
                },
            }
        ],
        color: ['rgb(33,214,124)', 'rgb(222, 81, 69, .8)']
    };

    flowOption = {
        title: {
            text: '点击标签次数',//图标标题
            x: 'center'//水平居中
        },

        xAxis: [  //x坐标轴信息    
            {
               name : '（下方x轴数据单位）',//坐标单位
               data: ['2月', '4月', '6月', '8月', '10月', '12月']//坐标上数值
            }
        ],
        yAxis: [//y坐标轴信息
            {
                name : '（y轴数据单位）',//坐标单位
                type: 'value',
                min:0,//坐标起始值
                max:60  //坐标最大值
            }
        ],

    };


    /**
     * 
     * @param {object} chartObject 图标数据的对象
     * @param {*} charData 图标数据
     */
    function chatsDisplay(chartObject, charData) {
        window.charts = echarts.init($('#show-area')[0]);
        fullRateDates = charData;
        console.log(chartObject);
        window.charts.setOption(chartObject);
    }
    chatsDisplay(fullRateOption, jsonObj);

}

// function showDataArea() {
//     $('.panel-right-container').css('z-index', 13);
//     $('.display-data').css('z-index', 13);
//     $('.display-data').css('display', 'block');
//     showCharts([{
//         value: 140,
//         name: '利用'
//     },
//     {
//         value: 140,
//         name: '未利用'
//     }]);
// }


// EventUtil.addHandler(document, 'click', function() {
//     showDataArea();
// })

/**
 * @description 对查询的时间进行限制
 * @param {Number} minutes 限制的最大时间
 */
function checkMaxTime(minutes) {
    var startDate = $('#start-date span')[0].innerText,
        startTime = $('#start-time span')[0].innerText,
        endDate = $('#end-date span')[0].innerText,
        endTime = $('#end-time span')[0].innerText,
        startFullTime = startDate + ' ' + startTime,
        endFullTime = endDate + ' ' + endTime,
        start = new Date(startFullTime),
        end = new Date(endFullTime);

    if (startDate.slice(0, 1) == '-' || endDate.slice(0, 1) == '-') {
        return false;
    }
    /* 检查是否超过限制时间 */
    if ((parseInt(end - start) / 60000) > minutes) {
        return false;
    }
    return true;
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
            }, 350);
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

        // 当没有选择日期的时候，不进行更新日期选择区域
        if (typeof dateString.split('/')[2] == 'undefined' || dateString.split('/')[2] == '--' || dateString.split('/')[2] == 'undefined') {
            return;
        }

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
            case $('.date-switch-container .date-container div div')[0]: {
                showList($('.start-date-list')[0]);
                dateChoiceAreaRenew('start-date-list', $(event.target).prev()[0].innerText);   // 初始化日历
                break;
            }

            case $('.date-switch-container .date-container div div')[1]: {
                showList($('.start-time-list')[0]);
                timeChoiceAreaRenew('start-time-list', $(event.target).prev()[0].innerText);
                break;
            }

            case $('.date-switch-container .date-container div div')[2]: {
                showList($('.end-date-list')[0]);
                dateChoiceAreaRenew('end-date-list', $(event.target).prev()[0].innerText);   // 初始化日历
                break;
            }

            case $('.date-switch-container .date-container div div')[3]: {
                showList($('.end-time-list')[0]);
                timeChoiceAreaRenew('end-time-list', $(event.target).prev()[0].innerText);
                break;
            }

            // 提交时间段请求
            case $('.date-switch-container button')[0]: {
                clearTimeout(window.realHeatmapTimeoutID);   // 当为时间段请求的时候，停止实时更新
                timeQuantumHeatmapRequest();
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
            number = parseInt(event.target.innerText),    // 选择的结果
            date,
            leastDate = $(event.target).parents('.date-list').attr('date');  // 上一个选择的日期
            // currentDate = new Date(),
        
        month = month < 10? '0' + month : month;
        number = number < 10? '0' + number : number;
        event.stopPropagation();

        /* 进行监听时候，更改年份或者月份,并且将点击选择具体日期进行刷新更改 */
        if ($(event.target).parent('ul').attr('class') == 'year-select-list') {
            year = number;      // 由于有年份的选择和月份的选择，所以当选择框是年份的时候，将年份赋值为选择的结果
            month = '01'; // 选择年份后，月份默认为

            /* 判断这个月是不是之前选的月，方便显示 */
            if (typeof leastDate != 'undefined' && year == leastDate.split('/')[0] && month == leastDate.split('/')[1]) {
                date = leastDate.split('/')[2];
            }

            $(event.target).parents('.date-list')[0].getElementsByClassName('year-select-switch')[0].getElementsByTagName('span')[0].innerText = number + '年';
            $(event.target).parents('.date-list')[0].getElementsByClassName('month-select-switch')[0].getElementsByTagName('span')[0].innerText = '01月';
            dateChoiceAreaRenew($(event.target).parents('.date-list').attr('class').split(' ')[1], year + '/' + month + '/' + date);  // 对下拉列表中的点击选择区域进行初始化
        } else {
            month = number;

            if (typeof leastDate != 'undefined' && year == leastDate.split('/')[0] && month == leastDate.split('/')[1]) {
                date = leastDate.split('/')[2];
            }

            $(event.target).parents('.date-list')[0].getElementsByClassName('month-select-switch')[0].getElementsByTagName('span')[0].innerText = number + '月';
            dateChoiceAreaRenew($(event.target).parents('.date-list').attr('class').split(' ')[1], year + '/' + month + '/' + date);
        }
        /* 对日期下拉表进行隐藏 */
        hiddenDownList($(event.target).parents('.scroll-cut')[0]);
    }

    /**
     * @description 对时间下拉表进行监听
     * @param {object} event 监听事件对象
     */
    function timeSelectListListen(event) {
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
            monthSelect.innerHTML += '<li>'+ i +'月</li>';
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

        /* 选择日期,自动显示已经选择的日期 */
        if (event.target.tagName == 'LI' && typeof $(event.target).parent('.choice-date-container')[0] !== 'undefined') {
            var choicedNumber = parseInt($(event.target).parent('div').attr('choice-number'));
            $(event.target).parent('div').attr('choice-number', parseInt(event.target.innerText) - 1);
            if (typeof choicedNumber !== 'undefined') {
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
                    date = $(event.target).parents('.date-list').children('.choice-date-container').attr('choice-number');

                /* 提交结果不对时候，将下拉栏隐藏起来，然后没改变 */
                if (typeof date == 'undefined') {
                    hiddenDownList($(event.target).parents('.date-list')[0]);
                    return;
                }

                date = parseInt(date) + 1;

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
                /* 将起始或者结束日期的下拉表容器的属性中添加已经选择后的结果，然后方便下次下拉时候显示 */
                $(event.target).parents('.date-list').attr('date', dateSpan.innerText);
                $(event.target).parents('.date-list').children('.choice-date-container')[0].removeAttribute('choice-number');
                hiddenDownList($(event.target).parents('.date-list')[0]);  // 隐藏下拉表
                endTimeCheck();  // 时间检查，防止上限时间低于下线时间
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
    EventUtil.addHandler($('.date-switch-container')[0], 'click', dateContainerListen);
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
 * @description 触发实时更新热力图的请求.
 */
function realTimeHeatmapRequestTrigger() {

    // window.map.on('mousedown', function() {
    //     clearTimeout(setTimeoutID);
    // });
    // window.map.on('mouseup', function() {
    //     realTimeHeatmapRequest();
    //     setTimeoutID = setTimeout(heatmapTimeResquest, 5000);
    // })
    // function heatmapTimeResquest() {
    //     realTimeHeatmapRequest();
    //     setTimeoutID = setTimeout(arguments.callee, 5000);
    // }
    // setTimeoutID = setTimeout(heatmapTimeResquest, 5000);
    realTimeHeatmapRequest();
    window.realHeatmapTimeoutID = setTimeout(arguments.callee, 5000);
}


/**
 * @description 提示出错的点。
 * @param {String} text 错误内容
 */
function showError(text) {
    $('.float-layer').css('display', 'block');
    $('.float-layer span')[0].innerText = text;
    setTimeout(function() {
        /* 显示浮出层 */
        if (ClassUtil.hasClass($('.float-layer div')[0], 'down-list-transform') == false) {
            ClassUtil.addClass($('.float-layer div')[0], 'down-list-transform');
        }
    }, 20);
    function certainClick() {
        /* 去除浮出层 */
        if (ClassUtil.hasClass($('.float-layer div')[0], 'down-list-transform') == true) {
            ClassUtil.removeClass($('.float-layer div')[0], 'down-list-transform');
        }
        setTimeout(function() {
            $('.float-layer').css('display', 'none');
        }, 300);
        EventUtil.removeHandler($('.float-layer button')[0], 'click', certainClick);  // 确认按钮的事件移除
    }
    EventUtil.addHandler($('.float-layer button')[0], 'click', certainClick);   // 确认按钮的事件添加
}

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
            switch(responseObj.status) {
                case '2000': {
                    heatmapDisplay(responseObj);
                    break;
                }

                case '5000': {
                    // 服务器发生未知错误
                    showError('服务器发生未知错误');
                    break;
                }

                case '5001': {
                    // 预测数据缺失
                    showError('数据缺失');
                    break;
                }
            }
        },
        error: function() {
            // 请求失败
            showError('请求失败');
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
        showError('请选择时间段');
        return;
    }
    /* 判断时间段 */
    if (checkMaxTime(60) == false) {
        showError('查询的时间段不长于60分钟');
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
            switch(responseObj.status) {
                case '2000': {
                    heatmapDisplay(responseObj);
                    break;
                }

                case '5000': {
                    // 服务器内部错误
                    showError('服务器内部错误');
                    break;
                }

                case '5001': {
                    // 数据缺失
                    showError('数据缺失');
                    break;
                }
            }
            
        },
        error: function() {
            // 请求失败时要干什么
            showError('请求失败');
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
        list = [];

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

