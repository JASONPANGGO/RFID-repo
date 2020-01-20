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
    avatar: '../../image/my.png',
    nickName: null,
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
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }
    const userInfo = app.globalData.userInfo
    const user = app.globalData.user
    if (userInfo) {
      this.setData({
        avatar: userInfo.avatarUrl,
        nickName: userInfo.nickName
      })
    }
    if (user.character != undefined) {
      this.setData({
        character: config.character[user.character].name
      })
    }
  },
  onLogin(res) {
    const userInfo = res.detail.userInfo

    wxLogin().then(res => {
      return request({
        url: app.service.login,
        data: {
          code: res.code,
          userInfo: userInfo
        },
        method: 'GET'
      })
    }).then(res => {
      const user = res.data
      wx.setStorageSync('user', user)
      this.setData({
        character: config.character[user.character].name
      })
    })

    if (userInfo) {
      app.globalData.userInfo = userInfo
      this.setData({
        avatar: userInfo.avatarUrl,
        nickName: userInfo.nickName
      })
    }
  }
})