// pages/bu01-ble/ble.js
// 蓝牙搜索和连接

const bleUtil = require('../../utils/bu01BleUtil.js')
const errorCode = require('../../utils/errorCode.js')

var bleParams = {
  connectedDeviceId: '',
  serviceId: '',
  characteristicId: '',
}
const app = getApp({
  globalData: {
    platform: '',
  }
})

Page({
  data: {
    available: false,
    discovering: false,

    devices: [],
    selectedId: '',
    ids: [], //发现的设备id
    isFirst: true, //第一次打开ble页面

    nonAndroid: true,

    redirect: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        app.globalData.platform = res.platform
        if (getApp().globalData.platform == 'android') {
          that.showData('nonAndroid', false)
        }
        if (res.SDKVersion < '1.6.0') {
          wx.showModal({
            title: '当前微信版本过低',
            content: '为了能够正常的使用本程序，请更新微信客户端',
            showCancel: false,
            confirmText: '我知道了',
          })
        }
      },
      fail: function(res) {
        console.log(res)
      }
    })
    if (!wx.openBluetoothAdapter) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本不支持蓝牙功能，请升级到最新微信版本后重试',
        showCancel: false,
        confirmText: "确定"
      })
    } else {
      this.error = new errorCode.ErrorCode()
      //初始化蓝牙适配器
      this.ble = new bleUtil.BU01BleUtil(bleParams)
      this.setData({
        redirect: options.redirect
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

    // 初始化蓝牙
    this.ble.iniBle() // openBluetoothAdapter
      .then(() => {
        this.stateChange() // onBluetoothAdapterStateChange
        this.showData('available', true)
        return this.ble.start()
      })
      .then(() => {
        this.showData('discovering', true) // this.setData
        this.findDevices()
      })
      .catch(res => {
        console.log('初始化蓝牙失败', res)
        if (getApp().globalData.platform == 'ios') {
          this.error.getErrorMsg('初始化蓝牙失败', res)
        } else {
          this.error.getErrorMsg('初始化蓝牙失败', 10001)
        }
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.selectedId) {
      this.ble.disconnect(this.data.selectedId)
    }
    if (!this.data.isFirst) {
      this.showData('selectedId', '')
      if (this.data.available && !this.data.discovering) {
        //释放资源，并重启
        //关闭
        this.ble.closeBle()
          .then(() => {
            this.showData('available', false)
            //初始化
            return this.ble.iniBle()
          })
          .then(() => {
            this.stateChange()
            this.showData('available', true)
          })
          .catch(res => {
            console.log('重启蓝牙出错', res)
            if (getApp().globalData.platform == 'ios') {
              this.error.getErrorMsg('重启蓝牙出错', res)
            } else {
              this.error.getErrorMsg('重启蓝牙出错', 10001)
            }
          })
          .then(() => {
            this.showData('ids', [])
            this.showData('devices', [])
            if (this.data.available) {
              //搜索
              var that = this
              setTimeout(() => {
                that.ble.start()
                  .then(() => {
                    that.showData('discovering', true)
                    that.findDevices()
                  })
                  .catch((res) => {
                    that.error.getErrorMsg('搜索蓝牙出错', res)
                  })
              }, 500)
            }
          })
      }
    } else {
      this.showData('isFirst', false)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    //停止搜索
    if (this.data.available && this.data.discovering) {
      this.stopSearchBle()
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    //停止搜索
    if (this.data.available) {
      if (this.data.discovering) {
        this.stopSearchBle()
      }
      //关闭蓝牙适配器
      this.ble.closeBle()
        .then(() => {
          this.showData('available', false)
        })
        .catch((res) => {
          this.error.getErrorMsg('关闭蓝牙出错', res)
        })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.showData('selectedId', '')
    if (this.data.available) {
      wx.showToast({
        title: '搜索中...',
        icon: 'loading',
        duration: 1000,
        mask: true
      })
      if (this.data.discovering) {
        this.stopSearchBle()
      }
    } else {
      wx.showToast({
        title: '重启蓝牙中...',
        icon: 'loading',
        duration: 1000,
        mask: true
      })
    }
    //释放资源，以免以往搜过的不出现
    this.showData('ids', [])
    this.showData('devices', [])
    var that = this
    setTimeout(() => {
      that.ble.closeBle()
        .then(() => {
          return that.ble.iniBle()
        })
        .then(() => {
          that.stateChange()
          that.showData('available', true)
          return that.ble.start()
        })
        .then(() => {
          that.showData('discovering', true)
          that.findDevices()
        })
        .catch(err => {
          console.log('重新搜索出错', err)
          if (getApp().globalData.platform == 'ios') {
            that.error.getErrorMsg('重新搜索出错', err)
          } else {
            that.error.getErrorMsg('重新搜索出错', 10001)
          }
          that.showData('discovering', false)
        })
    }, 500)
    wx.stopPullDownRefresh()
  },

  showData(key, data) {
    this.setData({
      [key]: data
    })
  },

  /**
   * ble相关事件
   */
  findDevices() {
    //也可以直接调用微信接口
    // wx.onBluetoothDeviceFound(res => {
    this.ble.onBluetoothDeviceFound(res => {
      console.log('发现新设备', JSON.stringify(res))
      //不同平台的设备使用该回调会有不同的参数，需要逐个处理
      if (res.deviceId) {
        if (this.data.ids.indexOf(res.deviceId) == -1) {
          this.data.ids.push(res.deviceId)
          this.data.devices.push(res)
          // console.log('新设备名称：', res.localName)
          // console.log('新设备ID:', res.deviceId)
          // console.log('新设备RSSI:', res.RSSI)
        } else {
          this.data.devices[this.data.ids.indexOf(res.deviceId)]['localName'] = res.localName
          this.data.devices[this.data.ids.indexOf(res.deviceId)]['RSSI'] = res.RSSI
        }
      } else if (res.devices) {
        if (this.data.ids.indexOf(res.devices[0]['deviceId']) == -1) {
          this.data.ids.push(res.devices[0]['deviceId'])
          this.data.devices.push(res.devices[0])
          // console.log('新设备名称：', res.devices[0]['localName'])
          // console.log('新设备ID:', res.devices[0]['deviceId'])
          // console.log('新设备RSSI:', res.devices[0]['RSSI'])
        } else {
          this.data.devices[this.data.ids.indexOf(res.devices[0]['deviceId'])]['localName'] = res.devices[0]['localName']
          this.data.devices[this.data.ids.indexOf(res.devices[0]['deviceId'])]['RSSI'] = res.devices[0]['RSSI']
        }
      } else {
        if (this.data.ids.indexOf(res.devices[0][0]['deviceId']) == -1) {
          this.data.ids.push(res.devices[0][0]['deviceId'])
          this.data.devices.push(res.devices[0][0])
          // console.log('新设备名称：', res.devices[0][0]['localName'])
          // console.log('新设备ID:', res.devices[0][0]['deviceId'])
          // console.log('新设备RSSI:', res.devices[0][0]['RSSI'])
        } else {
          this.data.devices[this.data.ids.indexOf(res.devices[0][0]['deviceId'])]['localName'] = res.devices[0][0]['localName']
          this.data.devices[this.data.ids.indexOf(res.devices[0][0]['deviceId'])]['RSSI'] = res.devices[0][0]['RSSI']
        }
      }
      Array.prototype.forEach.call(this.data.devices, (elem, i) => {
        //127为微信蓝牙Bug
        if (elem.RSSI == 127) {
          elem.RSSI = -100
        }
      })
      this.data.devices.sort((o1, o2) => {
        return o2.RSSI - o1.RSSI
      })
      this.showData('devices', this.data.devices)
      var ids = []
      Array.prototype.forEach.call(this.data.devices, (elem, i) => {
        ids[i] = elem.deviceId
      })
      this.showData('ids', ids)
    })
  },

  stateChange() {
    // wx.onBluetoothAdapterStateChange(res => {
    this.ble.onBluetoothAdapterStateChange(res => {
      console.log('蓝牙适配器状态改变', JSON.stringify(res))
      this.showData('available', res.available ? true : false)
      this.showData('discovering', res.discovering ? true : false)
    })
  },

  stopSearchBle() {
    this.ble.stop()
      .then(() => {
        this.showData('discovering', false)
      })
      .catch((res) => {
        this.error.getErrorMsg('停止搜索蓝牙出错', res)
      })
  },

  /**
   * wxml事件
   * 连接蓝牙
   */
  connect(e) {
    this.showData('selectedId', e.currentTarget.id)
    wx.showToast({
      title: '连接中...',
      icon: 'loading',
      duration: 30000,
      mask: true
    })
    this.ble.connect(e.currentTarget.id)
      .then(() => {
        //打开主页面
        wx.hideToast()
        this.openMainPage(bleParams)
      })
      .catch(res => {
        wx.hideToast()
        if (this.data.ids.indexOf(this.data.selectedId) != -1) {
          this.ble.disconnect(this.data.selectedId)
        }
        this.error.getErrorMsg('蓝牙连接超时', res)
      })
  },

  /**
   * 跳转至读写器页面
   */
  openMainPage(params) {
    wx.navigateTo({
      url: '../bu01-main/main?connectedDeviceId=' + params.connectedDeviceId + '&serviceId=' + params.serviceId + '&characteristicId=' + params.characteristicId,
    })
  },
})