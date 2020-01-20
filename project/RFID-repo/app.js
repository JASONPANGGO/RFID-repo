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
    // 获取微信用户开放信息
    wx.getUserInfo({
      success: res => {
        if (res.userInfo) {
          this.globalData.userInfo = res.userInfo
        }
      },
      fail(res) {
        console.log(res)
      }
    })

  },
  globalData: {
    userInfo: {},
    user: {}
  },
  service: {
    get: SERVICE_URL + '/get',
    login: SERVICE_URL + '/login'
  }
})