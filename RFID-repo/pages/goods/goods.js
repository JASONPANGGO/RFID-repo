// pages/goods/goods.js
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
    input: '',
    goods: [],
    user: {},
    selectorStatus: null,
    query: {},
    type: [],
    repoid: [],
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
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    const user = wx.getStorageSync('user')
    if (!user.id) {
      Dialog.confirm({
        title: '未登录',
        message: '使用本程序需要登录，请先登录/注册'
      }).then(() => {
        wx.switchTab({
          url: '/pages/my/my'
        })
      })
    } else if (!user.instanceid) {
      Dialog.confirm({
        title: '无仓库',
        message: '先创建或者加入一个仓库'
      }).then(() => {
        wx.switchTab({
          url: '/pages/my/my'
        })
      })
    } else {

      this.setData({
        user: user,
        query: {
          instanceid: user.instanceid
        }
      })
      this.initData()

    }

  },
  initData() {
    wx.showNavigationBarLoading()
    Toast.loading({
      mask: false,
      message: '加载中...'
    })
    Promise.all([this.getRepos(), this.getInstance(), this.getGoods()]).then(e => {
      wx.hideNavigationBarLoading()
      Toast.clear()
    })
  },
  getGoods() {
    return new Promise((resolve, rej) => {

      request({
        url: app.service.goods.get,
        data: this.data.query,
        method: 'get'
      }).then(res => {
        if (res.data instanceof Array) {
          if (res.data.length === 0) {
            Toast.fail('无数据，请尝试更换筛选条件。')
          } else {
            this.setData({
              goods: res.data.map(g => {
                g.create_time = new Date(g.create_time).toLocaleDateString()
                g.repo = this.data.repoid.find(e => e.id === g.repoid)
                return g
              })
            })
          }

        } else {
          Toast.fail('查询失败')
        }
        resolve()

      })

    })
  },
  getRepos() {
    return new Promise((resolve, rej) => {
      request({
        url: app.service.repo.get,
        data: {
          instanceid: this.data.user.instanceid
        },
        method: 'get'
      }).then(res => {
        if (res.data instanceof Array) {
          this.setData({
            repoid: res.data
          })
        }
        resolve()
      })
    })
  },
  getInstance() {
    return new Promise((resolve, rej) => {

      request({
        url: app.service.instance.get,
        data: {
          instanceid: this.data.user.instanceid
        },
        method: 'get'
      }).then(res => {
        if (res.data.instanceData) {
          this.setData({
            type: res.data.instanceData.goods_type.split(',')
          })
        }
        resolve()
      })
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

    this.setData({
      query: query
    })
  },
  reset() {
    this.setData({
      query: {
        instanceid: this.data.user.instanceid
      }
    })
  },
  onPullDownRefresh() {
    this.initData()
  },
  onSelectOrder(e) {
    const value = e.currentTarget.dataset.query
    this.setData({
      query: Object.assign(this.data.query, {
        order: value
      })
    })
    this.getGoods()
  },
  onInput(e) {
    this.setData({
      query: Object.assign(this.data.query, {
        name: e.detail
      })
    })
  }
})