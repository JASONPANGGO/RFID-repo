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
        api: app.service.user.update
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
    this.getRepos()
    this.getUsers()
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
        this.setData({
          repo: res.data
        })
      } else {
        Toast.fail('加载失败。')
      }
    })
  },
  getUsers() {
    request({
      url: app.service.user.get,
      data: {
        instanceid: wx.getStorageSync('user').instanceid
      },
      method: 'get'
    }).then(res => {
      if (res.data) {
        console.log(res.data)
        if (res.data.data) {

          this.setData({
            users: res.data.data.map(e => {
              e.character = config.character[e.character].name
              return e
            })
          })
          this.setData({
            activeUsers: this.data.users.filter(e =>
              e.repoid === this.data.repo[this.data.activeRepo].id ||
              e.character === '创建者'
            )
          })

        } else {
          this.setData({
            users: [],
            activeUsers: []
          })
        }
      } else {
        Toast.fail('加载失败。')
      }
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
              character: 0,
              instanceid: null,
              repoid: null
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
  }
})