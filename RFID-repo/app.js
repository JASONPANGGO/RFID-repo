//app.js
// const SERVICE_URL = 'http://127.0.0.1:7001'
const SERVICE_URL = 'https://jasonpanggo.com/rfid'

const config = require('./config.js')
const {
  wxLogin,
  request
} = require('./utils/promisefy.js')

App({
  onLaunch: function() {
    // 从storage获取user用户信息
    let user = wx.getStorageSync('user')
    if (user) {
      this.onLogin(user)
    }
  },
  onLogin(user) {

    const userInfo = user
    const _this = this

    wxLogin().then(res => {
      return request({
        url: _this.service.user.login,
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
    }).catch(res => {
      console.log('登陆失败', res)
    })


  },
  service: {
    img_url: SERVICE_URL + '/public/img/',
    user: {
      login: SERVICE_URL + '/user/login',
      update: SERVICE_URL + '/user/update',
      get: SERVICE_URL + '/user/get'
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
    }

  }
})