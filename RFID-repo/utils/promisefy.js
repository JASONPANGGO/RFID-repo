const promisefy = fn => defaultProps => extraProps => new Promise((resolve, reject) => fn({
  ...defaultProps,
  ...extraProps,
  success: res => {
    if (res && res.data && res.data.message === 'login expire') {
      const app = getApp()
      console.log('登录过期')
      app.globalData.expire = true
      wx.switchTab({
        url: '/pages/my/my'
      })
      wx.clearStorageSync('user')
      wx.clearStorageSync('cookie')
    }
    return resolve(res)
  },
  fail: err => reject(err),
}));

module.exports = {
  showToast: promisefy(wx.showToast)({
    title: '',
    icon: "none",
    duration: 2000,
    confirmColor: '#ff673f',
    mask: true
  }),
  request: promisefy(wx.request)({
    url: '',
    method: '',
    data: '',
    success: '',
    fail: '',
    header: {
      'cookie': wx.getStorageSync('cookie')
    }
  }),
  wxLogin: promisefy(wx.login)()
}