//index.js
import Notify from '../../lib/vant-weapp/dist/notify/notify';

//获取应用实例
const app = getApp()

Page({
  data: {
    input: {
      id: ''
    },
    users: []
  },
  //事件处理函数
  onInput(e) {
    const input = this.data.input
    const query_key = e.currentTarget.dataset.query
    input[query_key] = e.detail
    this.setData({
      input: input
    })
  },
  onSearch() {
    const that = this
    const query = this.data.input
    for (let key in query) {
      if (query[key] === '') {
        delete query[key]
      }
    }
    wx.request({
      url: app.service.get,
      method: 'get',
      data: query,
      success(res) {
        that.handleSuccess(res)
      },
      fail(res) {
        that.handleFail(res)
      }
    })
  },
  handleSuccess(res) {
    console.log(res)
    if (res.data.data instanceof Array) {
      this.setData({
        users: res.data.data
      })
      
    }else{
      Notify({
        message: '获取失败',
        type: 'danger'
      })
    }

  },
  handleFail() {
    console.log(res)
    Notify({
      message:'获取失败',
      type:'danger'
    })
  }
})