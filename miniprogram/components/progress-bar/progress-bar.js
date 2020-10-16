// 由于以下变量并不用显示在页面当中，并且许多方法都会使用到这些变量，所以存在全局变量当中
let movableAreaWidth = 0 //播放进度条可移动区域宽度
let movableViewWidth = 0 // 控制拖拽原点的宽度
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 //当前的秒数
let duration = 0 //当前歌曲总时长 秒为单位
let isMoving = false //表示当前进度条是否在拖拽，解决：当进度条拖动的时候和updateTimeup冲突
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        showTime: {
            // 当前播放时间
            currenTime: "00:00",
            // 音乐总时长
            totalTime: "00:00"
        },
        //移动的总距离
        movableDis: 0,
        // 进度条百分比
        pregoress: 0
    },
    lifetimes: {
        ready() {
            this.getMovableDis()
            this.bindBgmEvent()
        },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        onChange: function (event) {
            console.log(event)
            // 拖动产生的效果
            if (event.detail.source == 'touch') {
                this.data.pregoress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
                this.data.movableDis = event.detail.x
                isMoving = true
            }
        },
        onTouchEnd: function () {
            const currentTimeFmt = this.dataformat(Math.floor(backgroundAudioManager.currentTime))
            this.setData({
                pregoress: this.data.pregoress,
                movableDis: this.data.movableDis,
                ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
            })
            backgroundAudioManager.seek(duration * this.data.pregoress / 100)
            isMoving = false
        },
        //通过节点查询器获取进度条和控制圆点的宽度  
        getMovableDis() {
            // 在组件用应该使用This代替，在页面中则要使用wx
            const query = this.createSelectorQuery() //节点查询器  
            query.select('.movable-area').boundingClientRect() //用来返回当前movable-area的总宽度  因为每台手机的分辨率不同，所以要通过节点查询
            query.select('.movable-view').boundingClientRect() //用来返回当前movable-view的总宽度  因为每台手机的分辨率不同，所以要通过节点查询
            query.exec((rect) => {
                movableAreaWidth = rect[0].width  //将返回的节点宽度赋值到全局变量的 movableArea中   进度条拖拽的范围宽度
                movableViewWidth = rect[1].width  //将返回的节点宽度赋值到全局变量的 movableView中  小圆点
            })
        },
        // 监听音乐的播放事件
        bindBgmEvent() {
            backgroundAudioManager.onPlay(() => {
                isMoving = false
                console.log('onPlay')
            })
            backgroundAudioManager.onStop(() => {
                console.log('onStop')
            })
            backgroundAudioManager.onPause(() => {
                console.log('onPause')
            })
            backgroundAudioManager.onWaiting(() => {
                console.log('onWaiting')
            })
            backgroundAudioManager.onCanplay(() => {
                console.log('onCanplay')
                if (typeof backgroundAudioManager.duration != 'undefined') {
                    this.setTime()
                } else {
                    setTimeout(() => {
                        this.setTime()
                    }, 1000)
                }
            })
            backgroundAudioManager.onTimeUpdate(() => {
                // console.log('onTimeUpdate')
                const currentTime = backgroundAudioManager.currentTime
                duration = backgroundAudioManager.duration
                const currentTimeFmt = this.dataformat(currentTime)
                const sec = currentTime.toString().split('.')[0]
                if (sec != currentSec && isMoving == false) {
                    this.setData({
                        movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
                        pregoress: currentTime / duration * 100,
                        ['showTime.currenTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
                    })
                    currentSec = sec
                }
            })
            backgroundAudioManager.onEnded(() => {
                console.log('onEnded')
                this.triggerEvent('musicEnd')
            })
            backgroundAudioManager.onError(() => {
                console.log('onError')
            })
            backgroundAudioManager.onError((res) => {
                console.error(res.errMsg)
                console.error(res.errCode)
                wx.showToast({
                    title: '错误' + res.errCode,
                    icon: 'none'
                })
            })
        },
        setTime() {
            duration = backgroundAudioManager.duration
            const durationformat = this.dataformat(duration)
            // 设置歌曲的总时间，并显示到页面当中
            this.setData({
                ['showTime.totalTime']: `${durationformat.min}:${durationformat.sec}`
            })
        },
        // 格式化时间
        dataformat(sec) {
            const min = Math.floor(sec / 60)
            sec = Math.floor(sec % 60)
            return {
                'min': this.parse0(min),
                'sec': this.parse0(sec)
            }
        },
        //补零
        parse0(sec) {
            return sec < 10 ? '0' + sec : sec
        },

    }

})