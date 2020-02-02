// pages/addGoods/addGoods.js
import Notify from '../../lib/vant-weapp/dist/notify/notify';
const {
  request,
  wxGetStorage
} = require('../../utils/promisefy.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [],
    repo_list: [1, 2, 3, 4],
    name: '',
    create_time: '',
    price: '',
    amount: '',
    bar_code: '',
    show_select: false,
    repo: '',
    user: {}
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
    this.setData({
      create_time: new Date().toLocaleString(),
      user: wx.getStorageSync('user')
    })
    this.getRepos()
  },
  onInput(e) {
    console.log(e)
  },
  scan() {
    wx.scanCode({
      success(e) {
        console.log(e)
      },
      fail() {
        console.log(e)
      }
    })
  },
  onSubmit() {
    request({
      url: app.service.goods.add,
      header: {
        'cookie': wx.getStorageSync('cookie')
      },
      data: {
          
        name: this.data.name,
        price: this.data.price,
        bar_code: this.data.bar_code,
        amount: this.data.amount
      },
      method: 'post'
    }).then(res => {
      console.log(res)
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
      console.log(res)
      if (res.data instanceof Array) {
        this.setData({
          repo_list: res.data.map(e => {
            e.text = e.name
            // e.value = e.id
            return e
          })
        })
      }
    })
  },
  onSelectRepo() {
    this.setData({
      show_select: true
    })
  },
  onSelect(e) {
    const {
      picker,
      value,
      index
    } = e.detail;
    console.log(e.detail)
    this.setData({
      repo: value,
      show_select: false
    })
  },
  onClose() {
    this.setData({
      show_select: false
    })
  }
})