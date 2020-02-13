// pages/memberManage/memberManage.js
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
    activeRepo: 0,
    activeUsers: [],
    repo: [],
    users: [],
    user: {},
    userMoreShow: false,
    selectedUser: {},
    actions: [{
        name: '移 除',
        api: app.service.user.quit
      },
      {
        name: '更 改',
        api: app.service.user.update
      }
    ],
    characterList: [
      '员工',
      '管理员'
    ],
    showCharacter: false
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
      this.initData()
    }
  },
  initData() {
    this.setData({
      user: wx.getStorageSync('user')
    })
    Promise.all([this.getRepos(), this.getUsers()]).then(() => {
      this.onSelectRepo(0)
    })
  },
  onSelectRepo(repoIndex) {
    const repo = this.data.repo[repoIndex]
    this.setData({
      activeUsers: this.data.users.filter(u =>
        u.repoid === repo.id ||
        u.character === 1
      )
    })
  },
  getRepos() {
    return new Promise((resolve, reject) => {
      request({
        url: app.service.repo.get,
        data: {
          instanceid: wx.getStorageSync('user').instanceid
        },
        method: 'get'
      }).then(res => {
        if (res.data) {
          this.setData({
            repo: res.data
          })
          resolve()
        } else {
          Toast.fail('加载失败。')
        }
      })
    })
  },
  getUsers() {
    return new Promise((resolve, reject) => {
      request({
        url: app.service.user.get,
        data: {
          instanceid: wx.getStorageSync('user').instanceid
        },
        method: 'get'
      }).then(res => {
        if (res.data) {
          this.setData({
            users: res.data.map(e => {
              e.character_text = config.character[e.character].name
              return e
            })
          })
          resolve()
        } else {
          this.setData({
            users: [],
            activeUsers: []
          })
          Toast.fail('加载失败。')
        }
      })
    })
  },
  onSelectUser(e) {
    console.log(e)
    this.setData({
      userMoreShow: true,
      selectedUser: e.currentTarget.dataset.user
    })
  },
  onCloseMore() {
    this.setData({
      userMoreShow: false,
      selectedUser: {}
    })
  },
  onCloseCharacter() {
    this.setData({
      showCharacter: false
    })
  },
  onSelectCharacter(e) {
    console.log(e)
    const query = {
      id: this.data.selectedUser.id
    }
    switch (e.detail.value) {
      case '管理员':
        if (this.data.selectedUser.character === '员工' && this.data.user.character !== 3) {
          query.character = 2
        } else {
          Toast.fail('权限不足')
        }
        break;
      case '员工':
        if (this.data.user.character === 1) {
          query.character = 3
        }
        break;
      default:
        break
    }
    if (query.character) {
      request({
        url: e.detail.api,
        header: {
          'cookie': wx.getStorageSync('cookie')
        },
        data: query,
        method: 'post'
      }).then(res => {
        console.log(res)
        Toast.success('操作成功')
        this.getUsers()
      })
    }
  },
  onSelectAction(e) {

    if (this.data.user.character === 3 || (this.data.user.character === 2 && this.data.selectedUser.character !== '员工')) {

      Toast.fail('权限不足')

    } else {
      switch (e.detail.name) {
        case '移 除':
          request({
            url: e.detail.api,
            header: {
              'cookie': wx.getStorageSync('cookie')
            },
            data: {
              id: this.data.selectedUser.id,
              instanceid: this.data.selectedUser.instanceid,
              repoid: this.data.selectedUser.repoid
            },
            method: 'post'
          }).then(res => {
            console.log(res)
            Toast.success('操作成功')
            this.getUsers()
          })
          break;
        case '更 改':
          this.setData({
            showCharacter: true
          })
          break;
        default:
          break;
      }

    }
  },
  onChange(e) {
    this.onSelectRepo(e.detail)
  }
})