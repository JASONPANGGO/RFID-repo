//app.js
// const SERVICE_URL = 'http://127.0.0.1:7001'
const SERVICE_URL = 'https://jasonpanggo.com/rfid'

const config = require('./config.js')
const {
  wxLogin,
  request
} = require('./utils/promisefy.js')

App({
  onLaunch: function() {},
  onShow: function() {
    wx.checkSession({
      success() {
        console.log('登录有效')
      },
      fail() {
        console.log('登录失效')
      }
    })
    // 从storage获取user用户信息
    let user = wx.getStorageSync('user')
    if (user.name) {
      this.onLogin(user)
    } else {
      wx.clearStorageSync('user')
    }

  },
  onLogin(user) {

    const userInfo = user

    wxLogin().then(res => {
      return request({
        url: this.service.user.login,
        data: {
          code: res.code,
          userInfo: userInfo
        },
        method: 'GET'
      })
    }).then(res => {
      const user = res.data
      wx.setStorageSync('user', user)
      wx.setStorageSync('cookie', res.cookies[0])
    }).catch(res => {
      console.log('登陆失败', res)
    })


  },
  service: {
    img_url: SERVICE_URL + '/public/img/',
    user: {
      login: SERVICE_URL + '/user/login',
      update: SERVICE_URL + '/user/update',
      get: SERVICE_URL + '/user/get',
      join: SERVICE_URL + '/user/join',
      quit: SERVICE_URL + '/user/quit'
    },
    instance: {
      add: SERVICE_URL + '/instance/add',
      get: SERVICE_URL + '/instance/get'
    },
    repo: {
      get: SERVICE_URL + '/repo/get',
      add: SERVICE_URL + '/repo/add',
      invite: SERVICE_URL + '/repo/invite',
      update: SERVICE_URL + '/repo/update'
    },
    goods: {
      get: SERVICE_URL + '/goods/get',
      add: SERVICE_URL + '/goods/add',
      upload: SERVICE_URL + '/goods/upload'
    },
    task: {
      get: SERVICE_URL + '/task/get',
      add: SERVICE_URL + '/task/add',
      update: SERVICE_URL + '/task/update'
    }

  }
})