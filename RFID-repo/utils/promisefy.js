const promisefy = fn => defaultProps => extraProps => new Promise((resolve, reject) => fn({
  ...defaultProps,
  ...extraProps,
  success: res => resolve(res),
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
    fail: ''
  }),
  wxLogin: promisefy(wx.login)()
}