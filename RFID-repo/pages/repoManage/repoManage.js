// pages/repoManage/repoManage.js
import Notify from '../../lib/vant-weapp/dist/notify/notify';
import Toast from '../../lib/vant-weapp/dist/toast/toast';
import Dialog from '../../lib/vant-weapp/dist/dialog/dialog';
const app = getApp()
const {
  request,
  time
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
    repo_name: '',
    repoMoreShow: false,
    selectedRepo: {},
    actions: [{
      name: '生成邀请码',
      color: '#1890ff',
      api: app.service.repo.invite
    }, {
      name: '弃用/恢复',
      color: '#f5222d',
      api: app.service.repo.update
    }]
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
    console.log(new Date().toTimeString())
    console.log(time)
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
      this.getInstance()
      this.getRepos()
    }
  },
  getInstance() {
    request({
      url: app.service.instance.get,
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
        const date = new Date(instance.create_time)
        const create_time = date.getFullYear() + '/' + (date.getMonth() + 1) + "/" + date.getDate()
        this.setData({
          instanceid: instance.id,
          name: instance.name,
          create_time: create_time,
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
      data: {
        instanceid: wx.getStorageSync('user').instanceid
      },
      method: 'get'
    }).then(res => {
      if (res.data) {
        if (!(res.data instanceof Array)) {
          res.data = [res.data]
        }
        res.data = res.data.map(repo => {
          repo.status_text = config.repo_status[repo.status].name
          const date = new Date(repo.create_time)
          repo.create_time = date.getFullYear() + '/' + (date.getMonth() + 1) + "/" + date.getDate()
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
  onSelectRepo(e) {
    const repo = e.target.dataset.repo
    this.setData({
      selectedRepo: repo,
      repoMoreShow: true
    })
  },
  onCloseMore() {
    this.setData({
      selectedRepo: {},
      repoMoreShow: false
    })
  },
  onSelectAction(e) {

    request({
      url: e.detail.api,
      header: {
        'cookie': wx.getStorageSync('cookie')
      },
      method: 'post',
      data: {
        id: this.data.selectedRepo.id,
        status: !this.data.selectedRepo.status * 1 // 布尔转数字
      }
    }).then(res => {
      console.log(res)
      if (res.data.invite_code) {
        wx.setClipboardData({
          data: res.data.invite_code,
        })
        Dialog.confirm({
          title: '生成成功',
          message: '邀请码已复制到剪贴板。'
        })
      } else if (res.statusCode === 403) {
        Toast.fail('权限不足')
      } else {
        Toast.success('操作成功')
        this.getRepos()
      }
    }).catch(e => {
      Toast.fail('操作失败')
    })

  }
})