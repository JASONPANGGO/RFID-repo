//app.js
// const SERVICE_URL = 'http://127.0.0.1:7001'
const SERVICE_URL = 'https://jasonpanggo.com/rfid'

const config = require('./config.js')
const {
  wxLogin
} = require('./utils/promisefy.js')

App({
  onLaunch: function() {
    wx.clearStorage()
  },
  onShow: function() {

    // 从storage获取user用户信息
    let user = wx.getStorageSync('user')
    if (!user.name) {
      wx.clearStorageSync('user')
      wx.clearStorageSync('cookie')
    }

  },
  globalData: {
    expire: false
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
      get: SERVICE_URL + '/instance/get',
      update: SERVICE_URL + '/instance/update'
    },
    repo: {
      get: SERVICE_URL + '/repo/get',
      add: SERVICE_URL + '/repo/add',
      invite: SERVICE_URL + '/repo/invite',
      update: SERVICE_URL + '/repo/update'
    },
    goods: {
      get: SERVICE_URL + '/goods/get',
      add: SERVICE_URL + '/goods/add'
    },
    task: {
      get: SERVICE_URL + '/task/get',
      add: SERVICE_URL + '/task/add',
      update: SERVICE_URL + '/task/update'
    },
    util: {
      upload: SERVICE_URL + '/util/upload'
    }

  }
})