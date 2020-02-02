// pages/repoManage/repoManage.js
import Notify from '../../lib/vant-weapp/dist/notify/notify';
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
    instanceid: '',
    name: '',
    create_time: '',
    creater: {},
    repos: [],
    onCreating: false,
    repo_name: ''
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
    this.getInstance()
    this.getRepos()
  },
  getInstance() {

    request({
      url: app.service.instance.get,
      header: {
        'cookie': wx.getStorageSync('cookie')
      },
      data: {
        instanceid: wx.getStorageSync('user').instanceid
      },
      method: 'get'
    }).then(res => {
      console.log(res)
      const instance = res.data.instanceData
      let creater = res.data.createrData
      if (creater instanceof Array && creater.length === 1) {
        creater = creater[0]
      }
      if (instance) {
        this.setData({
          instanceid: instance.id,
          name: instance.name,
          create_time: new Date(instance.create_time).toLocaleString(),
          creater: {
            avatarUrl: creater.avatarUrl,
            name: creater.name
          }
        })
      }
    })

  },
  getRepos() {
    request({
      url: app.service.repo.get,
      header: {
        'cookie': wx.getStorageSync('cookie')
      },
      data: {
        instanceid: wx.getStorageSync('user').instanceid
      },
      method: 'get'
    }).then(res => {
      console.log(res)
      if (res.data) {
        if (!(res.data instanceof Array)) {
          res.data = [res.data]
        }
        res.data = res.data.map(repo => {
          repo.status_text = config.repo_status[repo.status].name
          repo.create_time = new Date(repo.create_time).toLocaleString()
          return repo
        })
        this.setData({
          repos: res.data
        })
      }
    })
  },
  onCreate() {
    this.setData({
      onCreating: true
    })
  },
  onAddType() {
    this.setData({
      onAddingType: true
    })
  },
  confirmNewRepo() {
    request({
      url: app.service.repo.add,
      method: 'post',
      data: {
        instanceid: this.data.instanceid,
        name: this.data.repo_name
      }
    }).then(res => {
      this.getRepos()
    })
  },
  cancelNewRepo() {
    this.setData({
      repo_name: '',
      onCreating: false
    })
  },
  onInput(e) {
    this.setData({
      [e.target.dataset.field]: e.detail
    })
  },

})