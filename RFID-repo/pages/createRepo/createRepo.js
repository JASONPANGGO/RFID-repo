// pages/createRepo/createRepo.js
import Notify from '../../lib/vant-weapp/dist/notify/notify';
const {
  request,
  wxGetStorage
} = require('../../utils/promisefy.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    create_time: '',
    types: [

    ],
    onAddingType: false,
    newType: '',
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      create_time: new Date().toLocaleString()
    })


    const user = wx.getStorageSync('user')
    if (!user.id) {
      Dialog.confirm({
        title: '未登录',
        message: '使用本程序需要登录，请先登录/注册'
      }).then(() => {
        wx.switchTab({
          url: '/pages/my/my'
        })
      })
    } else {

    }
  },
  onClose(e) {
    const types = this.data.types
    types.splice(e.target.dataset.index, 1)
    this.setData({
      types: types
    })
  },
  onAddType() {
    this.setData({
      onAddingType: true
    })
  },
  confirmNewType() {
    this.setData({
      types: [...this.data.types, this.data.newType],
      newType: ''
    })
  },
  cancelNewType() {
    this.setData({
      newType: ''
    })
  },
  onInput(e) {
    this.setData({
      [e.target.dataset.field]: e.detail
    })
  },

  onSubmit() {
    if (this.data.name && !this.data.submitting) {

      this.setData({
        submitting: true
      })
      request({
        url: app.service.instance.add,
        data: {
          name: this.data.name,
          types: this.data.types,
          create_time: this.data.create_time
        },
        header: {
          'cookie': wx.getStorageSync('cookie')
        },
        method: 'post'
      }).then(res => {
        console.log(res)
        if (res.statusCode === 200 && res.data.status === 'success') {
          this.setData({
            submitting: false
          })
          const user = wx.getStorageSync('user')
          user.instanceid = res.data.instanceid
          user.character = 1
          wx.setStorageSync('user', user)
          Notify({
            backgroundColor: 'rgb(7,193,96)',
            text: "仓库创建成功！"
          })
          wx.navigateBack({
            delta: 1
          })
        }
      })

    } else {
      Notify({
        text: '请先填写必填字段'
      });
    }
  }
})