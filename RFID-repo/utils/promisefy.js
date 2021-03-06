import Toast from '../lib/vant-weapp/dist/toast/toast';
const promisefy = fn => extraProps => new Promise((resolve, reject) => fn({
  ...extraProps,
  success: res => {
    if (res.statusCode === 403) {
      Toast.fail('权限不足')
    }
    if (res && res.data && res.data.message === 'login expire') {
      const app = getApp()
      console.log('登录过期')
      app.globalData.expire = true
      wx.switchTab({
        url: '/pages/my/my'
      })
      wx.clearStorageSync('user')
      wx.clearStorageSync('cookie')
    } else {
      if (res.cookies && res.cookies[0]) {
        wx.setStorageSync('cookie', res.cookies[0])
      }
    }
    return resolve(res)
  },
  fail: err => {
    Toast.fail('请检查网络')
    return reject(err)
  },
}))

module.exports = {
  showToast: function(props) {
    return promisefy(wx.showToast)({
      title: '',
      icon: "none",
      duration: 2000,
      confirmColor: '#ff673f',
      mask: true,
      ...props
    })
  },
  request: function(props) {
    return promisefy(wx.request)({
      header: {
        'cookie': wx.getStorageSync('cookie')
      },
      ...props
    })
  },
  wxLogin: function() {
    return promisefy(wx.login)()
  }
}