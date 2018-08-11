var map = new AMap.Map('map-container', {
    zoom: 10,
    //广州市区的坐标
    center: [113.23, 23.13],
    
});

/**
 * 引入多个插件
 */
AMap.plugin(['AMap.ToolBar', ],function(){//异步加载插件
    var toolbar = new AMap.ToolBar({
        "direction": false,
        "position": "RB"

    });
    map.addControl(toolbar);
    
});
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


var panel = document.getElementsByClassName('part-left')[0];
    showPanelButton = document.getElementsByClassName('panel-button')[0];


EventUtil.addHandler(showPanelButton, 'click', function() {
    if (hasClass(panel, 'hide-panel')) {
        removeClass(panel, 'hide-panel');
    } else {
        addClass(panel, 'hide-panel');
    }
});

(function() {
    /**
     * @version 1.0
     * @author
     * @description 将选择的时间段区域进行展开或者缩小，当宽度为520时候缩小，当宽度为0时候展开。由于弹出串口没有做到适应窗口大小，所以还未定稿
     */
    function dateAreaAnimate() {
        if ($('.date-container').css('width') == '520px') {
            $('.date-container').animate({
                width: '0px'
            }, 250 ,function() {
                $('.date-container').css('visibility', 'hidden');
                $('.part-right .switch-box li img:eq(0)').attr('src', '../images/icon_time.png')
            });
        } else {
            $('.date-container').css('visibility', 'visible')
            $('.date-container').animate({
                width: '520px'
            }, 250, function() {
                $('.part-right .switch-box li img:eq(0)').attr('src', '../images/icon_cross_large_normal.png')
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
            case $('.part-right .switch-box li img')[0]: {
                if ($('.date-container').is(':animated') == true) {
                    return;
                }
                dateAreaAnimate();
                break;
            }
        }
    }

    EventUtil.addHandler($('.part-right')[0], 'click', partRightClickListen);
})();