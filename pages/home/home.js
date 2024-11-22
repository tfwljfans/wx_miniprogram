// pages/home/home.js

import { createStoreBindings } from "mobx-miniprogram-bindings";
import { store } from "../../store/store";
import Dialog from '@vant/weapp/dialog/dialog';

var sotk = null
var heartbeatTimerId;
var reconnectTimerId;

var rewardVideoAd = null;

const app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const defaultUserNickName = '游客'
const defaultQRcodeUrl = '/images/unload.png'
const emoji_list = ['( •̀ ω •́ )✧', '(●ˇ∀ˇ●)', '( •̀ ω •́ )y', '(o゜▽゜)o☆', '(oﾟvﾟ)ノ', 'ヾ(≧ ▽ ≦)ゝ', '(´▽`ʃ♡ƪ)', '╰(*°▽°*)╯', '(‾◡◝)']

const emoji_list_2 = ['( •̀ .̫ •́ )✧thx', '(｡･∀･)ﾉﾞ~thx','(o-ωｑ)).oO ~thx', '(o゜▽゜)o☆~thx', 'o(*￣▽￣*)ブ~thx~']

function weiboUser(id, uid, userAvatar, userNickName, userState) {
  this.id = id
  this.uid = uid
  this.userAvatar = userAvatar
  this.userNickName = userNickName
  this.userState = userState
}

