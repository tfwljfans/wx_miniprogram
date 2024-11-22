// pages/taskManager/taskManager.js

import { createStoreBindings } from "mobx-miniprogram-bindings";
import { store } from "../../store/store";

const defaultAvatarUrl = 'https://tva1.sinaimg.cn/crop.0.0.179.179.180/d9e5634djw1east9pi6bej2050050dfw.jpg?KID=imgbed,tva&amp;Expires=1698495955&amp;ssig=eZ0EzRgppJ'
const defaultUserNickName = '微博用户'
const app = getApp()

Page({
  /**
   * 广告
   */

  adLoad() {
    // console.log('视频广告 广告加载成功')
    this.setData({
      adShow: 'block',
    })
  },
  adError(err) {
    this.setData({
      adShow: 'none',
    })
  },
  adClose() {
    // console.log('视频广告 广告关闭')
    this.setData({
      adShow: 'none',
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    adShow: 'block',
    weiboUserAvatar: defaultAvatarUrl,
    weiboUserState: "未登录",
    weiboUserList: ["微博用户"],
    curWeiboIdx: -1,
    showWeiboUserList: ["微博用户"],
    curWeiboUser: "微博用户",
    openWeiboUserPicker: false,
    globalDisable: true,
    curfId: 1,
    curName: "选择微博",
    title: "微博昵称",

    flushButton_task1: false,
    flushKillButton_task1: false,
    killButton_task1: true,
    flushButton_task2: false,
    flushKillButton_task2: false,
    killButton_task2: true,
    flushButton_task3: false,
    flushKillButton_task3: false,
    killButton_task3: true,
    flushButton_task4: false,
    flushKillButton_task4: false,
    killButton_task4: true,
    flushButton_task5: false,
    flushKillButton_task5: false,
    killButton_task5: true,

    task1Info_first: "未选定微博",
    task1Info_second: "",
    task2Info_first: "未选定微博",
    task2Info_second: "",
    task3Info_first: "未选定微博",
    task3Info_second: "",
    task4Info_first: "未选定微博",
    task4Info_second: "",
    task5Info_first: "未选定微博",
    task5Info_second: "",
  },

  // Header
  showWeiboUserPicker() {
    // console.log("showList")
    
    this.setData({ openWeiboUserPicker: true });
  },
  closeWeiboUserPicker() {
    this.setData({ openWeiboUserPicker: false });
  },
  confirmWeiboUserPicker(e) {
    // console.log(e.detail)
    let weiboIdx = e.detail.index
    if (this.data.weiboUserList[weiboIdx].uid === "-1") {
      // console.log("默认用户不能选择")
      this.setData({
        openWeiboUserPicker: false,
      })
      return
    }
    let weiboUsername = e.detail.value
    let _weiboUserState = this.data.weiboUserList[weiboIdx].userState
    let _weiboUserAvatar = this.data.weiboUserList[weiboIdx].userAvatar
    let _curWeiboUser = weiboUsername
    app.globalData.curWeiboUserIdx = weiboIdx
    this.setData({
      openWeiboUserPicker: false,
      curWeiboUser: _curWeiboUser,
      weiboUserState: _weiboUserState,
      weiboUserAvatar: _weiboUserAvatar,
      curWeiboIdx: weiboIdx
    })
    if (_weiboUserState === "未登录") {
      this.setData({
        globalDisable: true
      })
    } else {
      this.setData({
        globalDisable: false
      })
    }
    getWeiboUserLog(this, weiboIdx)
    getWeiboList(this)
  },
  onWeiboUserChange(event) {
    const { picker, value, index } = event.detail;
    // console.log(index)
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
    var _weiboUserList = wx.getStorageSync('weiboUserList')
    var _showWeiboUserList = []
    for (let index = 0; index < _weiboUserList.length; index++) {
      _showWeiboUserList.push(_weiboUserList[index].userNickName)
    }
    this.setData({
      weiboUserList: _weiboUserList,
      showWeiboUserList: _showWeiboUserList,
      radioValue: "time",
    })
    // console.log("onLoad", _weiboUserList)
  },

  onShow(){
    var _weiboUserList = wx.getStorageSync('weiboUserList')
    var _showWeiboUserList = []
    for (let index = 0; index < _weiboUserList.length; index++) {
      _showWeiboUserList.push(_weiboUserList[index].userNickName)
    }
    this.setData({
      weiboUserList: _weiboUserList,
      showWeiboUserList: _showWeiboUserList,
      curWeiboIdx: app.globalData.curWeiboUserIdx,
      radioValue: "time",
    })
    // console.log(this.data.curWeiboIdx)
    if (this.data.curWeiboIdx !== -1) {
      if (this.data.weiboUserList.length < this.data.curWeiboIdx + 1) {
        this.setData({
          curWeiboIdx: this.data.weiboUserList.length - 1
        })
      }
      let _weiboUserUid = this.data.weiboUserList[this.data.curWeiboIdx].uid
      let _curWeiboUser = this.data.weiboUserList[this.data.curWeiboIdx].userNickName
      let _weiboUserState = this.data.weiboUserList[this.data.curWeiboIdx].userState
      let _weiboUserAvatar = this.data.weiboUserList[this.data.curWeiboIdx].userAvatar
      if (_weiboUserUid === "-1") {
        this.setData({
          curWeiboIdx: -1,
          task1Info_first: "未选定微博",
          task1Info_second: "",
          task2Info_first: "未选定微博",
          task2Info_second: "",
          task3Info_first: "未选定微博",
          task3Info_second: "",
          task4Info_first: "未选定微博",
          task4Info_second: "",
          task5Info_first: "未选定微博",
          task5Info_second: "",
        })
      }else{
        getWeiboUserLog(this, this.data.curWeiboIdx)
      }
      this.setData({
        curWeiboUser: _curWeiboUser,
        weiboUserState: _weiboUserState,
        weiboUserAvatar: _weiboUserAvatar,
      })
      getWeiboList(this)
      if (this.data.weiboUserState === "未登录") {
        this.setData({
          globalDisable: true
        })
      } else {
        this.setData({
          globalDisable: false
        })
      }
    }
  },
  
  onPullDownRefresh(){
    // console.log("refresh")
    this.onShow()
    wx.stopPullDownRefresh()
  },


  changeWeiboUser(e) {
    var id = e.detail.selectId
    this.setData({
      weiboUserAvatar: this.data.weiboUserList[id - 1].userAvatar,
      weiboUserState: this.data.weiboUserList[id - 1].userState
    })

    // console.log(e.detail.selectId);
    // console.log(e.detail.select);

  },

  delWeiboTask(e) {

    let mode = e.currentTarget.dataset.value
    if (mode === "1") {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    let taskId = e.currentTarget.dataset.task
    if (mode === "2") {
      if (taskId === "task1") { this.setData({ killButton_task1: true,  flushKillButton_task1: true }) }
      if (taskId === "task2") { this.setData({ killButton_task2: true,  flushKillButton_task2: true }) }
      if (taskId === "task3") { this.setData({ killButton_task3: true,  flushKillButton_task3: true }) }
      if (taskId === "task4") { this.setData({ killButton_task4: true,  flushKillButton_task4: true }) }
      if (taskId === "task5") { this.setData({ killButton_task5: true,  flushKillButton_task5: true }) }
    }
    let that = this
    let weiboUser = wx.getStorageSync('weiboUserList')[this.data.curWeiboIdx]
    // console.log(weiboUser)
    wx.request({
      url: 'https://www.xxx.com/api/wb/task/delWeiboTask',
      // url: 'https://www.xxx.com:8083/api/wb/task/delWeiboTask', //dev
      data: {
        'wxuserToken': wx.getStorageSync('wxuserToken'),
        'weiboUser': weiboUser,
        'mode': mode,
        'taskId': taskId
      },
      method: 'POST',
      success: function (res) {
        if (mode === "1") {
          wx.hideLoading()
          getWeiboUserLog(that, that.data.curWeiboIdx)
        }
        if (mode === "2") {
          if (taskId === "task1") { that.setData({ killButton_task1: false, flushKillButton_task1: false }) }
          if (taskId === "task2") { that.setData({ killButton_task2: false, flushKillButton_task2: false }) }
          if (taskId === "task3") { that.setData({ killButton_task3: false, flushKillButton_task3: false }) }
          if (taskId === "task4") { that.setData({ killButton_task4: false, flushKillButton_task4: false }) }
          if (taskId === "task5") { that.setData({ killButton_task5: false, flushKillButton_task5: false }) }
          getWeiboUserSingleLogs(that, that.data.curWeiboIdx, taskId)
        }
        // console.log(res)
        // wx.hideLoading()
      },
      fail: function (e) {
        if (mode === "1") {
          wx.hideLoading()
        }
        if (mode === "2") {
          if (taskId === "task1") { that.setData({ killButton_task1: false, flushKillButton_task1: false }) }
          if (taskId === "task2") { that.setData({ killButton_task2: false, flushKillButton_task2: false }) }
          if (taskId === "task3") { that.setData({ killButton_task3: false, flushKillButton_task3: false }) }
          if (taskId === "task5") { that.setData({ killButton_task5: false, flushKillButton_task5: false }) }
        }
        // console.log("失败");
        // wx.hideLoading()
      }
    })
  },

  flushWeiboTaskLog(e) {
    let weiboIdx = this.data.curWeiboIdx
    let taskId = e.currentTarget.dataset.task
    getWeiboUserSingleLogs(this, weiboIdx, taskId)
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
  onShareTimeline(){}

})

function getWeiboUserSingleLogs(that, weiboIdx, taskId) {
  if (taskId === "task1") { that.setData({ flushButton_task1: true }) }
  if (taskId === "task2") { that.setData({ flushButton_task2: true }) }
  if (taskId === "task3") { that.setData({ flushButton_task3: true }) }
  if (taskId === "task4") { that.setData({ flushButton_task4: true }) }
  if (taskId === "task5") { that.setData({ flushButton_task5: true }) }
  let weiboUser = wx.getStorageSync('weiboUserList')[weiboIdx]
  // console.log("after")
  // console.log(taskId)
  wx.request({
    url: 'https://www.xxx.com/api/wb/log/getWeiboLogs',
    // url: 'https://www.xxx.com:8083/api/wb/log/getWeiboLogs', //dev
    data: {
      'wxuserToken': wx.getStorageSync('wxuserToken'),
      'weiboUser': weiboUser,
      'taskId': taskId
    },
    method: 'POST',
    success: function (res) {
      // let task1State = true, task2State = true, task3State = true, task4State = true, task5State = true
      let task1State = false, task2State = false, task3State = false, task4State = false, task5State = false
      if (taskId === "task1") {
        // if (res.data.task1[2] === 0) { task1State = false}
        if (res.data.task1[2] === -1) { task1State = true}
        that.setData({
          task1Info_first: res.data.task1[0],
          task1Info_second: res.data.task1[1],
          flushButton_task1: false,
          killButton_task1: task1State,
        })
      }
      if (taskId === "task2") {
        // if (res.data.task2[2] === 0) { task2State = false}
        if (res.data.task2[2] === -1) { task2State = true}
        that.setData({
          task2Info_first: res.data.task2[0],
          task2Info_second: res.data.task2[1],
          flushButton_task2: false,
          killButton_task2: task2State,
        })
      }
      if (taskId === "task3") {
        // if (res.data.task3[2] === 0) { task3State = false}
        if (res.data.task3[2] === -1) { task3State = true}
        that.setData({
          task3Info_first: res.data.task3[0],
          task3Info_second: res.data.task3[1],
          flushButton_task3: false,
          killButton_task3: task3State,
        })
      }
      if (taskId === "task4") {
        // if (res.data.task4[2] === 0) { task4State = false}
        if (res.data.task4[2] === -1) { task4State = true}
        that.setData({
          task4Info_first: res.data.task4[0],
          task4Info_second: res.data.task4[1],
          flushButton_task4: false,
          killButton_task4: task4State,
        })
      }
      if (taskId === "task5") {
        // if (res.data.task5[2] === 0) { task5State = false}
        if (res.data.task5[2] === -1) { task5State = true}
        that.setData({
          task5Info_first: res.data.task5[0],
          task5Info_second: res.data.task5[1],
          flushButton_task5: false,
          killButton_task5: task5State,
        })
      }
      // console.log(res)
    },
    fail: function (e) {
      // console.log("失败");
    }
  })

}

function getWeiboUserLog(that, weiboIdx) {
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  let weiboUser = wx.getStorageSync('weiboUserList')[weiboIdx]
  // console.log("after")
  // console.log(weiboUser)
  wx.request({
    url: 'https://www.xxx.com/api/wb/log/getWeiboLogs',
    // url: 'https://www.xxx.com:8083/api/wb/log/getWeiboLogs', //dev
    data: {
      'wxuserToken': wx.getStorageSync('wxuserToken'),
      'weiboUser': weiboUser,
      'taskId': "allTask"
    },
    method: 'POST',
    success: function (res) {
      // let task1State = true, task2State = true, task3State = true, task4State = true, task5State = true
      let task1State = false, task2State = false, task3State = false, task4State = false, task5State = false
      console.log(res)
      // if (res.data.task1[2] === 0) { task1State = false}
      // if (res.data.task2[2] === 0) { task2State = false}
      // if (res.data.task3[2] === 0) { task3State = false}
      // if (res.data.task4[2] === 0) { task4State = false}
      // if (res.data.task5[2] === 0) { task5State = false}
      if (res.data.task1[2] === -1) { task1State = true}
      if (res.data.task2[2] === -1) { task2State = true}
      if (res.data.task3[2] === -1) { task3State = true}
      if (res.data.task4[2] === -1) { task4State = true}
      if (res.data.task5[2] === -1) { task5State = true}
      that.setData({
        task1Info_first: res.data.task1[0],
        task1Info_second: res.data.task1[1],
        killButton_task1: task1State,
        task2Info_first: res.data.task2[0],
        task2Info_second: res.data.task2[1],
        killButton_task2: task2State,
        task3Info_first: res.data.task3[0],
        task3Info_second: res.data.task3[1],
        killButton_task3: task3State,
        task4Info_first: res.data.task4[0],
        task4Info_second: res.data.task4[1],
        killButton_task4: task4State,
        task5Info_first: res.data.task5[0],
        task5Info_second: res.data.task5[1],
        killButton_task5: task5State
      })
      // console.log(res)
      wx.hideLoading()
    },
    fail: function (e) {
      // console.log("失败");
      wx.hideLoading()
    }
  })

}

function getWeiboList(that) {
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  let _this = that
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
}