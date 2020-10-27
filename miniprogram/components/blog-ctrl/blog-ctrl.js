// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String
  },
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    // 登录组件是否显示
    loginShow: false,
    modalShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment: function () {
      // 判断用户是否授权
      wx.getSetting({
        withSubscriptions: true,
        success: (res) => {
          // console.log(res)
          // console.log(res.subscriptionsSetting)
          if (res.authSetting['scope.userInfo']) { //用户未授权
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modalShow: true
                })
              }
            })
          } else {
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },
    // 授权成功  显示评论框  隐藏授权框
    onloginSuccess(event) {

      userInfo = event.detail
      this.setData({
        loginShow: false,
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },
    // 授权失败
    onloginfail() {
      wx.showModal({
        title: '授权用户才能进行评价',
        content: ''
      })
    },
    // 用户点击发送评论
    onSend(event) {
      let content = event.detail.value.content
      if (content.trim() === '') {
        wx.showModal({
          title: '输入内容不能为空',
          content: ''
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask: true
      })
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        // this.sendOrderMSG(content) //推送订阅消息
        this.setData({
          modalShow: false,
          content: ''
        })
      })
    },
    // 推送订阅消息
    sendOrderMSG(content) {
      wx.cloud.callFunction({
        name: 'sendMessage',
        data: {
          content,
          nickName: userInfo.nickName,
          blogId: this.properties.blogId
        }
      }).then((res) => {
        console.log(res)
      })
    },
    getUserorderMsg: function () {
      //获取订阅授权信息
      const result = wx.requestSubscribeMessage({
        tmplIds: ['FPWNnROLXa0_BeNyVLKx5qfoc4y-MtwxiXyZkmo8mbM'],
        success(res) {
          return true
        },
        fail(res) {
          return false
        }
      })
      return result
    }
  },

})