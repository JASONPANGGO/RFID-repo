// pages/bu01-setting/setting.js
const bu01Reader = require('../../utils/bu01Reader.js')
const readerConfig = require('../../utils/bu01Config.js')
const errorCode = require('../../utils/errorCode.js')
import Toast from '../../lib/vant-weapp/dist/toast/toast';
import Dialog from '../../lib/vant-weapp/dist/dialog/dialog';
const app = getApp()
const {
  request
} = require('../../utils/promisefy.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

    results: {
      battery: '',
      buzzer: false,
      versoin: '',
      bandArea: readerConfig.bandArea.AREA_CHINA2,
      lightIndicator: [],
      power: 25,
      serialNumber: '',
      session: 0,
      target: 0,
      Q: 4,
      epc: '',
      tid: '',
    },

    tab: 'tab1',
    tab1Visible: true,
    tab2Visible: false,
    tab3Visible: false,

    area: [{
      id: readerConfig.bandArea.AREA_KOREA,
      name: '韩国',
    }, {
      id: readerConfig.bandArea.AREA_US1,
      name: '美国1',
    }, {
      id: readerConfig.bandArea.AREA_US2,
      name: '美国2',
    }, {
      id: readerConfig.bandArea.AREA_EUROPE,
      name: '欧洲',
    }, {
      id: readerConfig.bandArea.AREA_JAPAN,
      name: '日本',
    }, {
      id: readerConfig.bandArea.AREA_CHINA1,
      name: '中国1',
    }, {
      id: readerConfig.bandArea.AREA_CHINA2,
      name: '中国2',
      checked: true,
    }],

    lights: [{
      id: '0',
      name: '左灯',
    }, {
      id: '1',
      name: '中灯',
    }, {
      id: '2',
      name: '右灯',
    }],

    readerName: 'FindID',

    sessions: [{
      id: 0,
      name: 'Session 0',
      checked: true,
    }, {
      id: 1,
      name: 'Session 1',
    }, {
      id: 2,
      name: 'Session 2',
    }, {
      id: 3,
      name: 'Session 3',
    }, ],

    targets: [{
      id: 0,
      name: 'Target A',
      checked: true,
    }, {
      id: 1,
      name: 'Target B',
    }, ],

    modalVisible: false,
    modalAction: [{
        name: '取消'
      },
      {
        name: '确认恢复',
        color: '#ed3f14',
        loading: false
      }
    ],

    accPwd: '00000000',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.reader = new bu01Reader.BU01Reader(options.connectedDeviceId, options.serviceId, options.characteristicId)
    this.error = new errorCode.ErrorCode()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.reader.monitor()
    wx.onBLEConnectionStateChange(res => {
      if (!res.connected) {
        this.error.getErrorMsg('蓝牙连接已断开', '10008')
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  showData(key, data) {
    this.setData({
      [key]: data
    })
  },

  //以下为控件事件
  handleTabChange({
    detail
  }) {
    this.showData('tab', detail.key)
    this.showData('tab1Visible', detail.key == 'tab1')
    this.showData('tab2Visible', detail.key == 'tab2')
    this.showData('tab3Visible', detail.key == 'tab3')
  },

  onSwitchChange(event) {
    this.setBuzzer(event.detail.value)
  },

  handleAreaChange({
    detail = {}
  }) {
    this.showData('results.bandArea', detail.value)
  },

  inputReaderName(e) {
    this.showData('readerName', e.detail.value)
  },

  handleLightChange({
    detail = {}
  }) {
    this.showData('results.lightIndicator', detail.value)
  },

  handlePowerChange(e) {
    this.showData('results.power', e.detail.value)
  },

  handleSessionChange({
    detail = {}
  }) {
    this.showData('results.session', detail.value)
  },

  handleTargetChange({
    detail = {}
  }) {
    this.showData('results.target', detail.value)
  },

  handleQChange(e) {
    this.showData('results.Q', e.detail.value)
  },

  handleModalOpen() {
    this.showData('modalVisible', true)
  },

  handleModalClick({
    detail
  }) {
    this.showData('modalVisible', false)
    const index = detail.index
    if (index === 1) {
      this.factoryReset()
    }
  },

  inputAccPwd(e) {
    this.showData('accPwd', e.detail.value)
  },

  getBattery(e) {
    begin()
    this.showData('results.battery', '')
    this.reader.getBattery()
      .then(res => {
        success()
        this.showData('results.battery', res + '%')
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  getBuzzer() {
    begin()
    this.reader.getBuzzer()
      .then(res => {
        success()
        this.showData('results.buzzer', res)
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  setBuzzer(value) {
    var action = value ? readerConfig.buzzer.BUZZER_OPEN : readerConfig.buzzer.BUZZER_CLOSE
    begin()
    this.reader.setBuzzer(action)
      .then(res => {
        success()
        this.showData('results.buzzer', value)
      })
      .catch(err => {
        failed(err)
        this.showData('results.buzzer', !value)
      })
      .then(() => end())
  },

  getReaderVersion() {
    this.showData('results.version', '')
    begin()
    this.reader.getReaderVersion()
      .then(res => {
        success()
        this.showData('results.version', res)
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  getBandArea() {
    begin()
    this.reader.getBandArea()
      .then(res => {
        success()
        this.data.area.forEach((element, index, arr) => {
          element.checked = false
          if (element.id == res) {
            element.checked = true
          }
        })
        this.showData('area', this.data.area)
        this.showData('results.bandArea', res)
      })
      .catch(err => {
        failed(err)
      }).then(() => end())
  },

  setBandArea() {
    var selectedId = this.data.results.bandArea
    if (selectedId === '') {
      failed(-101)
      return
    }
    begin()
    this.reader.setBandArea(selectedId)
      .then(res => {
        success()
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  setReaderName() {
    begin()
    this.reader.setReaderName(this.data.readerName)
      .then(res => {
        success()
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  setLightIndicator() {
    var lights = [readerConfig.light.LIGHT_CLOSE, readerConfig.light.LIGHT_CLOSE, readerConfig.light.LIGHT_CLOSE]
    var lightNames = ['0', '1', '2']
    this.data.results.lightIndicator.forEach((element, index, arr) => {
      lights[Number(element)] = readerConfig.light.LIGHT_OPEN
    })
    begin()
    this.reader.setLightIndicator(lights[0], lights[1], lights[2])
      .then(res => {
        success()
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  getLightIndicator() {
    begin()
    this.reader.getLightIndicator()
      .then(res => {
        success()
        var that = this
        res.forEach((element, index, arr) => {
          that.data.lights[index].checked = failed
          if (element == '01') {
            that.data.lights[index].checked = true
          }
        })
        this.showData('lights', this.data.lights)
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  getPower() {
    begin()
    this.reader.getPower()
      .then(res => {
        success()
        this.showData('results.power', res)
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  setPower() {
    begin()
    this.reader.setPower(this.data.results.power)
      .then(res => {
        success()
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  getSerialNumber() {
    begin()
    this.reader.getSerialNumber()
      .then(res => {
        success()
        this.showData('results.serialNumber', res)
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  getParameters() {
    begin()
    this.reader.getQueryParameters()
      .then(res => {
        success()
        this.data.sessions.forEach((element, index, arr) => {
          element.checked = false
          if (element.id == res.session) {
            element.checked = true
          }
        })
        this.showData('sessions', this.data.sessions)
        this.data.targets.forEach((element, index, arr) => {
          element.checked = false
          if (element.id == res.target) {
            element.checked = true
          }
        })
        this.showData('targets', this.data.targets)
        this.showData('sessions', this.data.sessions)
        this.showData('results.session', res.session)
        this.showData('results.target', res.target)
        this.showData('results.Q', res.Q)
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  setParameters() {
    var sessionId = this.data.results.session
    if (sessionId === '') {
      failed(-101)
      return
    }
    var targetId = this.data.results.target
    if (targetId === '') {
      failed(-101)
      return
    }
    begin()
    this.reader.setQueryParameters(parseInt(sessionId), parseInt(targetId), this.data.results.Q)
      .then(res => {
        success()
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  factoryReset() {
    beginReset()
    this.reader.setBuzzer(readerConfig.buzzer.BUZZER_OPEN)
      .then(res => {
        return this.reader.setBandArea(readerConfig.bandArea.AREA_CHINA2)
      })
      .then(res => {
        return this.reader.setLightIndicator(readerConfig.light.LIGHT_OPEN, readerConfig.light.LIGHT_OPEN, readerConfig.light.LIGHT_OPEN)
      })
      .then(res => {
        return this.reader.setPower(readerConfig.power.POWER_MAX)
      })
      .then(res => {
        success()
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },

  readEpcAndTid() {
    this.showData('results.epc', '')
    this.showData('results.tid', '')
    var regHex = new RegExp("^[0-9a-fA-F]*$")
    if (!regHex.test(this.data.accPwd)) {
      failed('密码格式不正确')
      return
    }
    var startAddr = '0'
    var length = '4'
    begin()
    this.reader.singleInventory()
      .then(res => {
        if (res.length == 0) {
          throw new Error('无标签')
        }
        this.showData('results.epc', res[0].epcWithSpace)
        return this.reader.readTag(this.data.accPwd, this.data.results.epc, readerConfig.bank.BANK_TID, startAddr, length)
      })
      .then(res => {
        success()
        this.showData('results.tid', res.replace(/(.{8})/g, '$1 '))
      })
      .catch(err => {
        failed(err)
      })
      .then(() => end())
  },
})

var begin = () => {
  wx.showToast({
    title: '发送命令...',
    icon: 'loading',
    duration: 2000,
    mask: true
  })
}

var end = () => {
  wx.hideToast()
}

var beginReset = () => {
  wx.showToast({
    title: '恢复出厂设置中...',
    icon: 'loading',
    duration: 5000,
    mask: true
  })
}

var success = () => {
  Toast.success('执行成功');
}

var failed = (errCode) => {
  Toast.fail('执行失败:' + errCode)

}