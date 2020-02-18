const app = getApp()
const config = require('../../config.js')
const {
  wxLogin,
  request
} = require('../../utils/promisefy.js')
import Toast from '../../lib/vant-weapp/dist/toast/toast';
import Dialog from '../../lib/vant-weapp/dist/dialog/dialog';
// pages/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '../../image/user.png',
    name: null,
    character: null,
    instance_repo_name: '',
    onChangingName: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('user wx.storage：', wx.getStorageSync('user'))
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
    // 控制tabbar
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }

    // 从本地缓存取得已登录用户的数据
    const user = wx.getStorageSync('user')
    if (user.id) {
      this.initData(user)
    } else {
      wx.clearStorageSync('user')
      wx.clearStorageSync('cookie')
      wx.clearStorage()
    }

    // 登录过期
    if (app.globalData.expire) {
      Dialog.confirm({
        title: '登录过期',
        message: '请重新登录'
      })
    }
  },
  onLogin(authRes) {
    Toast.loading({
      mask: false,
      message: '加载中...'
    })
    wxLogin().then(loginRes => {
      return request({
        url: app.service.user.login,
        data: {
          code: loginRes.code,
          userInfo: authRes.detail.userInfo
        },
        method: 'post'
      })
    }).then(res => {
      const user = res.data
      if (user.id) {
        user.name = decodeURI(user.name)
        wx.setStorageSync('user', user)
        wx.setStorageSync('cookie', res.cookies[0])
        this.initData(user)
        Toast.clear()
      } else {
        Toast.fail(res.data)
        console.log(res)
      }
    }).catch(e => {
      console.log(e)

      Toast.fail('登录失败，请检查网络状态。')
    })
  },
  initData(user) {
    if (user.instanceid) {
      this.getInstance(user)
    }
    this.setData({
      name: user.name,
      avatarUrl: user.avatarUrl,
      character: config.character[user.character]
    })
  },
  getInstance(user) {
    request({
      url: app.service.instance.get,
      data: {
        instanceid: user.instanceid,
        repoid: user.repoid
      },
      method: 'get'
    }).then(res => {
      if (user.character === 1) {
        this.setData({
          instance_repo_name: res.instanceData.name
        })
      } else {
        this.setData({
          instance_repo_name: `${res.data.instanceData.name} - ${res.data.repoData[0].name}`
        })
      }
    })
  },
  navigate(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.to,
    })
  },
  onChangeName() {
    this.setData({
      onChangingName: true
    })
  },
  onInput(e) {
    const key = e.currentTarget.dataset.field;
    this.setData({
      [key]: e.detail
    })
  },
  confirmNewName() {
    const user = wx.getStorageSync('user')
    request({
      url: app.service.user.update,
      data: {
        id: user.id,
        name: this.data.name
      },
      method: "post"
    }).then(res => {
      console.log(res)
      if (res.statusCode === 200) {
        user.name = this.data.name
        wx.setStorageSync('user', user)
        this.setData({
          onChangingName: false
        })
        Toast.success('操作成功')
      } else {
        this.onClose()
        Toast.fail('检查网络')
      }
    })
  },
  onClose() {
    this.setData({
      onChangingName: false,
      name: wx.getStorageSync('user').name
    })
  },

  changeAvatar() {
    const that = this
    const user = wx.getStorageSync('user')
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        wx.navigateTo({
          url: `/pages/imgUpload/imgUpload?src=${src}`,
          events: {
            getImgUrl(img_url) {
              request({
                url: app.service.user.update,
                data: {
                  id: user.id,
                  avatarUrl: img_url
                },
                method: 'post'
              }).then(res => {
                if (res.statusCode === 200) {
                  Toast.success("操作成功")
                  user.avatarUrl = img_url
                  wx.setStorageSync('user', user)
                  that.setData({
                    avatarUrl: img_url
                  })
                } else {
                  Toast.fail('操作失败')
                }
              })
            }
          }
        })
      }
    })
  }
})