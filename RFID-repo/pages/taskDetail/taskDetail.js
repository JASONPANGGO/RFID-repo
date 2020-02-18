// pages/taskDetail/taskDetail.js
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
    user: {},
    task: {},
    gradientColor: {
      '0%': '#3dbbff',
      '100%': '#1296db'
    },
    progress: 75,
    onAbort: false,
    confirmFinish: false
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
      showPreview: false
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
      request({
        url: app.service.task.update,
        data: {
          id: this.data.task.id,
          status: 2,
          nextUserid: this.data.user.id
        }
      }).then(res => {
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
  }
})