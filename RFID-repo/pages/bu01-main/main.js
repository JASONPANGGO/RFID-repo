// 清点功能

const bu01Reader = require('../../utils/bu01Reader.js')
const errorCode = require('../../utils/errorCode.js')
import Toast from '../../lib/vant-weapp/dist/toast/toast';

var epcItem = function (no, epc, epcWithSpace, rssi) {
  this.no = no
  this.epc = epc
  this.epcWithSpace = epcWithSpace
  this.count = 1
  this.rssi = rssi
}

Page({
  data: {
    middleHeight: 0,
    options: '',
    inventorying: false,
    btnInventorying: false,

    epcItems: [],
    epcs: [],  
    total: 0,
     /**
      epcItems数组的成员
      {
        no: 1,
        epc: '1234123456785678ABCDABCD',
        epcWithSpace: '12341234 56785678 ABCDABCD',
        count: 1,
        rssi: -62.1,
      }
    */
    /**
      epcs数组的成员
      {
        epc:'1234123456785678ABCDABCD',
      }
    */
  },

   returnToSearch: function () {
    wx.redirectTo({
      url: '../bu01-ble/ble',
    })
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    console.log('页面参数')
    console.log('deviceId', options.connectedDeviceId)
    console.log('serviceId', options.serviceId)
    console.log('characteristicId', options.characteristicId)
    this.showData('options', options)

    this.reader = new bu01Reader.BU01Reader(options.connectedDeviceId, options.serviceId, options.characteristicId)
    this.error = new errorCode.ErrorCode()
    
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        var height = res.windowHeight * (750 / res.windowWidth) - 400 + 'rpx'
        that.showData('middleHeight', height)
      },
    })
  },

  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () {

  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.reader.monitor(this.onBtnPress, this.onBtnRelease)
    wx.onBLEConnectionStateChange(res => {
      if (!res.connected) {
        this.error.getErrorMsg('蓝牙连接已断开', '10008')
      }
    })
  },

  /**
  * 生命周期函数--监听页面隐藏
  */
  onHide: function () {
    this.showData('inventorying', false)
    this.showData('btnInventorying', false)
  },

  /**
  * 生命周期函数--监听页面卸载
  */
  onUnload: function () {
    this.showData('inventorying', false)
    this.showData('btnInventorying', false)
    wx.onBLEConnectionStateChange(res => {})
  },

  showData(key, data) {
    this.setData({
      [key]: data
    })
  },

  navToSetting(e) {
    if (this.data.inventorying || this.data.btnInventorying) {
      warning()
      return
    }
    wx.navigateTo({
      url: '../bu01-setting/setting?connectedDeviceId=' + this.data.options.connectedDeviceId + '&serviceId=' + this.data.options.serviceId + '&characteristicId=' + this.data.options.characteristicId,
    })
  },

  navToDemo(e) {
    if (this.data.inventorying || this.data.btnInventorying) {
      warning()
      return
    }
    wx.navigateTo({
      url: '../bu01-demo/demo?connectedDeviceId=' + this.data.options.connectedDeviceId + '&serviceId=' + this.data.options.serviceId + '&characteristicId=' + this.data.options.characteristicId,
    })
  },

  navToOperation(e) {
    if (this.data.inventorying || this.data.btnInventorying) {
      warning()
      return
    }
    wx.navigateTo({
      url: '../bu01-operation/operation?connectedDeviceId=' + this.data.options.connectedDeviceId + '&serviceId=' + this.data.options.serviceId + '&characteristicId=' + this.data.options.characteristicId + '&epc=' + e.currentTarget.id,
    })
  },

  clearList(e) {
    this.showData('epcItems', [])
    this.showData('epcs', [])
    this.showData('total', 0)
  },

  singleInventory(e) {
    if (this.data.inventorying || this.data.btnInventorying) {
      warning()
      return
    }
    begin()
    this.reader.singleInventory()
      .then(res => {
        if (res.length == 0) {
          warningNoTag()
        } else {
          this.addEpc(res)
        }
      })
      .catch(err => {
        failed(err)
        //清点标签或操作标签可能会回复-205
        if (err == '-205') {
          this.error.getErrorMsg('设备电量不足', '-205')
        }
      })
      .then(() => end())
  },

  inventory(e) {
    if (this.data.btnInventorying) {
      this.showData('inventorying', false)
      return
    }
    this.showData('inventorying', !this.data.inventorying)
    var that = this
    var timer = setTimeout(function task() {
      if (!that.data.inventorying) {
        return
      }
      that.reader.singleInventory()
        .then(res => {
          that.addEpc(res)
        })
        .catch(err => {
          console.log('error', err)
          //清点标签或操作标签可能会回复-205
          if (err == '-205') {
            that.error.getErrorMsg('设备电量不足', '-205')
            that.showData('inventorying', false)
          } else {
            failed(err)
            that.showData('inventorying', false)
            that.showData('btnInventorying', false)
          }
        })
        .then(() => {
          timer = setTimeout(task, 300)
          })
    }, 0)
  },

  addEpc(res) {
    Array.prototype.forEach.call(res, (elem, i) => {
      var index = this.data.epcs.indexOf(elem.epc)
      if (index == - 1) {
        this.data.epcs.push(elem.epc)
        this.data.epcItems.push(new epcItem(this.data.epcItems.length + 1, elem.epc, elem.epcWithSpace, elem.rssi))
      } else {
        this.data.epcItems[index].rssi = elem.rssi
        this.data.epcItems[index].count += 1
      }
    })
    this.showData('epcItems', this.data.epcItems)
    this.showData('total', this.data.epcItems.length)
  },

  onBtnPress() {
    if (this.data.inventorying) {
      this.showData('inventorying', false)
    }
    this.showData('btnInventorying', true)
    var that = this
    var timer = setTimeout(function task() {
      if (!that.data.btnInventorying) {
        return
      }
      that.reader.singleInventory()
        .then(res => {
          that.addEpc(res)
        })
        .catch(err => {
          console.log('error', err)
          //清点标签或操作标签可能会回复-205
          if (err == '-205') {
            that.error.getErrorMsg('设备电量不足', '-205')
            that.showData('btnInventorying', false)
          } else {
            failed(err)
            that.showData('btnInventorying', false)
            that.showData('inventorying', false)
          }
        })
        .then(() => {
          timer = setTimeout(task, 300)
        })
    }, 0)
  },

  onBtnRelease() {
    this.showData('btnInventorying', false)
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

var success = () => {
  Toast({
    content: '执行成功',
    type: 'success',
    duration: 1
  });
}

var failed = (errCode) => {
  Toast({
    content: '清点失败:' + errCode,
    type: 'error',
    duration: 2
  });
}

var warning = () => {
  Toast({
    content: '请先结束清点',
    type: 'warning',
    duration: 1
  });
}

var warningNoTag = () => {
  Toast({
    content: '无标签',
    type: 'warning',
    duration: 1
  });
}