// DatePicker/DatePicker.js
// const dateUtil = require('../dateutils')


const hours = []
const minutes = []

for (let i = 0; i < 24; i++) {
  hours.push(i);
}
for (let i = 0; i < 60; i++) {
  minutes.push(i);
}

const modes = ["YMDhms", "YMDhm", "YMD", "MD", "hm", "MDhm"]

let resultValue;

let isScroll = false

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: ""
    },
    date: {
      type: Number,
      value: new Date().getTime(),
    },
    mode: {
      type: String,
      value: 'MD',
      observer: function (newVal, oldVal, changedPath) {

        this.initDate();
      }
    },
    isShowDatePicker: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    cMode: "",
    months: [],
    days: [],
    days_dict: {},
    hours: hours,
    minutes: minutes,
    value: [],

    isShowMonth: false,
    isShowDay: false,
    isShowHour: false,
    isShoMinutes: false,

    newYear: false,
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {
      // this.setDateByMode();
      this.initDate();
      console.log("dataMonth->", this.data.months)
      console.log("dataDaysMine->", this.data.days_dict)
    },
    moved() { },
    detached() { },
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached() { }, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready() { },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show() { },
    hide() { },
    resize() { },
  },

  /**
   * 组件的方法列表
   */
  methods: {

    initDate() {
      let cur_years = new Date().getFullYear()
      let cur_months = new Date().getMonth() + 1
      let cur_days = new Date().getDate()
      // let cur_months = 2
      // let cur_days = 27
      let cur_hours = new Date().getHours()
      let cur_minutes = new Date().getMinutes()
      let dayCount = new Date(cur_years, cur_months, 0).getDate()
      
      let dayList = []
      for (let index = 1; index <= dayCount; index++) {
        dayList.push(index)
      }
      let cur_days_idx = dayList.findIndex((x)=>x==cur_days)   
      
      let dayLimit = 5

      let dayGap = dayLimit - (dayList.length - cur_days_idx)
      let initMonth = []
      let initDay = {}
      if (dayGap <= dayLimit && dayGap > 0) {
        if (cur_months === 12) {
          initMonth = [12, 1] 
        }else{
          initMonth = [cur_months, cur_months + 1]
        }
        initDay[0] = dayList.slice(cur_days_idx)
        initDay[1] = dayList.slice(0, dayGap)
      }else{
        initMonth = [cur_months]
        initDay[0] = dayList.slice(cur_days_idx, cur_days_idx+dayLimit)
      }

      console.log("cur_month->", cur_months)
      console.log("initDay->", initDay)
      console.log("initMonth->", initMonth)
      this.setData({
        months: initMonth,
        days_dict: initDay,
        days: initDay[0],
        value: [0, 0, cur_hours, cur_minutes],
      })
      resultValue = this.data.value;
      this.setColumns();

    },


    setColumns() {

      let mode = this.data.mode;

      this.setData({

        isShowMonth: mode == 'YMDhms' || mode == 'YMDhm' || mode == 'YMD' || mode == 'MD' || mode == 'MDhm',
        isShowDay: mode == 'YMDhms' || mode == 'YMDhm' || mode == 'YMD' || mode == 'MD' || mode == 'MDhm',
        isShowHour: mode == 'YMDhms' || mode == 'YMDhm' || mode == 'hm' || mode == 'MDhm',
        isShoMinutes: mode == 'YMDhms' || mode == 'YMDhm' || mode == 'hm' || mode == 'MDhm',
      })
    },

    setDays(month) {
      console.log("month->", month)
      let monthList = this.data.months
      let curIdx = monthList.findIndex((x)=>x==month)
      this.setData({
        days: this.data.days_dict[curIdx]
      })

    },

    bindChange: function (e) {
      const val = e.detail.value
      resultValue = val;
      let month = this.data.months[val[0]];
      this.setDays(month);
      console.log(e)
    },

    bindpickstart: function (e) {
      isScroll = true
      console.log(e)
    },

    bindpickend: function (e) {
      isScroll = false
      console.log(e)
    },

    onCancellClick() {
      this.triggerEvent('datePickerCancellEvent')
    },
    onOkClick() {
      if (isScroll) {
        return
      }
      const myEventDetail = {};
      myEventDetail.data = this.data.data;
      myEventDetail.date = this.getResultDate();
      this.triggerEvent('datePickerOkEvent', myEventDetail)

    },

    getResultDate() {

      let result = 0;
      let year_exp = 0;
      if (this.data.months[0] === 12 && resultValue[0] !== 0) {
        year_exp = 1
      }

      let month = this.data.months[resultValue[0]] - 1;
      let day = this.data.days_dict[resultValue[0]][resultValue[1]];
      let hour = resultValue[2];
      let minutes = resultValue[3];
      console.log("result->", month, day, hour, minutes)
      result = new Date(new Date().getFullYear() + year_exp, month, day, hour, minutes);
      console.log("result->", result)

      return result;
    }
  }
})