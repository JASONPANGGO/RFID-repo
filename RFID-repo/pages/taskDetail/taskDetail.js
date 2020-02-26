// pages/taskDetail/taskDetail.js

const bleUtil = require('../../utils/bu01BleUtil.js')
const bu01Reader = require('../../utils/bu01Reader.js')
const errorCode = require('../../utils/errorCode.js')

var epcItem = function(no, epc, epcWithSpace, rssi) {
  this.no = no
  this.epc = epc
  this.epcWithSpace = epcWithSpace
  this.count = 1
  this.rssi = rssi
}


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

import Toast from '../../lib/vant-weapp/dist/toast/toast';
import Dialog from '../../lib/vant-weapp/dist/dialog/dialog';

const {
  request
} = require('../../utils/promisefy.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    task: {},
    gradientColor: {
      '0%': '#3dbbff',
      '100%': '#1296db'
    },
    progress: 75,
    onAbort: false,
    confirmFinish: false,

    // 蓝牙连接
    available: false,
    discovering: false,

    devices: [],
    selectedId: '',
    ids: [], //发现的设备id
    isFirst: true, //第一次打开ble页面

    nonAndroid: true,
    devices: [],
    infoText: ['1. 确保设备开关已打开。', ' 2. 确保设备与手机的距离在10米以内。', ' 3. 确保设备有充足的电量。', ' 4. 请勿在设备充电的时候使用。'],
    searchingBle: false,

    // 清点 
    btnInventorying: false,
    inventorying: false,
    reader: false,
    epcItems: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('taskDetail', task => {
      this.setData({
        task: task
      })
    })
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
    const user = wx.getStorageSync('user')
    user.character = config.character[user.character]
    this.setData({
      user: user
    })
  },
  abort() {
    this.setData({
      onAbort: true
    })
  },
  confirmAbort() {
    request({
      url: app.service.task.update,
      data: {
        id: this.data.task.id,
        status: 3,
        abort_comment: this.data.task.abort_comment
      }
    }).then(res => {
      console.log(res)
      Toast.success('已终止')
      wx.navigateBack({
        delta: 1,
      })
    })
  },
  onClose() {
    this.setData({
      onAbort: false,
      showPreview: false,
      searchingBle: false
    })
  },
  onInput(e) {
    const task = this.data.task
    task.abort_comment = e.detail
    this.setData({
      task: task
    })
  },
  finish() {
    if (this.data.task.progress === this.data.task.amount) {

      if (this.data.task.type === 0) { // 出货
        request({
          url: app.service.rfid.update,
          data: {
            rfid: this.data.epcItems,
            status: 1
          },
          method: 'post'
        }).then(res => {
          console.log(res)
          Toast.success('RFID更新成功')
        })
      } else if (this.data.task.type === 1) { // 入货
        request({
          url: app.service.rfid.add,
          data: {
            rfid: this.data.epcItems,
            goodsid: this.data.task.goodsid
          },
          method: 'post'
        }).then(res => {
          console.log(res)
          Toast.success("RFID更新成功")
        })
      }
      request({
        url: app.service.task.update,
        data: {
          id: this.data.task.id,
          status: 2,
          nextUserid: this.data.user.id,
          progress: this.data.task.progress
        },
        method: 'post'
      }).then(res => {

        console.log(res)
        Toast.success('本次任务已完成')
      })
    } else {
      Toast.fail('请先完成本次任务')
    }
  },
  goToGoodsDetail() {
    const goods = this.data.task.goods
    goods.repo = this.data.task.repo
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail',
      success(res) {
        res.eventChannel.emit('goodsData', goods)
      }
    })
  },
  preview() {
    this.setData({
      showPreview: true,
      onPreviewItem: this.data.task
    })
  },
  start() {
    this.setData({
      searchingBle: true
    })
    this.bleOnLoad()
    // wx.redirectTo({
    //   url: '/pages/bu01-ble/ble?scene=task'
    // })
  },
  initReader(options) {
    this.reader = new bu01Reader.BU01Reader(options.connectedDeviceId, options.serviceId, options.characteristicId)
    console.log(this.reader)
    this.error = new errorCode.ErrorCode()
    this.setData({
      reader: true
    })
  },
  // 单次清点 
  singleInventory(e) {
    console.log('单次清点开始！')
    const that = this
    if (this.data.inventorying || this.data.btnInventorying) {
      Toast.fail("正在清点中")
      return
    }
    begin()
    this.reader.singleInventory()
      .then(res => {
        if (res.length == 0) {
          console.log('没有标签')
          warningNoTag()
        } else {
          console.log('扫到了标签', res)
          that.handleEPC(res)
        }
      })
      .catch(err => {
        console.log('扫描catch了')
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
    const that = this
    if (this.data.btnInventorying) {
      this.showData('inventorying', false)
      return
    } else {
      this.showData('btnInventorying', true)
    }
    this.showData('inventorying', !this.data.inventorying)
    var timer = setTimeout(function task() {
      if (!that.data.inventorying) {
        return
      }
      that.reader.singleInventory()
        .then(res => {
          that.handleEPC(res)
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
  handleEPC(res) {
    console.log('检查标签')
    res.forEach((elem, i) => {
      if (this.data.epcItems.find(rfid => rfid === elem.epcWithSpace)) {
        Toast.fail('已扫描该标签')
      } else {
        this.checkRFIDbyEPC(elem.epcWithSpace).then(() => {
          console.log('检查通过')
          const task = this.data.task
          task.progress += 1
          this.setData({
            epcItems: [...this.data.epcItems, elem.epcWithSpace],
            task: task
          })
        }).catch(() => {
          Toast.fail('仓库中已有该标签或该商品不是本任务所需的商品')
        })
      }
    })
  },
  checkRFIDbyEPC(EPC) {
    return new Promise((resolve, reject) => {
      request({
        url: app.service.rfid.get,
        data: {
          rfid: EPC
        },
        method: 'get'
      }).then(rfidRes => {
        console.log(rfidRes)
        if (rfidRes.data.length === 0 && this.data.task.type === 1) { // 入货：确保仓库中无该标签
          resolve()
        } else if (rfidRes.data.length === 1 && rfidRes.data[0].goodsid === this.data.task.goodsid && this.data.task.type === 0) { // 出货：确保仓库里有这个标签，并且是当前的商品
          resolve()
        } else {
          reject()
        }
      })
    })
  },
  showData(key, data) {
    this.setData({
      [key]: data
    })
  },

  bleOnLoad() {
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
    }

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
        wx.hideToast()
        this.initReader(bleParams)
        this.setData({
          searchingBle: false,
          reader: true
        })

        this.reader.monitor(this.onBtnPress, this.onBtnRelease)
        wx.onBLEConnectionStateChange(res => {
          if (!res.connected) {
            this.error.getErrorMsg('蓝牙连接已断开', '10008')
          }
        })

      })
      .catch(res => {
        wx.hideToast()
        if (this.data.ids.indexOf(this.data.selectedId) != -1) {
          this.ble.disconnect(this.data.selectedId)
        }
        this.error.getErrorMsg('蓝牙连接超时', res)
      })
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