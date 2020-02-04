const app = getApp()
const config = require('../../config.js')
const {
  wxLogin,
  request
} = require('../../utils/promisefy.js')
// pages/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '../../image/my.png',
    name: null,
    character: null
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
    // 控制tabbar
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }

    // 从本地缓存取得已登录用户的数据
    const user = app.globalData.user
    if (user) {
      this.setData({
        name: user.name,
        avatarUrl: user.avatarUrl,
        character: config.character[user.character].name
      })
    }
  },
  onLogin(res) {
    
    const userInfo = res.detail.userInfo

    wxLogin().then(res => {
      return request({
        url: app.service.user.login,
        data: {
          code: res.code,
          userInfo: userInfo
        },
        method: 'GET'
      })
    }).then(res => {
      const user = res.data
      console.log(user)
      wx.setStorageSync('user', user)
      wx.setStorageSync('cookie', res.cookies[0])
      this.setData({
        character: config.character[user.character].name,
        name: user.name,
        avatarUrl: user.avatarUrl
      })
    })


  },
  navigate(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.to,
    })
  }
})