Page({

  /**
   * 广告
   */

  adLoad() {
    // console.log('视频广告 广告加载成功')
  },
  adError(err) {
    // console.error('视频广告 广告加载失败', err)
  },
  adClose() {
    // console.log('视频广告 广告关闭')
  },

  openRewardVideoAd(){
    // console.log('openRewardVideoAd')
    let that = this
    if (rewardVideoAd) {
      rewardVideoAd.show().catch(() => {
        // 失败重试
        rewardVideoAd.load()
          .then(() => rewardVideoAd.show())
          .catch(err => {
            that.setData({
              rewardVideoLimit: true
            })
          })
      })
      rewardVideoAd.onClose(res => {
          // 用户点击了【关闭广告】按钮
          rewardVideoAd.offClose()
          if (res && res.isEnded || res === undefined) {
            // 正常播放结束，可以下发游戏奖励
            // console.log("正常结束")
            this.updateRewardVideoAd()
            this.setData({
              rewardComplete: true
            })
          } else {
            // 播放中途退出，不下发游戏奖励
            // console.log("无奖励")
            this.setData({
              rewardComplete: false
            })
          }
      })
    }
  },

  updateRewardVideoAd(){
    let oper = wx.getStorageSync('oper')
    // console.log(oper)
    let curTime_strp = new Date(Date.parse(new Date()));
    let curTime = curTime_strp.getFullYear().toString() + curTime_strp.getMonth().toString() + curTime_strp.getDate().toString()

    if(oper === ''){
      oper = {}
    }
    if(oper.reward_ad_count === null){
      oper.reward_ad_count = 1
      oper.date = curTime
    }else{
      if(oper.date === curTime){
        // console.log(oper)
        oper.reward_ad_count += 1
        // console.log(oper)
      }else{
        oper.reward_ad_count = 1
        oper.date = curTime
      }
    }
    wx.setStorageSync('oper', oper)
    this.setData({
      rewardVideoCount_daily: oper.reward_ad_count,
      emoji: emoji_list[Math.floor(Math.random()*emoji_list.length)],
      emoji_2: emoji_list_2[Math.floor(Math.random()*emoji_list_2.length)],
    })
    sendSocketMessage({
      'wxuserToken': wx.getStorageSync('wxuserToken'),
      'msg': "setRewardVideoCount",
      'rewardVideoCount': true,
    })
  },

  initRewardVideoAd(){
    let oper = wx.getStorageSync('oper')
    let curCount = 0
    let curTime_strp = new Date(Date.parse(new Date()));
    let curTime = curTime_strp.getFullYear().toString() + curTime_strp.getMonth().toString() + curTime_strp.getDate().toString()
    if(oper !== '' && oper.date === curTime){
      curCount = oper.reward_ad_count
    }
    this.setData({
      rewardVideoCount_daily: curCount,
      emoji: emoji_list[Math.floor(Math.random()*emoji_list.length)],
      emoji_2: emoji_list_2[Math.floor(Math.random()*emoji_list_2.length)],
    })
  },

  /**
   * 页面的初始数据
   */

  data: {
    rewardVideoCount: 0,
    rewardComplete: true,
    rewardVideoCount_daily: 0,
    rewardVideoLimit: false,
    emoji: null,
    emoji_2: null,
    noticeShow: false,
    noticeValue: false,
    noticeTitle: "通知",
    noticeMessage: "1、超话发帖新增了“等待‘频繁’结束后继续执行”的功能\n2、修改了“转发微博”功能，现在支持执行多轮任务\n3、更新了新的词条、图片及文案\n4、修复了部分Bug",
    initPage: false,
    hidePage: true,
    userAvatarUrl: defaultAvatarUrl,
    userNickName: defaultUserNickName,
    countWeibo: 0,
    QRcodeTips: "未获取二维码",
    QRcodeUrl: defaultQRcodeUrl,
    QRcodeLoadingState: false,
    QRcodeState: false,
    QRcodeLive: true,
    modalType: false,
    weiboUserList: [
      new weiboUser(1, "-1", "https://tva1.sinaimg.cn/crop.0.0.179.179.180/d9e5634djw1east9pi6bej2050050dfw.jpg?KID=imgbed,tva&amp;Expires=1698495955&amp;ssig=eZ0EzRgppJ", "微博用户", "未登录")
    ]
  },

  noticeChange(e) {
    this.setData({
      noticeValue: e.detail.value.length === 1
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBuildings = createStoreBindings(this, {
      store,
      fields: ['loginState'],
      actions: ['set_loginState']
    })

    // console.log("onload")
    app.wxuserStateCallback = () => {
      // console.log("回调")
      // console.log(app.globalData.wxuserState)
      this.initMainPage()
      this.setData({
        initPage: true
      })
    }

    let that = this
    // init rewardVideoAd Obj
    if (wx.createRewardedVideoAd) {
      rewardVideoAd = wx.createRewardedVideoAd({
        adUnitId: 'xxx'
      })
      rewardVideoAd.onLoad(() => {})
      rewardVideoAd.onError((err) => {
        // console.error('激励视频光告加载失败', err)
        that.setData({
          rewardVideoLimit: true
        })
      })
    }

    this.initRewardVideoAd()

  },

  onHide(){
    
    if (sotk !== null) {
      closeWebsocket("HidePage")
      stopHeartbeat()
      stopReconnect()
      sotk = null
    }
    this.setData({
      hidePage:true
    })
  },

  onShow(){
    if (this.data.initPage && app.globalData.wxuserState === 1 && this.data.hidePage) {
      this.initMainPage()
      // console.log("onshow")
    }
    this.setData({
      hidePage: false
    })
    // Dialog.alert({
    //   // theme: 'round-button',
    // }).then(() => {
    //   // on close
    //   console.log("confirm")
    //   console.log(this.data.noticeValue)
    // })
  },

  onPullDownRefresh(){
    // console.log("refresh")
    this.onShow()
    wx.stopPullDownRefresh()
  },

  sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
      now = new Date();
      if (now.getTime() > exitTime)
        return;
    }
  },

  login() {
    wx.navigateTo({
      url: '/pages/getUserInfo/getUserInfo',
    })
  },

  logout() {
    this.set_loginState(false)
    this.setData({
      userAvatarUrl: defaultAvatarUrl,
      userNickName: defaultUserNickName,
      QRcodeUrl: defaultQRcodeUrl,
      QRcodeState: false,
      countWeibo: 0,
      weiboUserList: [
        new weiboUser(1, "-1", defaultAvatarUrl, "微博用户", "未登录")
      ]
    })
    app.globalData.wxuserState = -1
    
    wx.setStorageSync('weiboUserList', this.data.weiboUserList)
    wx.removeStorageSync('wxavatarUrl')
    wx.removeStorageSync('wxUsername')
    wx.removeStorageSync('wxuserToken')
    // console.log("logout")
    // console.log(this.data.loginState)
    // console.log(this.data.userAvatarUrl)
    stopHeartbeat()
    stopReconnect()
    closeWebsocket("logout")
  },

  initMainPage() {
    // 获取微信用户信息
    // console.log(this.data.userAvatarUrl)
    // this.getUserOpenId()

    if (app.globalData.wxuserState === 1) {
      // session存活，初始化页面，从storage发送weiboList查询weibo状态
      this.getWeiboList()
      // console.log(this.data.weiboUserList)
    }
    // console.log("initPage")
    webSocketStart(this)
    
  },


  getWeiboQRcode() {
    this.setData({
      QRcodeLoadingState: true,
      QRcodeLive: true,
      QRcodeUrl: '/images/loading.gif',
    })
    this.getLoginQRcode()
  },

  saveWeiboQRcode() {
    let that = this
    wx.showLoading({
      title: '加载中...'
    });
    wx.downloadFile({
      url: this.data.QRcodeUrl, //图片地址
      success: function (res) {
        // console.log("success downloadFile")
        //wx.saveImageToPhotosAlbum方法：保存图片到系统相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath, //图片文件路径
          success: function (data) {
            wx.hideLoading(); //隐藏 loading 提示框
            wx.showModal({
              title: '提示',
              content: '保存成功',
              modalType: false,
            })
          },
          // 接口调用失败的回调函数
          fail: function (err) {
            if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
              // console.log("in fail")
              wx.showModal({
                title: '提示',
                content: '需要您授权保存相册',
                modalType: false,
                success: modalSuccess => {
                  wx.openSetting({
                    success(settingdata) {
                      // console.log("settingdata", settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限成功,再次点击图片即可保存',
                          modalType: false,
                        })
                      } else {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限失败，将无法保存到相册哦~',
                          modalType: false,
                        })
                      }
                    },
                    fail(failData) {
                      // console.log("failData", failData)
                    },
                    complete(finishData) {
                      // console.log("finishData", finishData)
                    }
                  })
                }
              })
            }
          },
          complete(res) {
            wx.hideLoading(); //隐藏 loading 提示框
          }
        })
      },
      fail: function (err) {
        // console.log(err)
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: err.errMsg,
          modalType: false,
        })
      }
    })
    // console.log("exit download")
  },

  delWeiboQRcode() {

  },

  getLoginQRcode() {
    let that = this
    wx.request({
      url: 'https://www.xxx.com/api/wb/qrcode/getWeiboQRcode',
      // url: 'https://www.xxx.com:8083/api/wb/qrcode/getWeiboQRcode', // dev
      data: {
        'wxuserToken': wx.getStorageSync('wxuserToken'),
      },
      method: 'POST',
      success: function (res) {
        that.setData({
          QRcodeLoadingState: false,
          QRcodeUrl: res.data.img_url,
          QRcodeState: true,
        })
        sendSocketMessage({
          'wxuserToken': wx.getStorageSync('wxuserToken'),
          'msg': "getQRCode"
        })
      },
      fail: function (e) {
        // console.log("失败");
      }
    })
  },

  getWeiboList() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let _this = this
    wx.request({
      url: 'https://www.xxx.com/api/wb/usr/weiboState',
      // url: 'https://www.xxx.com:8083/api/wb/usr/weiboState', //dev
      data: {
        'wxuserToken': wx.getStorageSync('wxuserToken'),
        // 'wxuserToken': 'xxx',
        // 'weiboUserList': wx.getStorageSync('weiboUserList'),
      },
      method: 'POST',
      success: function (res) {
        wx.setStorageSync('weiboUserList', res.data.weiboUserList)
        _this.set_loginState(true)
        let countWeibo = 0
        if (res.data.weiboUserList[0].uid !== "-1") {
          countWeibo = res.data.weiboUserList.length
        }

        _this.setData({
          'weiboUserList': res.data.weiboUserList,
          'countWeibo': countWeibo,
          'userNickName': wx.getStorageSync('wxUsername'),
          'userAvatarUrl': wx.getStorageSync('wxavatarUrl'),
        })
        // console.log("weiboState->", res)
        wx.hideLoading()
      },
      fail: function (e) {
        // console.log("失败");
      }
    })
  },

  delWeiboUser(e){
    let that = this
    let idx = e.detail.name
    let curWeiboUserList = wx.getStorageSync('weiboUserList')
    let weiboUserRemoved = curWeiboUserList[idx]
    if (weiboUserRemoved.uid === "-1") {
      // console.log("默认微博用户不能删除")
      return
    }
    // console.log("test")
    curWeiboUserList.splice(idx, 1)
    wx.setStorageSync('weiboUserList', curWeiboUserList)
    this.setData({
      weiboUserList: curWeiboUserList
    })
    wx.request({
      url: 'https://www.xxx.com/api/wb/usr/delWeiboUser',
      // url: 'https://www.xxx.com:8083/api/wb/usr/delWeiboUser', //dev
      data: {
        'wxuserToken': wx.getStorageSync('wxuserToken'),
        'weiboUser': weiboUserRemoved
      },
      method: 'POST',
      success: function (res) {
        // console.log(res)
        that.getWeiboList()

      },
      fail: function (e) {
        // console.log("失败");
      }
    })
  },

  logoutWeibo(e){
    let idx = e.detail.name
    let curWeiboUserList = wx.getStorageSync('weiboUserList')
    let weiboUserLogout = curWeiboUserList[idx]
    if (weiboUserLogout.uid === "-1") {
      // console.log("默认微博用户不能登出")
      return
    }
    let that = this
    wx.request({
      url: 'https://www.xxx.com/api/wb/usr/logoutWeiboUser',
      // url: 'https://www.xxx.com:8083/api/wb/usr/logoutWeiboUser', // dev
      data: {
        'wxuserToken': wx.getStorageSync('wxuserToken'),
        'weiboUser': weiboUserLogout
      },
      method: 'POST',
      success: function (res) {
        that.getWeiboList()
      },
      fail: function (e) {
        // console.log("失败");
      }
    })
    
  },


  weiboUseronClose(e) {
    // console.log(e)
    let position = e.detail.position
    switch (position) {
      case 'left':
        Dialog.confirm({
          context: this,
          message: '确定删除吗？',
        }).then(() => {
          this.delWeiboUser(e)
          // console.log("删除")
        });
        break;
      case 'cell':
        break;
      case 'right':
        Dialog.confirm({
          context: this,
          message: '确定登出吗？',
        }).then(() => {
          this.logoutWeibo(e)
        });
        break;
    }
  },

  onShareAppMessage() {
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: 'xxx',
          path: '/pages/home/home.js',
          imageUrl: "/images/minipg.jpg"
        })
      }, 2000)
    })
    return {
      title: 'xxx',
      path: '/pages/home/home.js',
      imageUrl: "/images/minipg.jpg",
      promise
    }
  },
  onShareTimeline(){},


  getUserInfo(event) {
    // console.log(event.detail);
  },
  onClose() {
    this.setData({ show: false });
  },

})


