// pages/joinRepo/joinRepo.js
import Notify from '../../lib/vant-weapp/dist/notify/notify';
import Toast from '../../lib/vant-weapp/dist/toast/toast';
import Dialog from '../../lib/vant-weapp/dist/dialog/dialog';
const app = getApp()
const {
  request
} = require('../../utils/promisefy.js')
const config = require('../../config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invite_code: '',
    repo: null,
    instance: null,
    creater: null,
    user: null
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
      user: wx.getStorageSync('user')
    })
  },
  confirm() {

    request({
      url: app.service.repo.get,
      data: {
        invite_code: this.data.invite_code
      },
      method: 'get'
    }).then(res => {
      console.log(res)
      if (res.data.length === 1) {
        res.data[0].status_text = config.repo_status[res.data[0].status].name
        this.setData({
          repo: res.data[0]
        })
        request({
          url: app.service.instance.get,
          data: {
            instanceid: res.data[0].instanceid
          },
          method: 'get'
        }).then(r => {
          this.setData({
            instance: r.data.instanceData,
            creater: r.data.createrData[0]
          })
        })
      } else {
        Toast.fail("查询失败，请检查邀请码。")

      }
    })

  },
  onInput(e) {
    console.log(e)
    this.setData({
      invite_code: e.detail
    })
  },
  join() {
    request({
      url: app.service.user.join,
      header: {
        'cookie': wx.getStorageSync('cookie')
      },
      data: {
        id: this.data.user.id,
        character: 3,
        instanceid: this.data.instance.id,
        repoid: this.data.repo.id
      },
      method: 'post',
      updateTask: 1
    }).then(res => {
      console.log(res)
      if (res.statusCode == 200) {
        Toast.success({
          message: '加入成功',
          duration: 2000
        })
        const user = this.data.user
        user.instanceid = this.data.instance.id
        user.repoid = this.data.repo.id
        user.character = 3
        wx.setStorageSync('user', user)
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/my/my',
          })
        }, 2000)
      }
    })
  }


})