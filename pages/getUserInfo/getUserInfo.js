// pages/getUserInfo/getUserInfo.js

import { createStoreBindings } from "mobx-miniprogram-bindings";
import { store } from "../../store/store";
import Dialog from '@vant/weapp/dialog/dialog';

const app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogShow: false,
    username: "",
    avatarUrl: defaultAvatarUrl,
    modalType: false,
    theme: wx.getSystemInfoSync().theme
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
    wx.setStorageSync('wxavatarUrl', defaultAvatarUrl)
    wx.onThemeChange((result) => {
      this.setData({
        theme: result.theme
      })
    })
  },

  onUnload() {
    this.storeBuildings.destroyStoreBindings()
  },

 

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl,
    })
    wx.setStorageSync('wxavatarUrl', e.detail.avatarUrl)
  },

  formSubmit(e) {
    var userName = e.detail.value.nickname
    if (userName.length === 0) {
      wx.showModal({
        title: '提示',
        content: '用户名为空',
        modalType: false,
      })
    }
    else {
      // console.log("confirm_dialog")
      Dialog.confirm({
        title: '使用须知',
        message: '1、根据法律规定，开发者仅处理实现小程序功能所必要的信息。\n2、本小程序主要提供微博管理功能，所以确认使用须知后，表示你同意小程序管理微博包括登录、发送以及转发操作。\n3、为了明确管理微博信息，在确认使用须知后，表示你同意小程序获取并展示登录微博信息包括头像和昵称，以及获取微博登录凭证\n4、小程序仅负责管理微博操作，其中具体微博内容由用户决定，确认使用须知后表示你同意发布的内容不违反国家法律法规。',
      })
      .then(() => {
        // on confirm
        // console.log("confirm")
        wx.setStorageSync('wxUsername', userName)
        this.initMainPage()
      })
      .catch(() => {
        // on cancel
        // console.log("cancel")
        return
      });
      
    }
  },

  initMainPage() {
    wx.login({
      success: (res) => {
        wxUserLogin(res.code, this)
      },
      fail: (e) => {
        // console.log(e)
      }
    })
  },

  dialogClose(){
    this.setData({
      dialogShow: false,
      username: ""
    })
  },

})

function wxUserLogin(usercode, that) {

  wx.showLoading({
    title: '加载中',
    mask: true
  })
  // console.log(usercode)
  wx.request({
    url: 'https://www.xxx.com/api/wx/wxuserLogin',
    data: {
      'userCode': usercode,
      'username': wx.getStorageSync('wxUsername'),
      'avatar': wx.getStorageSync('wxavatarUrl'),
    },
    method: 'POST',
    success: function (res) {
      let wxuserToken = res.data.wxuserToken
      wx.hideLoading()
      if (wxuserToken === "") {
        Dialog.alert({
          title: '登录失败',
          message: '用户名与微信绑定的不一致，请重新输入！',
        }).then(() => {
          // console.log("dialog_then")
        });
        // console.log("here")
      } else {
        wx.setStorageSync('wxuserToken', wxuserToken)
        app.globalData.wxuserState = 1
        // console.log(res);
        jumpToHome(that);
      }
    },
    fail: function (e) {
      // console.log("失败");
      // console.log(e);
    }
  })
}


function jumpToHome(that) {
  var pages = getCurrentPages();
  var prevPage = pages[pages.length - 2]; //上一个页面
  that.set_loginState(true)
  prevPage.setData({
    userAvatarUrl: wx.getStorageSync('wxavatarUrl'),
    userNickName: wx.getStorageSync('wxUsername'),
    initPage: true
  })
  wx.navigateBack({
    url: '/pages/home/home',
  })
  // prevPage.initMainPage()
  // prevPage.onLoad()
  
}