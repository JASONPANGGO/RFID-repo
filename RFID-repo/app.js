//app.js
const SERVICE_URL = 'http://127.0.0.1:7001'
// const SERVICE_URL = 'https://jasonpanggo.com/rfid'

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
      this.globalData.user = user
      this.onLogin(user)
    }

    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 获取微信用户开放信息
    //       wx.getUserInfo({
    //         success: res => {
    //           if (res.userInfo) {
    //             this.globalData.userInfo = res.userInfo
    //           }
    //         },
    //         fail(res) {
    //           console.log(res)
    //         }
    //       })
    //     }
    //   }
    // })

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
    })


  },
  globalData: {
    user: {}
  },
  service: {
    img_url: SERVICE_URL + '/public/img/',
    user: {
      login: SERVICE_URL + '/login'
    },
    instance: {
      add: SERVICE_URL + '/instance/add',
      get: SERVICE_URL + '/instance/get'
    },
    repo: {
      get: SERVICE_URL + '/repo/get',
      add: SERVICE_URL + '/repo/add',
    },
    goods: {
      get: SERVICE_URL + '/goods/get',
      add: SERVICE_URL + '/goods/add',
      upload: SERVICE_URL + '/goods/upload'
    }

  }
})