const app = getApp()
const config = require('../../config.js')
const {
  wxLogin,
  request
} = require('../../utils/promisefy.js')
import Toast from '../../lib/vant-weapp/dist/toast/toast';
import Dialog from '../../lib/vant-weapp/dist/dialog/dialog';
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
    console.log('user wx.storage：', wx.getStorageSync('user'))
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
    const user = wx.getStorageSync('user')
    if (user.id) {
      this.initData(user.name, user.avatarUrl, user.character)
    }

    // 登录过期
    if (app.globalData.expire) {
      Dialog.confirm({
        title: '登录过期',
        message: '请重新登录'
      })
    }
  },
  onLogin(loginRes) {
    console.log(loginRes)
    wx.login({
      success(wxRes) {
        request({
          url: app.service.user.login,
          data: {
            code: wxRes.code,
            userInfo: loginRes.detail.userInfo
          },
          method: 'post'
        }).then(res => {
          const user = res.data
          console.log(user)
          if (user.id) {
            wx.setStorageSync('user', user)
            wx.setStorageSync('cookie', res.cookies[0])
            this.initData(user.name, user.avatarUrl, user.character)
          } else {
            Toast.fail(res.data)
            console.log(res)
          }
        }).catch(e => {
          console.log(res)
          Toast.fail('登录失败，请检查网络状态。')
        })
      },
      fail(res) {
        console.log('失败', res)
      }
    })



    // wxLogin().then(res => {
    //   return request({
    //     url: app.service.user.login,
    //     data: {
    //       code: res.code,
    //       userInfo: res.detail.userInfo
    //     },
    //     method: 'post'
    //   })
    // }).then(res => {
    //   console.log(user)
    //   const user = res.data

    //   if (user.id) {
    //     wx.setStorageSync('user', user)
    //     wx.setStorageSync('cookie', res.cookies[0])
    //     this.initData(user.name, user.avatarUrl, user.character)
    //   } else {
    //     Toast.fail(res.data)
    //     console.log(res)
    //   }
    // }).catch(e => {
    //   console.log(res)
    //   Toast.fail('登录失败，请检查网络状态。')
    // })
  },
  initData(name, avatarUrl, character) {
    this.setData({
      name: name,
      avatarUrl: avatarUrl,
      character: config.character[character].name
    })
  },
  navigate(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.to,
    })
  }
})