function sendHeartbeat() {
  let msg={
    msg:'ping',
    wxuserToken: wx.getStorageSync('wxuserToken'),
   }
  wx.sendSocketMessage({
    data:JSON.stringify(msg), // 心跳消息内容
    success: function () {
      // console.log('发送心跳消息成功');
    },
    fail: function () {
      // console.log('发送心跳消息失败');
    }
  });
}

function startHeartbeat() {
  heartbeatTimerId = setInterval(function () {
    sendHeartbeat();
  }, 1000); // 每隔5秒发送一次心跳消息
}

function stopHeartbeat() {
  // console.log("stopheart")
  clearInterval(heartbeatTimerId);
}



function reconnectWebSocket(onClose, that) {
  if (reconnectTimerId || onClose.reason === "HidePage" || onClose.reason === "logout") {
    return;
  }
  reconnectTimerId = setInterval(function () {
    sotk = wx.connectSocket({
      url: 'wss://www.xxx.com:8081', // 连接本地socket服务
      // url: 'wss://www.xxx.com:8082', //dev
      success: function () {
        // console.log('WebSocket重新连接成功');
        clearInterval(reconnectTimerId);
        reconnectTimerId = null;
      },
      fail: function () {
        // console.log('WebSocket重新连接失败');
      }
    });
    webSokcketMethods(that);
  }, 5000); // 每隔5秒尝试重新连接一次
}

