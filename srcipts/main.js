/**
 * 异步加载地图
 */
window.onLoad  = function(){
    
    setTimeout(() => {
        //移除加载动画
        partRight.removeChild(loading);
        var map = new AMap.Map('map-container', {
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
        switch(event.target) {
            case $('.part-right .switch-mode img')[0]: {
                if ($('.date-switch-container').is(':animated') == true) {
                    return;
                }
                dateAreaAnimate();
                break;
            }
        }
    }

    EventUtil.addHandler($('.part-right')[0], 'click', partRightClickListen);
    
})();
