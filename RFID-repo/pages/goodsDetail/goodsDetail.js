// pages/goodsDetail/goodsDetail.js
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
    goods: {},
    tasks: [],
    history_title: ['进库/出库', '数量', '状态'],
    rfid_title: ['EPC（RFID唯一识别码）', '状态'],
    loaded: false,
    editable: false,
    showPreview: false,
    onPreviewItem: {},
    activeTab: 0,
    rfidList: [],
    addRfidList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('goodsData', (goods) => {
      console.log('eventChannel receive', goods)
      this.setData({
        goods: goods
      })
      this.initData(goods)
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
    if (user.character < 3) {
      this.setData({
        editable: true
      })
    }


  },
  initData(goods) {
    this.getTasks(goods.id, goods.repoid)
    this.getRfid(goods.id)
  },
  getTasks(goodsid, repoid) {
    request({
      url: app.service.task.get,
      data: {
        goodsid: goodsid,
        repoid: repoid
      },
      method: 'get'
    }).then(res => {
      console.log(res)
      let {
        goodsData,
        repoData,
        taskData,
        userData
      } = res.data
      taskData = taskData.map(t => {
        t.type_text = config.task[t.type].name
        t.status_text = config.status[t.status].text
        t.status_tag_type = config.status[t.status].tag_type
        t.time = t.update_time ? new Date(t.update_time).toLocaleString() : new Date(t.create_time).toLocaleString()
        t.repo = repoData[0]
        t.nextUser = userData.find(u => u.id === t.nextUserid)
        t.goods = this.data.goods
        return t
      }).sort((a, b) => b.time - a.time)

      this.setData({
        tasks: taskData,
        loaded: true
      })
    })
  },
  edit() {
    if (this.data.editable) {
      const goods = this.data.goods
      wx.navigateTo({
        url: '/pages/addGoods/addGoods',
        success(res) {
          res.eventChannel.emit('editGoods', goods)
        }
      })
    } else {
      Toast.fail('权限不足')
    }
  },
  delete() {
    if (this.data.editable) {
      Dialog.confirm({
        title: '警告',
        message: '删除商品会一同删除关于本商品的所有任务记录，是否确认删除？'
      }).then(() => {
        console.log('删除')
        request({
          url: app.service.goods.delete,
          data: {
            id: this.data.goods.id
          },
          method: 'post'
        }).then(res => {
          console.log(res)
          wx.navigateBack({
            delta: 1,
          })
        })
      })
    } else {
      Toast.fail('权限不足')
    }
  },
  preview(e) {
    this.setData({
      showPreview: true,
      onPreviewItem: e.currentTarget.dataset.item
    })
  },
  onClose() {
    this.setData({
      showPreview: false,
      onPreviewItem: {}
    })
  },
  onTabChange() {
    this.setData({
      activeTab: !this.data.activeTab * 1
    })
  },
  getRfid(goodsid) {
    request({
      url: app.service.rfid.get,
      data: {
        goodsid: goodsid
      },
      method: 'get'
    }).then(res => {
      console.log(res)
      if (res.data) {
        this.setData({
          rfidList: res.data.map(data => {
            data.status_text = config.rfid_status[data.status].text
            data.tag_type = config.rfid_status[data.status].tag_type
            return data
          }),
          rfidSum: res.data.filter(d => d.status === 0).length
        })
      }
    })
  },
  addRfid() {
    wx.navigateTo({
      url: '/pages/bu01-ble/ble?scene=add'
    })
  },
  // 添加rfid标签
  bleFinish(addRfidList) {
    console.log('添加RFID')
    request({
      url: app.service.rfid.add,
      data: {
        goodsid: this.data.goods.id,
        rfid: addRfidList.map(e => e.epcWithSpace),
        amount: this.data.goods.amount,
        rfidSum: this.data.rfidSum
      },
      method: 'post'
    }).then(res => {
      console.log(res)
      this.initData(goodsid)
    })
  }
})