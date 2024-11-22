export function formatMonthDayhm(datetime) {
  return formatWithSeperator(datetime, "-", ":");
}
export function formatWithSeperator(datetime, dateSeprator, timeSeprator) {
  if (datetime != null) {
      const dateMat = new Date(datetime);
      const year = dateMat.getFullYear();
      let month = dateMat.getMonth() + 1;
      // 小于时的加多一个0 不然就是9和09的区别 
      if (month < 10) {
          month = "0" + month;
      }
      let day = dateMat.getDate();
      if (day < 10) {
          day = "0" + day;
      }
      let hh = dateMat.getHours();
      if (hh < 10) {
          hh = "0" + hh;
      }
      let mm = dateMat.getMinutes();
      if (mm < 10) {
          mm = "0" + mm;
      }
      let ss = dateMat.getSeconds();
      const timeFormat = year + " " + month + dateSeprator + day + " " + hh + timeSeprator + mm;
      return timeFormat;
  }
}
