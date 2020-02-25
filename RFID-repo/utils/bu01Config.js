//频段区域
var bandArea =  (() => {
  return {
    //hex
    AREA_KOREA : '11',
    AREA_US1 : '21',
    AREA_US2 : '22',
    AREA_EUROPE : '31',
    AREA_JAPAN : '41',
    AREA_CHINA1 : '51',
    AREA_CHINA2 : '52',
  }
})()

//功率
var power = (() => {
  return {
    //dec
    POWER_MIN : 15,
    POWER_MAX : 25,
  }
})()

//蜂鸣器
var buzzer = (() => {
  return {
    //hex
    BUZZER_OPEN : '01',
    BUZZER_CLOSE : '00',
  }
})()

//指示灯
var light = (() => {
  return {
    //hex
    LIGHT_OPEN : '01',
    LIGHT_CLOSE : '00',
  }
})()

//内存块
var bank = (() => {
  return {
    //hex
    BANK_RFU : '00',
    BANK_EPC : '01',
    BANK_TID : '02',
    BANK_USER : '03',
  }
})()

//锁区域
var lockObj = (() => {
  return {
    //hex
    LOCK_OBJ_EPC : '00',
    LOCK_OBJ_USER : '01',
    LOCK_OBJ_ACC_PWD : '02',
    LOCK_OBJ_KILL_PWD : '03',
  }
})()


//锁操作
var lockAction = (() => {
  return {
    //hex
    LOCK_ACTION_UNLOCK : '00',
    LOCK_ACTION_LOCK : '01',
    LOCK_ACTION_LOCK_PERM : '02',
  }
})()

//PA控制
var paStatus = (() => {
  return {
    //hex
    PA_OPEN: '00',
    PA_CLOSE: '01',
  }
})

module.exports = {
  bandArea : bandArea,
  power : power,
  buzzer : buzzer,
  light : light,
  bank: bank,
  lockObj :lockObj,
  lockAction : lockAction,
  paStatus: paStatus,
}