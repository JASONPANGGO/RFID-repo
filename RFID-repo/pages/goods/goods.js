// pages/goods/goods.js
import Notify from '../../lib/vant-weapp/dist/notify/notify';
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
    input: '',
    goods: [],
    user: {},
    selectorStatus: null,
    query: {},
    types: [],
    repo: [
      '啊啊啊',
      '起请求',
      '起请求',
      '起请求',
      '起请求',
      '起请求',
      '新学习'
    ],
    status: [],
    currentSelector: [],
    orders: [
      '时间从远到近',
      '时间从近到远',
      '库存从少到多',
      '库存从多到少'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.checkSession({
      success(e) {
        console.log(e)
      },
      fail(e) {
        console.log(e)
      }
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
    this.setData({
      user: user
    })
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }

    this.getInstance()
    this.getRepos()

  },
  getGoods() {
    request({
      url: app.service.goods.get,
      data: {
        instanceid: this.data.user.instanceid
      },
      method: 'get'
    })
  },
  getRepos() {
    request({
      url: app.service.repo.get,
      data: {
        instanceid: this.data.user.instanceid
      },
      method: 'get'
    }).then(res => {
      if (res.data instanceof Array) {
        this.setData({
          repo: res.data.map(e => e.name)
        })
      }
    })
  },
  getInstance() {
    request({
      url: app.service.instance.get,
      data: {
        instanceid: this.data.user.instanceid
      },
      method: 'get'
    }).then(res => {
      if (res.data.instanceData) {
        this.setData({
          types: res.data.instanceData.goods_type.split(',')
        })
      }
    })
  },
  onSelector(e) {
    const selector = e.currentTarget.dataset.selector
    this.setData({
      selectorStatus: selector == this.data.selectorStatus ? null : selector,
      currentSelector: selector !== 'order' && this.data[selector]
    })
  },
  onSelect(e) {
    console.log(e.currentTarget.dataset.query)
    const key = this.data.selectorStatus
    const value = e.currentTarget.dataset.query
    const query = this.data.query
    if (!query[key]) {
      query[key] = [value]
    } else if (query[key] instanceof Array && query[key].includes(value)) {
      query[key].splice(query[key].indexOf(value), 1)
    } else {
      query[key].push(value)
    }
    console.log(query)
    this.setData({
      query: query
    })
  },
  reset() {
    this.setData({
      query: {}
    })
  }

})