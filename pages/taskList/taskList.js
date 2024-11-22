// pages/taskList/taskList.js

import { createStoreBindings } from "mobx-miniprogram-bindings";
import { store } from "../../store/store";
import { formatMonthDayhm } from "../../utils/utilTime";

const defaultAvatarUrl = 'https://tva1.sinaimg.cn/crop.0.0.179.179.180/d9e5634djw1east9pi6bej2050050dfw.jpg?KID=imgbed,tva&amp;Expires=1698495955&amp;ssig=eZ0EzRgppJ'
const defaultUserNickName = '微博用户'
const app = getApp()

const hoursDate = []
for (let index = 1; index <= 23; index++) {
  hoursDate.push(index)
}

const CheckedList = []
for (let index = 0; index < 8; index++) {
  CheckedList.push(true)
}

const CheckedListTask3 = []
for (let index = 0; index < 3; index++) {
  CheckedListTask3.push(true)
}

const freqDateList = {
  "天": [1, 2, 3, 4, 5],
  "小时": Array.from({ length: 23 }, (v, i) => ++i)
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkedList: CheckedList,
    checkedListTask3: CheckedListTask3,
    collapseName: "1",
    globalDisable: true,
    weiboUserAvatar: defaultAvatarUrl,
    weiboUserState: "未登录",
    weiboUserList: ["微博用户"],
    showWeiboUserList: ["微博用户"],
    curWeiboIdx: -1,
    curWeiboUser: "微博用户",
    openWeiboUserPicker: false,
    uploadTips: "",
    uploadTipsState: true,

    task1State: false,
    task2State: false,
    task3State: false,
    task4State: false,
    task5State: false,

    // task1 params
    task1_freq: 5,
    dateList: ['0:00', '3:00', '6:00', '9:00', '12:00', '15:00', '18:00', '21:00'],

    radioItems: [
      { name: '按时间', value: 'time', checked: 'true' },
      { name: '按次数', value: 'freq' }
    ],

    // task2 params
    task2_PostCount: 7,
    task2_PostFreq: 17,
    radioValueTask2: "time",
    task_2_freqDate_value: [1, "天"],
    task2_CountFreq: "300",
    columnsFreqDateTask2: [
      {
        values: freqDateList["天"],
        className: 'column1',
      },
      {
        values: Object.keys(freqDateList),
        className: 'column2'
      }
    ],
    openFreqDatePickerTask2: false,
    task2_continue: false,

    // task3 params
    task3_UserCount: 4,
    task3_TaskInterval: 30,
    radioValueTask3: "time",
    task_3_freqDate_value: [1, "天"],
    task3_CountFreq: "300",
    columnsFreqDateTask3: [
      {
        values: freqDateList["天"],
        className: 'column1',
      },
      {
        values: Object.keys(freqDateList),
        className: 'column2'
      }
    ],
    openFreqDatePickerTask3: false,

    // task4 params
    task4_weiboUrl: "",
    task4_CountFreq: 15,
    task4_interval: 15, // sec
    task4_round: 10,
    task4_roundInterval: 20, // min
    task4_totalTime: 3.62+"小时",
    task4_totalCount: 150,


    // task5 params
    postIntoSuperTopic: false,
    splitImg: true,
    superToicUrl: "",
    postText: "",
    isShowPicker: false,
    mode: "YMDhms",
    data: {},
    date: new Date().getTime(),

    imgFileList: [],
    // Task5_executeTime: "立即发送",
    Task5_executeTime: formatMonthDayhm(new Date()),

  },

  // Header
  showWeiboUserPicker() {
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
    var _weiboUserState = this.data.weiboUserList[e.detail.index].userState
    var _weiboUserAvatar = this.data.weiboUserList[e.detail.index].userAvatar
    var _curWeiboUser = e.detail.value
    app.globalData.curWeiboUserIdx = e.detail.index
    this.setData({
      openWeiboUserPicker: false,
      curWeiboUser: _curWeiboUser,
      weiboUserState: _weiboUserState,
      weiboUserAvatar: _weiboUserAvatar,
      curWeiboIdx: e.detail.index,
      
      // init task5
      postIntoSuperTopic: false,
      splitImg: true,
      superToicUrl: "",
      postText: "",
      isShowPicker: false,
      mode: "YMDhms",
      data: {},
      date: new Date().getTime(),
      imgFileList: [],
      uploadTips: "",
      uploadTipsState: true
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
    getWeiboTaskState(this, e.detail.index)
  },
  onWeiboUserChange(event) {
    const { picker, value, index } = event.detail;
    // console.log(index, value)
  },

  // Task1

  checkHandlerTask1(e) {
    var _checkedList = []
    for (let index = 0; index < this.data.checkedList.length; index++) {
      if (e.detail.value.indexOf(index.toString()) !== -1) {
        _checkedList.push(true)
      } else {
        _checkedList.push(false)
      }
    }
    this.setData({
      checkedList: _checkedList
    })
  },

  checkHandlerTask3(e) {
    // console.log(e)
    var _checkedList = []
    var _context = ["repost", "like", "comment"]
    for (let index = 0; index < this.data.checkedListTask3.length; index++) {
      if (e.detail.value.indexOf(_context[index]) !== -1) {
        _checkedList.push(true)
      } else {
        _checkedList.push(false)
      }
    }
    this.setData({
      checkedListTask3: _checkedList
    })
  },


  radioTask2Change(e) {
    var mode = e.detail.value
    this.setData({
      radioValueTask2: mode
    })
  },

  radioTask3Change(e) {
    var mode = e.detail.value
    this.setData({
      radioValueTask3: mode
    })
  },

  collapseNameChange(e) {
    this.setData({
      collapseName: e.detail,
    });
  },

  showFreqDatePickerTask2() {
    this.setData({ openFreqDatePickerTask2: true });
  },
  showFreqDatePickerTask3() {
    this.setData({ openFreqDatePickerTask3: true });
  },
  closeFreqDatePickerTask2() {
    this.setData({ openFreqDatePickerTask2: false });
  },
  closeFreqDatePickerTask3() {
    this.setData({ openFreqDatePickerTask3: false });
  },
  confirmFreqDatePickerTask2(e) {
    // console.log(e.detail.value)
    this.setData({
      openFreqDatePickerTask2: false,
      task_2_freqDate_value: e.detail.value
    })
  },
  confirmFreqDatePickerTask3(e) {
    // console.log(e.detail.value)
    this.setData({
      openFreqDatePickerTask3: false,
      task_3_freqDate_value: e.detail.value
    })
  },
  onFreqDateChange(event) {
    const { picker, value, index } = event.detail;
    picker.setColumnValues(0, freqDateList[value[1]]);
  },

  // task5
  task5_checkChange(e) {
    let checkList = e.detail.value
    let checksplitImg = checkList.findIndex((x) => x == "splitImg")
    let checkpostIntoSuperTopic = checkList.findIndex((x) => x == "postIntoSuperTopic")
    this.setData({
      splitImg: checksplitImg !== -1,
      postIntoSuperTopic: checkpostIntoSuperTopic !== -1
    })

  },

  afterRead(event) {
    // console.log("上传图片")
    const { file } = event.detail;
    // console.log(file)
    const { imgFileList = [] } = this.data;
    imgFileList.push({ ...file});
    this.setData({ imgFileList });
    this.setData({
      uploadTips: "图片上传中...",
      uploadTipsState: false
    })
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    let that = this
    // console.log("split->", that.data.splitImg)
    let weiboUser = wx.getStorageSync('weiboUserList')[this.data.curWeiboIdx]
    wx.uploadFile({
      url: 'https://www.xxx.com/api/wb/img/uploadImg', // 仅为示例，非真实的接口地址
      // url: 'https://www.xxx.com:8083/api/wb/img/uploadImg', //dev
      filePath: file.url,
      name: 'img',
      formData: {
        'data':JSON.stringify(
          {
            'wxuserToken': wx.getStorageSync('wxuserToken'),
            'weiboUser': weiboUser
          }
        )
      },
      success(res) {
        // 上传完成需要更新 fileList
        // console.log(res)
        // console.log(res.data === "True")
        if (res.data === "True") {
          that.setData({
            uploadTips: "上传成功！",
            uploadTipsState: true
          })
        }else{
          that.setData({
            uploadTips: "上传失败！",
            uploadTipsState: false
          })
        }
        // const { imgFileList = [] } = that.data;
        // imgFileList.push({ ...file, url: res.data });
        // that.setData({ imgFileList });
        // console.log("上传完成")
      },
    });

  },

  imgListDelete(e) {
    // console.log(e)
    this.setData({
      imgFileList: [],
      uploadTips: "",
      uploadTipsState: true
    })
  },

  showPicker: function (e) {
    this.setData({
      isShowPicker: true
    })
  },
  datePickerCancellEvent: function (e) {
    this.setData({
      isShowPicker: false
    })
    // console.log(e)
  },
  datePickerOkEvent: function (e) {
    this.setData({
      isShowPicker: false
    })
    let date = formatMonthDayhm(e.detail.date);
    // console.log("date->", date)
    this.setData({
      Task5_executeTime: date
    })
  },

  onMDhm: function (e) {
    this.setData({
      isShowPicker: true,
      mode: "MDhm",
      data: { type: "MDhm" }
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

    // getWeiboTaskState(this, 0)
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
          task1State: false,
          task2State: false,
          task3State: false,
          task4State: false,
          task5State: false,
        })
      }
      this.setData({
        curWeiboUser: _curWeiboUser,
        weiboUserState: _weiboUserState,
        weiboUserAvatar: _weiboUserAvatar,
      })
      getWeiboTaskState(this, this.data.curWeiboIdx)
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
    // console.log("onLoad", _weiboUserList)
  },

  onPullDownRefresh(){
    // console.log("refresh")
    this.onShow()
    wx.stopPullDownRefresh()
  },

  allSelect() {
    var _checkedList = []
    this.data.checkedList.forEach(element => {
      _checkedList.push(true)
    });
    this.setData({
      checkedList: _checkedList
    })
  },

  deSelect() {
    var _checkedList = []
    this.data.checkedList.forEach(element => {
      _checkedList.push(false)
    });
    this.setData({
      checkedList: _checkedList
    })
  },

  inverseSelect() {
    var _checkedList = []
    this.data.checkedList.forEach(element => {
      _checkedList.push(!element)
    });
    this.setData({
      checkedList: _checkedList
    })
  },


  // task1 part 

  onChangeTask1_freq(e) {
    this.setData({
      task1_freq: e.detail
    })
  },

  uploadTask1(e) {
    let checked = this.data.checkedList
    let task1_freq = this.data.task1_freq
    // console.log(checked)
    // console.log(task1_freq)
    executeTask(
      this,
      wx.getStorageSync('weiboUserList')[this.data.curWeiboIdx], 
      [checked, task1_freq], 
      "task1")
  },

  // task2 part

  onChangeTask2_PostCount(e) {
    this.setData({
      task2_PostCount: e.detail
    })
  },

  onChangeTask2_PostFreq(e) {
    this.setData({
      task2_PostFreq: e.detail
    })
  },

  onChangeTask2_Continue(e){
    // console.log(e)
    let res
    if (e.detail.value.length === 1) {
      res = true
    }else{
      res = false
    }
    this.setData({
      task2_continue: res
    })
    // console.log(this.data.task2_continue)
  },

  onInputTask2_CountFreq(e) {
    this.setData({
      task2_CountFreq: e.detail.value
    })
  },

  uploadTask2(e) {
    let executeMode = this.data.radioValueTask2
    let task2_Timefreq = this.data.task_2_freqDate_value
    let task2_CountFreq = this.data.task2_CountFreq
    let task2_PostCount = this.data.task2_PostCount
    let task2_PostFreq = this.data.task2_PostFreq
    let task2_continue = this.data.task2_continue
    let task2_Freq
    if (executeMode === "time") {
      // console.log(task2_Timefreq)
      task2_Freq = task2_Timefreq
    } else {
      // console.log(task2_CountFreq)
      task2_Freq = task2_CountFreq
    }
    // console.log(task2_PostCount)
    // console.log(task2_PostFreq)
    executeTask(
      this,
      wx.getStorageSync('weiboUserList')[this.data.curWeiboIdx],
      [task2_PostCount, task2_PostFreq, executeMode, task2_Freq, task2_continue],
      "task2"
    )
  },

  // task3 part

  onChangeTask3_UserCount(e) {
    // console.log(e)
    this.setData({
      task3_UserCount: e.detail
    })
  },

  onChangeTask3_TaskInterval(e) {
    this.setData({
      task3_TaskInterval: e.detail
    })
  },

  onInputTask3_CountFreq(e) {
    this.setData({
      task3_CountFreq: e.detail.value
    })
  },

  uploadTask3(e) {
    // console.log("button task3 execute -> ")
    let executeMode = this.data.radioValueTask3
    let checkedListTask3 = this.data.checkedListTask3
    let userCount = this.data.task3_UserCount
    let taskInterval = this.data.task3_TaskInterval
    let taskFreq
    // console.log(this.data.checkedListTask3)
    // console.log(this.data.task3_UserCount)
    // console.log(this.data.task3_TaskInterval)
    if (executeMode === "time") {
      taskFreq = this.data.task_3_freqDate_value
      // console.log(this.data.task_3_freqDate_value)
    } else {
      taskFreq = this.data.task3_CountFreq
      // console.log(this.data.task3_CountFreq)
    }
    executeTask(
      this,
      wx.getStorageSync('weiboUserList')[this.data.curWeiboIdx],
      [checkedListTask3, userCount, taskInterval, executeMode, taskFreq],
      "task3"
    )
  },

  // task4 part
  exceptTime(t1, t2){
    let scale = ["秒", "分钟", "小时"]
    let scaleIdx = 0
    let t = (t1 + t2) / 2
    if (t > 60) {
      t /= 60
      scaleIdx += 1
    }
    if (t > 60) {
      t /= 60
      scaleIdx += 1
    }
    return t.toFixed(2) + scale[scaleIdx]

  },

  onInputTask4_WeiboUrl(e) {
    this.setData({
      task4_weiboUrl: e.detail.value
    })
    // console.log(e.detail.value)
  },

  onInputTask4_CountFreq(e) {
    let inputCountFreq
    let flag = false
    if (e.detail.value !== "") {
      if (isNaN(e.detail.value)) {
        flag = true
        inputCountFreq = 15
      }else{
        inputCountFreq = parseInt(e.detail.value)
      }
    }else{
      inputCountFreq = 15
    }
    let timeMin = Math.max(this.data.task4_interval - 3, 0) * (inputCountFreq * this.data.task4_round - 1) + ((this.data.task4_round-1) * Math.max(this.data.task4_roundInterval - 3, 0)) * 60
    let timeMax = (this.data.task4_interval + 3) * (inputCountFreq * this.data.task4_round - 1) + ((this.data.task4_round-1) * (this.data.task4_roundInterval + 3)) * 60

    this.setData({
      task4_CountFreq: inputCountFreq,
      task4_totalTime: this.exceptTime(timeMin, timeMax),
      task4_totalCount: inputCountFreq * this.data.task4_round
    })
    // console.log(this.data.task4_CountFreq)
    if (flag) {
      return {
        value: 15,
        pos: 0
      }
    }
    
  },

  onInputTask4_taskInterval(e){
    let inputTime
    let flag = false
    if (e.detail.value !== "") {
      if (isNaN(e.detail.value)) {
        flag = true
        inputTime = 15
      }else{
        inputTime = parseInt(e.detail.value)
      }
    }else{
      inputTime = 15
    }
    // console.log(inputTime, this.data.task4_totalCount, this.data.task4_round, this.data.task4_roundInterval)
    let timeMin = Math.max(inputTime - 3, 0) * (this.data.task4_totalCount-1) + ((this.data.task4_round-1) * Math.max(this.data.task4_roundInterval - 3, 0)) * 60
    let timeMax = (inputTime + 3) * (this.data.task4_totalCount-1) + ((this.data.task4_round-1) * (this.data.task4_roundInterval + 3)) * 60
    this.setData({
      task4_interval: inputTime,
      task4_totalTime: this.exceptTime(timeMin, timeMax)
    })
    // console.log(this.data.task4_interval)
    if (flag) {
      return {
        value: 15,
        pos: 0
      }
    }
  },

  onInputTask4_taskRound(e){
    let inputRound
    let flag = false
    if (e.detail.value !== "") {
      if (isNaN(e.detail.value)) {
        flag = true
        inputRound = 10
      }else{
        inputRound = parseInt(e.detail.value)
      }
    }else{
      inputRound = 10
    }
    let timeMin = Math.max(this.data.task4_interval - 3, 0) * (inputRound * this.data.task4_CountFreq - 1) + ((inputRound-1) * Math.max(this.data.task4_roundInterval - 3, 0)) * 60
    let timeMax = (this.data.task4_interval + 3) * (inputRound * this.data.task4_CountFreq - 1) + ((inputRound-1) * (this.data.task4_roundInterval + 3)) * 60
    this.setData({
      task4_round: inputRound,
      task4_totalTime: this.exceptTime(timeMin, timeMax),
      task4_totalCount: inputRound * this.data.task4_CountFreq
    })
    // console.log(this.data.task4_round)
    if (flag) {
      return {
        value: 10,
        pos: 0
      }
    }
  },
  
  onInputTask4_taskRoundInterval(e){
    let inputRoundInterval
    let flag = false
    if (e.detail.value !== "") {
      if (isNaN(e.detail.value)) {
        flag = true
        inputRoundInterval = 20
      }else{
        inputRoundInterval = parseInt(e.detail.value)
      }
    }else{
      inputRoundInterval = 20
    }
    let timeMin = Math.max(this.data.task4_interval - 3, 0) * (this.data.task4_totalCount-1) + ((this.data.task4_round-1) * Math.max(inputRoundInterval - 3, 0)) * 60
    let timeMax = (this.data.task4_interval + 3) * (this.data.task4_totalCount-1) + ((this.data.task4_round-1) * (inputRoundInterval + 3)) * 60

    this.setData({
      task4_roundInterval: inputRoundInterval,
      task4_totalTime: this.exceptTime(timeMin, timeMax)
    })
    // console.log(this.data.task4_roundInterval)
    if (flag) {
      return {
        value: 20,
        pos: 0
      }
    }
  },

  uploadTask4(e) {
    // console.log(this.data.task4_weiboUrl)
    // console.log(this.data.task4_CountFreq)
    let weiboUrl = this.data.task4_weiboUrl
    let countFreq = this.data.task4_CountFreq
    let interval = this.data.task4_interval
    let round = this.data.task4_round
    let roundInterval = this.data.task4_roundInterval
    executeTask(
      this,
      wx.getStorageSync('weiboUserList')[this.data.curWeiboIdx],
      [weiboUrl, countFreq, interval, round, roundInterval],
      "task4"
    )
  },

  // task5 part
  topicUrlChange(e) {
    this.setData({
      superToicUrl: e.detail
    })
  },

  postTextInput(e) {
    this.setData({
      postText: e.detail
    })
  },

  uploadTask5(e) {
    let postIntoSuperTopic = this.data.postIntoSuperTopic
    let splitImg = this.data.splitImg
    let superToicUrl = this.data.superToicUrl
    let postText = this.data.postText
    let imgExist = this.data.imgFileList.length !== 0
    let Task5_executeTime = this.data.Task5_executeTime

    executeTask(
      this,
      wx.getStorageSync('weiboUserList')[this.data.curWeiboIdx],
      [splitImg, postIntoSuperTopic, superToicUrl, postText, imgExist, Task5_executeTime],
      "task5"
    )
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

function getWeiboTaskState(that, curWeiboIdx) {
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  let curWeiboUser = wx.getStorageSync('weiboUserList')[curWeiboIdx]
  // console.log(curWeiboUser)
  if (curWeiboUser === "" || curWeiboUser === undefined) {
    wx.hideLoading()
    return
  }
  wx.request({
    url: 'https://www.xxx.com/api/wb/task/getWeiboTaskState',
    // url: 'https://www.xxx.com:8083/api/wb/task/getWeiboTaskState', // dev
    data: {
      'wxuserToken': wx.getStorageSync('wxuserToken'),
      'weiboUser': curWeiboUser,
    },
    method: 'POST',
    success: function (res) {
      // console.log(res)
      that.setData({
        task1State: res.data.taskState[0],
        task2State: res.data.taskState[1],
        task3State: res.data.taskState[2],
        task4State: res.data.taskState[3],
        task5State: res.data.taskState[4],
      })
      wx.hideLoading()
    },
    fail: function (e) {
      // console.log("失败");
      wx.hideLoading()
    }
  })
}

function executeTask(that, weiboUser, params, taskId) {
  // console.log(weiboUser)
  // console.log(params)
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  wx.request({
    url: 'https://www.xxx.com/api/wb/task/executeTask',
    // url: 'https://www.xxx.com:8083/api/wb/task/executeTask', //dev
    data: {
      'wxuserToken': wx.getStorageSync('wxuserToken'),
      'weiboUser': weiboUser,
      'taskId': taskId,
      'params': params
    },
    method: 'POST',
    success: function (res) {
      // console.log(res)
      wx.hideLoading()
      getWeiboTaskState(that, that.data.curWeiboIdx)
      getWeiboList(that)
      that.onShow()
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