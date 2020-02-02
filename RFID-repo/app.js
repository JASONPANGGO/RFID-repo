//app.js
const SERVICE_URL = 'http://127.0.0.1:7001'
// const SERVICE_URL = 'https://jasonpanggo.com/rfid'

App({
  onLaunch: function() {
    // 从storage获取user用户信息
    let user = wx.getStorageSync('user')
    if (user) {
      this.globalData.user = user
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
  globalData: {
    user: {}
  },
  service: {
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
      add: SERVICE_URL + '/goods/add'
    }

  }
})