// pages/task/task.js
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
    task_member: [{
      user: {
        name: 'JasonPang',
        avatarUrl: 'https://wx.qlogo.cn/mmopen/vi_32/WmxkCfNhM2jVmhkvl69qNaD6ZK6zHl3BRAdSzHQENXHnwY2jyjRmrbDFg9SJwNTFibk7JJ3NahWC39uCgWrOZoQ/132'
      },
      name: "加入仓库",
      repo: {
        name: '北京路店'
      },
      create_time: new Date().toLocaleString()
    }],
    task_goods: [],
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
  onTabChange() {
    this.setData({
      activeTab: !this.data.activeTab * 1
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    Toast.loading({
      mask: false,
      message: '加载中...'
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
      this.initData(user)
      this.setData({
        user: user
      })
    }
  },
  initData(user) {
    Toast.loading({
      mask: false,
      message: '加载中...'
    })
    if (user.character === 1) {
      this.getTask({
        instanceid: user.instanceid
      })
    } else {
      this.getTask({
        repoid: repoid
      })
    }
  },
  getTask(query) {
    request({
      url: app.service.task.get,
      data: query,
      header: {
        'cookie': wx.getStorageSync('cookie')
      },
      method: 'get'
    }).then(res => {
      console.log(res)
      if (res.data) {
        const task = res.data.taskData
        const user = res.data.userData
        const repo = res.data.repoData
        const goods = res.data.goodsData

        const task_goods = []
        const task_member = []

        // 仓库和成员分开处理
        task.forEach(t => {

          // 成员
          if (t.type === 2 || t.type === 3) {
            t.name = t.name || config.task[t.type].name
            t.user = user.find(u => u.id === t.createrid)
            t.create_time = new Date(t.create_time).toLocaleString()
            t.repo = repo.find(r => r.id === t.repoid)
            task_member.unshift(t)

            // 仓库  
          } else {

            t.name = t.name || config.task[t.type].name
            t.type_text = config.task[t.type].name
            t.status_text = config.status[t.status].text
            t.status_tag_type = config.status[t.status].tag_type
            t.create_time = new Date(t.create_time).toLocaleString()
            t.repo = repo.find(r => r.id === t.repoid)
            t.nextUser = user.find(u => u.id === t.nextUserid)
            t.goods = goods.find(g => g.id === t.goodsid)
            task_goods.unshift(t)
          }
        })


        this.setData({
          task_goods: task_goods,
          task_member: task_member
        })
        Toast.clear()
        wx.hideLoading()
      } else {
        Toast.fail('没有消息')
      }
    })
  },
  goToCreate() {
    wx.navigateTo({
      url: '/pages/createTask/createTask'
    })
  },
  onPreview(e) {
    console.log(e)
    const index = e.currentTarget.dataset.index
    this.setData({
      onPreviewItem: this.data.task_goods[index],
      showPreview: true
    })
  },
  onClose() {
    this.setData({
      showPreview: false,
      onPreviewItem: {}
    })
  },
  onPullDownRefresh() {
    const user = wx.getStorageSync('user')
    this.initData(user)
  },
  accept(e) {
    Dialog.confirm({
      title: '接受任务',
      message: '是否确定接受该任务？'
    }).then(() => {
      request({
        url: app.service.task.update,
        header: {
          'cookie': wx.getStorageSync('cookie')
        },
        data: {
          id: e.currentTarget.dataset.id,
          status: 1,
          nextUserid: user.id
        },
        method: 'post'
      }).then(res => {
        console.log(res)
        Toast.success('接受成功')
      })
    })
  },
  withdraw(e) {
    Dialog.confirm({
      title: '撤回任务',
      message: '是否确定撤回该任务？'
    }).then(() => {
      request({
        url: app.service.task.update,
        header: {
          'cookie': wx.getStorageSync('cookie')
        },
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
  }
})