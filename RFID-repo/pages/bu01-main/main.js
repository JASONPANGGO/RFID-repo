// 清点功能

const bu01Reader = require('../../utils/bu01Reader.js')
const errorCode = require('../../utils/errorCode.js')
import Toast from '../../lib/vant-weapp/dist/toast/toast';
import Dialog from '../../lib/vant-weapp/dist/dialog/dialog';
const app = getApp()
const {
  request
} = require('../../utils/promisefy.js')
const config = require('../../config.js')

var epcItem = function(no, epc, epcWithSpace, rssi) {
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
    scene: ''
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

  returnToSearch: function() {
    wx.redirectTo({
      url: '../bu01-ble/ble',
    })
  },

  /**+
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('页面参数')
    console.log('deviceId', options.connectedDeviceId)
    console.log('serviceId', options.serviceId)
    console.log('characteristicId', options.characteristicId)
    this.showData('options', options)

    this.reader = new bu01Reader.BU01Reader(options.connectedDeviceId, options.serviceId, options.characteristicId)
    this.error = new errorCode.ErrorCode()

    var that = this
    wx.getSystemInfo({
      success: function(res) {
        var height = res.windowHeight * (750 / res.windowWidth) - 280 + 'rpx'
        that.showData('middleHeight', height)
      },
    })

    this.showData('scene', options.scene)
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
  onHide: function() {
    this.showData('inventorying', false)
    this.showData('btnInventorying', false)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
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

  // 单次清点 
  singleInventory(e) {
    if (this.data.inventorying || this.data.btnInventorying) {
      warning()
      return
    }
    begin() // Toast
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

  // 连续清点
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
  getRFIDbyEPC(rfid) {
    console.log(rfid)
    return new Promise((resolve, reject) => {
      request({
        url: app.service.rfid.get,
        data: {
          rfid: rfid
        },
        method: 'get'
      }).then(res => {
        if (res.data.length === 0) {
          resolve(rfid)
        } else {
          if (this.data.scene === 'check') {
            console.log('res.data[0]', res.data[0])
            request({
              url: app.service.goods.get,
              data: {
                id: res.data[0].goodsid
              },
              method: 'get'
            }).then(goodsRes => {
              console.log(goodsRes)
              wx.navigateTo({
                url: '/pages/goodsDetail/goodsDetail',
                success(resolve) {
                  resolve.eventChannel.emit('goodsData', goodsRes.data[0])
                }
              })
            })
          }
          reject()
        }
      })
    })
  },
  addEpc(res) {
    Array.prototype.forEach.call(res, (elem, i) => {
      var index = this.data.epcs.indexOf(elem.epc)
      // 已扫描中不存在该标签
      if (index == -1) {
        // 检测仓库中有无该标签
        this.getRFIDbyEPC(elem.epcWithSpace).then(() => {

          this.handleEPCbyScene(elem)

        }).catch(() => {
          Toast.fail('仓库中已存在该标签')
        })
      } else {
        // 已扫描中已存在该表情
        // this.data.epcItems[index].rssi = elem.rssi
        // this.data.epcItems[index].count += 1
        Toast.fail('已扫描过该标签')
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

  // 业务代码
  navBack() {
    const pages = getCurrentPages()
    const previousPage = pages[pages.length - 3] // 上上个页面

    if (this.data.epcItems.length > 0) {
      Dialog({
        title: "添加RFID标签",
        message: "是否确认添加以上" + this.data.epcItems.length + "个标签？"
      }).then(() => {
        previousPage.setData({
          addRfidList: this.data.epcItems
        })
        previousPage.bleFinish(this.data.epcItems)
      })
    }
    wx.navigateBack({
      delta: 2
    })
  },
  handleEPCbyScene(elem) {
    switch (this.data.scene) {
      case 'add':
        this.data.epcs.push(elem.epc)
        this.data.epcItems.push(new epcItem(this.data.epcItems.length + 1, elem.epc, elem.epcWithSpace, elem.rssi))
        break;
      case 'check':
        Toast.fail('仓库中不存在该标签。')
        break;
      default:
        break;
    }


  }
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
  Toast.success({
    message: '执行成功'
  });
}

var failed = (errCode) => {
  Toast.fail({
    message: '清点失败:' + errCode,
  });
}

var warning = () => {
  Toast.fail({
    message: '请先结束清点'
  });
}

var warningNoTag = () => {
  Toast.fail({
    message: '无标签'
  });
}