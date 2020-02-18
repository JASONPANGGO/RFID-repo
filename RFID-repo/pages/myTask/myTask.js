// pages/myTask/myTask.js

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
    user: {},
    activeTab: 0,
    task_accept: [],
    task_create: [],
    onPreviewItem: {},
    showPreview: false
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
    } else if (!user.instanceid) {
      Dialog.confirm({
        title: '无仓库',
        message: '先创建或者加入一个仓库'
      }).then(() => {
        wx.switchTab({
          url: '/pages/my/my'
        })
      })
    } else {
      Toast.loading({
        mask: false,
        message: '加载中...'
      })

      this.initData(user)
      this.setData({
        user: user
      })
    }
  },
  initData(user) {
    const query = {
      nextUserid: user.id,
      createrid: user.id
    }
    Toast.loading({
      mask: false,
      message: '加载中...'
    })
    if (user.character === 1) {
      query.instanceid = user.instanceid
    } else {
      query.repoid = user.repoid
    }
    this.getTask(query)
  },
  getTask(query) {
    request({
      url: app.service.task.get,
      data: query,
      method: 'get'
    }).then(res => {
      let {
        goodsData,
        repoData,
        taskData,
        userData
      } = res.data
      taskData = taskData.map(t => {
        t.name = t.name || config.task[t.type].name
        t.type_text = config.task[t.type].name
        t.status_text = config.status[t.status].text
        t.status_tag_type = config.status[t.status].tag_type
        t.create_time = new Date(t.create_time).toLocaleString()
        t.repo = repoData.find(r => r.id === t.repoid)
        t.nextUser = userData.find(u => u.id === t.nextUserid)
        t.goods = goodsData.find(g => g.id === t.goodsid)
        return t
      })
      this.setData({
        task_accept: taskData.filter(t => t.nextUserid === this.data.user.id),
        task_create: taskData.filter(t => t.createrid === this.data.user.id)
      })
    })
  },
  onPreview(e) {
    const index = e.currentTarget.dataset.index
    const tasks_list = ['task_accept', 'task_create']
    console.log(this.data[tasks_list[this.data.activeTab]])
    console.log(this.data[tasks_list[this.data.activeTab]][index])
    this.setData({
      onPreviewItem: this.data[tasks_list[this.data.activeTab]][index],
      showPreview: true
    })
  },
  onClose() {
    this.setData({
      showPreview: false,
      onPreviewItem: {}
    })
  },

  withdraw(e) {
    Dialog.confirm({
      title: '撤回任务',
      message: '是否确定撤回该任务？'
    }).then(() => {
      request({
        url: app.service.task.update,
        data: {
          id: e.currentTarget.dataset.id,
          status: 3
        },
        method: 'post'
      }).then(res => {
        console.log(res)
        Toast.success('撤回成功')
      })
    })
  },
  onPullDownRefresh() {
    const user = wx.getStorageSync('user')
    this.initData(user)
  },
  edit(e) {
    wx.navigateTo({
      url: '/pages/createTask/createTask',
      success: function(res) {
        res.eventChannel.emit('editTask', e.currentTarget.dataset.item)
      }
    })
  },
  onTabChange() {
    this.setData({
      activeTab: !this.data.activeTab * 1
    })
  },
  process(e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/taskDetail/taskDetail',
      success: function(res) {
        res.eventChannel.emit('taskDetail', e.currentTarget.dataset.item)
      }
    })
  }
})