// pages/middlePage/middle.js

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
    funcs: [{
      name: '货物检测',
      entry: [{
          name: '扫一扫',
          logo: '../../image/scan.png',
          page: 'scan'
        },
        {
          name: 'RFID',
          logo: '../../image/RFID-logo.png',
          page: '/pages/bu01-ble/ble',
          scene: 'check'
        }
      ]
    }],
    more: '更多功能敬请期待...'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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

  },
  handleFunc(e) {
    console.log(e)
    const that = this
    const entry = e.currentTarget.dataset.entry;
    if (entry.page === 'scan') {
      wx.scanCode({
        success(e) {
          console.log('扫描到：', e)
          that.findGoodsByBarCode(e.result)
        },
        fail(e) {
          console.log(e)
        }
      })
    } else {
      wx.navigateTo({
        url: entry.page + '?scene=' + entry.scene
      })
    }
  },
  findGoodsByBarCode(code) {
    Toast.loading({
      mask: false,
      message: '加载中...'
    })
    request({
      url: app.service.goods.get,
      data: {
        bar_code: code
      },
      method: 'get'
    }).then(res => {
      if (res.data.length === 0) {
        Toast.fail('未在仓库中找到此商品')
      } else {
        const goods = res.data[0]
        wx.navigateTo({
          url: '/pages/goodsDetail/goodsDetail',
          success: function(res) {
            res.eventChannel.emit('goodsData', goods)
          }
        })
      }
    })
  },

})