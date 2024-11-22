// app.js
App({
  onLaunch() {
    // checkUpdate
    this.globalData.sysinfo = wx.getSystemInfoSync()
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？不更新部分功能将无法使用！',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败，请删除小程序并重新搜索进入',
        showCancel: false
      })
    })


    // init
    this.initMainPage()
    wx.setStorageSync('noticeState', false)
  },
  globalData: {
    // userInfo: null,
    sysinfo: {},
    wxuserState: -1,
    curWeiboUserIdx: -1,
  },

  initMainPage() {
    let _this = this
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    if (wx.getStorageSync('wxuserToken') === "") {
      // 新用户，进入home
      // console.log("未登录")
    }else{
      wx.checkSession({
        success (){
          // 老用户session存活，进入home
          _this.globalData.wxuserState = 1
          // console.log("session未过期，返回微博登录状态")
          if (_this.wxuserStateCallback) {
            _this.wxuserStateCallback()
          }
        },
        fail() {
          // 老用户session过期，进入home
          _this.globalData.wxuserState = 0
          // console.log("session过期，需要重新登录")
        }
      })
    }
    
    

    
    // wx.login({
    //   success: (res) => {
    //     console.log(res)
    //     wx.request({
    //       url: 'http://localhost:8080/api/initMainPage',
    //       data: {
    //         "userCode": res.code,
    //       },
    //       method: "POST",
    //       success: (res) => {
    //         console.log(res)
    //         if (res.data.loginState) {
    //           wx.setStorageSync('weiboUsername', res.data.weiboUsername)
    //           wx.setStorageSync('weiboAvatar', res.data.weiboAvatar)
    //           wx.setStorageSync('session_key', res.data.session_key)
    //           this.globalData.loginState = res.data.loginState
    //         } else {
    //           // wx.setStorageSync('loginState', false)
    //           this.globalData.loginState = res.data.loginState
    //           console.log("未注册登录")
    //         }
    //         if(_this.sessionCallback){
    //           _this.sessionCallback(res.data)
    //         }
    //         wx.hideLoading()
    //       }
    //     })
    //   },
    //   fail: (e) => {
    //     console.log(e)
    //   }
    // })

  },

})