function stopReconnect() {
  // console.log("stopReconnct")
  clearInterval(reconnectTimerId);
  reconnectTimerId = null;
}

function webSocketStart(that) {
  sotk = wx.connectSocket({
    url: "wss://www.xxx.com:8081",
    // url: "wss://www.xxx.com:8082", // dev
    success: res => {
      // console.log('小程序连接成功：', res);
    },
    fail: err => {
      // console.log('出现错误啦！！' + err);
      wx.showToast({
        title: '网络异常！',
      })
    }
  })
  webSokcketMethods(that);
}

function webSokcketMethods(that) {
  // let that = this;
  sotk.onOpen(res => {
    // console.log('监听 WebSocket 连接打开事件。', res);
    sendSocketMessage({
      'wxuserToken': wx.getStorageSync('wxuserToken'),
      'msg': "socketOpen"
    });
    startHeartbeat();
  })
  sotk.onClose(onClose => {
    // console.log('监听 WebSocket 连接关闭事件。', onClose)
    reconnectWebSocket(onClose, that)

  })
  sotk.onError(onError => {
    // console.log('监听 WebSocket 错误。错误信息', onError)
  })

  sotk.onMessage(onMessage => {
    var data = JSON.parse(onMessage.data);
    // console.log('监听WebSocket接受到服务器的消息事件。服务器返回的消息', data);
    let state = data["QRcodeState"]
    let url = data["QRcodeUrl"]
    let noticeState = data["noticeState"]
    let notice = data["notice"]
    let noticeTitle = data["noticeTitle"]
    let rewardVideoCount = data["rewardVideoCount"]
    let checkNotice = wx.getStorageSync('noticeState', noticeState)
    if (state === "" || state === null) {
      state = "未获取二维码或已过期"
    }
    // console.log("state->", state)
    if (state === "登录成功") {
      that.getWeiboList()
    }
    if (state === "登录成功" || state === "二维码出错，请重新获取" || state === "二维码已失效，请重新获取！") {
      that.setData({
        QRcodeLive: false,
      })
    }
    if (state == "二维码未使用，请扫码！") {
      that.setData({
        QRcodeUrl: url,
        QRcodeLoadingState: false,
        QRcodeState: true,
      })
    }
    that.setData({
      QRcodeTips: state,
      noticeMessage: notice,
      noticeTitle: noticeTitle
    })
    
    if ((noticeState === 1 || noticeState === true) && !that.data.noticeShow && !checkNotice) {
      that.setData({
        noticeShow: true
      })
      // console.log(that.data.noticeShow)
      Dialog.alert({
        // theme: 'round-button',
      }).then(() => {
        // on close
        that.setData({
          noticeShow: false
        })
        // console.log("confirm")
        // console.log(that.data.noticeValue)
        wx.setStorageSync('noticeState', true)
        sendSocketMessage({
          'wxuserToken': wx.getStorageSync('wxuserToken'),
          'msg': "setNoticeValue",
          'notice': that.data.noticeValue,
        });
      })
      
    }

    if (rewardVideoCount !== undefined){
      that.setData({
        rewardVideoCount: rewardVideoCount
      })
    }

  })
}

function sendSocketMessage(msg) {
  // let that = this;
  // console.log('通过 WebSocket 连接发送数据', JSON.stringify(msg))
  sotk.send({
    data: JSON.stringify(msg)
  }, function (res) {
    // console.log('已发送', res)
  })
  
}

function closeWebsocket(str){
  sotk.close(
    {
      code: "1000",
      reason: str,
      success: function () {
        // console.log("成功关闭websocket连接");
      }
    }
  )
}

