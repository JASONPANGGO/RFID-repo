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
    character: null,
    instance_repo_name: ''
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
      this.initData(user)
    } else {
      wx.clearStorageSync('user')
      wx.clearStorageSync('cookie')
    }

    // 登录过期
    if (app.globalData.expire) {
      Dialog.confirm({
        title: '登录过期',
        message: '请重新登录'
      })
    }
  },
  onLogin(authRes) {
    wxLogin().then(loginRes => {
      return request({
        url: app.service.user.login,
        data: {
          code: loginRes.code,
          userInfo: authRes.detail.userInfo
        },
        method: 'post'
      })
    }).then(res => {
      const user = res.data
      if (user.id) {
        wx.setStorageSync('user', user)
        wx.setStorageSync('cookie', res.cookies[0])
        this.initData(user)
      } else {
        Toast.fail(res.data)
        console.log(res)
      }
    }).catch(e => {
      console.log(e)
      Toast.fail('登录失败，请检查网络状态。')
    })
  },
  initData(user) {
    if (user.instanceid) {
      this.getInstance(user)
    }
    this.setData({
      name: user.name,
      avatarUrl: user.avatarUrl,
      character: config.character[user.character]
    })
  },
  getInstance(user) {
    request({
      url: app.service.instance.get,
      data: {
        instanceid: user.instanceid,
        repoid: user.repoid
      },
      method: 'get'
    }).then(res => {
      if (user.character === 1) {
        this.setData({
          instance_repo_name: res.instanceData.name
        })
      } else {
        this.setData({
          instance_repo_name: `${res.data.instanceData.name} - ${res.data.repoData[0].name}`
        })
      }
    })
  },
  navigate(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.to,
    })
  }
})