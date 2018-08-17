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
        AMap.plugin(['AMap.ToolBar', 'AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Geolocation', 'AMap.ControlBar', 'AMap.Driving'], pluginOptions);
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
    
    var infoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        content: '<div id="info-box"><div id="close-container"><button id="close-button">x</button></div>' +
        '<p id="content">'+ content + '</p>' +                    
        '<div class="set-button-container">' + 
        '<button id="start-button" class="set-button" >设为起点</button>' +
        '<button id="end-button" class="set-button">到这里去</button></div></div>',
        offset: new AMap.Pixel(-2, -22) //left: -2, top: -20
    });

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
            // 把路径对象添加到map对象里
            map.routes = [];
           
            // 提取有用的路径信息
            var data = {
                routes: analysisRoutesData(routes)
            };

            //如果有多条路线，把他们全画出来，并且进行请求
            switch(routes.length) {
                case 1: {
                    //如果只有一条路线，直接画出来，不用请求
                    drawRoute(routes, 1);
                    break;
                } default: {
                    drawRoute(routes, routes.length);
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
        // console.log(data);
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
    showRoutesPanel();
}

/**
 * 绘制路线
 * @param {Array} paths 
 * @param {string} color 
 */
function addOverlays(paths, color, distance, time) {
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

    _overlays[0].distance = distance;
    _overlays[0].time = time;
    
    // 添加到map对象中
    map.routes.push(_overlays[0]);

    // 绑定事件
    AMap.event.addListener(_overlays[0], 'click', selectRoute);

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
        // 填充数据
        
        for (let i = 0; i < map.routes.length; i++) {
            var data = analysisdata(map.routes[i]);

            routeTime[i].innerHTML = data[0];
            routeDistance[i].innerHTML = data[1];
        }
    }
    function analysisdata(route) {
        var distance = (route.distance / 1000) < 1? route.distance + '米': (route.distance / 1000) + '公里',
            time = Math.round((route.time / 60)) < 60 ? Math.round((route.time / 60)) + '分钟': (route.time % 60) +'小时' + Math.round((route.time / 60)) - 60 + '分钟';
       
        return [time, distance];
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
    
        // 重置class
        switchModeButton.setAttribute('class', 'show-second-menu-button');
        routeContainer.setAttribute('class', 'route-container');
        
        //清除推荐路线样式
        removeBestWay();
    }
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


