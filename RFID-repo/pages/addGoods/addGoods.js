// pages/addGoods/addGoods.js
import Dialog from '../../lib/vant-weapp/dist/dialog/dialog';

const {
  request
} = require('../../utils/promisefy.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [],
    repo_list: [],
    types: [],
    picker_list: [],
    id: '',
    img_url: '',
    name: '',
    type: '',
    create_time: '',
    price: '',
    amount: '',
    bar_code: '',
    comment: '',
    show_select: false,
    repo: '',
    user: {},
    update: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('editGoods', (goods) => {
      this.setData({
        id: goods.id,
        name: goods.name,
        type: goods.type,
        create_time: new Date(goods.create_time).toLocaleDateString(),
        price: goods.price,
        amount: goods.amount,
        bar_code: goods.bar_code,
        comment: goods.comment,
        repo: goods.repo,
        img_url: goods.img_url,
        update: true
      })
      console.log(goods)
    })
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
      create_time: new Date().toLocaleString(),
      user: wx.getStorageSync('user')
    })
    this.getRepos()
    this.getInstance()
  },
  onInput(e) {
    const field = e.currentTarget.dataset['field']
    const value = e.detail
    this.setData({
      [field]: value
    })
  },
  scan() {
    const that = this
    wx.scanCode({
      success(e) {
        console.log(e)
        that.findGoodsByBarCode(e.result)
      },
      fail() {
        console.log(e)
      }
    })
  },
  findGoodsByBarCode(code) {
    Toast.loading({
      mask: false,
      message: '加载中...'
    })
    request({
      url: app.service.goods.get,
      data: {
        bar_code: code
      },
      method: 'get'
    }).then(res => {
      console.log(res)
      if (res.date.length === 0) {
        this.setData({
          bar_code: code
        })
      } else {
        const goods = res.data[0]
        wx.navigateTo({
          url: '/pages/goodsDetail/goodsDetail',
          success: function(res) {
            res.eventChannel.emit('goodsData', goods)
          }
        })
      }
    })
  },
  onSubmit() {
    const {
      name,
      price,
      bar_code,
      amount,
      repo,
      img_url,
      comment,
      type
    } = this.data
    if (!name || !price || !amount || !repo || !type) {
      Dialog.confirm({
        message: '请先填写完所有必填字段'
      })
    } else {

      if (this.data.update) {

        request({
          url: app.service.goods.update,
          data: {
            id: this.data.id,
            name: name,
            price: price,
            bar_code: bar_code,
            amount: amount,
            repoid: repo.id,
            img_url: img_url,
            comment: comment,
            type: type
          },
          method: 'post'
        }).then(res => {
          Dialog.alert({
            title: '商品修改成功',
            message: ''
          }).then(res => {
            wx.switchTab({
              url: '/pages/goods/goods'
            })
          })
        })

      } else {
        request({
          url: app.service.goods.add,
          data: {
            name: name,
            price: price,
            bar_code: bar_code,
            amount: amount,
            instanceid: this.data.user.instanceid,
            repoid: repo.id,
            img_url: img_url,
            comment: comment,
            type: type
          },
          method: 'post'
        }).then(res => {
          Dialog.alert({
            title: '商品添加成功',
            message: ''
          }).then(res => {
            wx.switchTab({
              url: '/pages/goods/goods'
            })
          })
        })
      }
    }
  },
  getRepos() {
    request({
      url: app.service.repo.get,
      data: {
        instanceid: this.data.user.instanceid
      },
      method: 'get'
    }).then(res => {
      if (res.data instanceof Array) {
        this.setData({
          repo_list: res.data.map(e => {
            e.text = e.name
            return e
          })
        })
      }
    })
  },
  getInstance() {
    request({
      url: app.service.instance.get,
      data: {
        instanceid: this.data.user.instanceid
      },
      method: 'get'
    }).then(res => {
      this.setData({
        types: res.data.instanceData.goods_type.split(',')
      })
    })
  },
  onSelectRepo() {
    this.setData({
      show_select: 'repo',
      picker_list: this.data.repo_list
    })
  },
  onSelectType() {
    this.setData({
      show_select: 'type',
      picker_list: this.data.types
    })
  },
  onSelect(e) {
    const {
      picker,
      value,
      index
    } = e.detail;
    console.log(e.detail)
    const key = this.data.show_select
    this.setData({
      [key]: value,
      show_select: false
    })
  },
  onClose() {
    this.setData({
      show_select: false
    })
  },

  afterRead(e) {
    const file = e.detail.file
    const _this = this
    console.log(file)
    wx.uploadFile({
      header: {
        'cookie': wx.getStorageSync('cookie')
      },
      url: app.service.util.upload,
      filePath: file.path,
      name: 'file',
      success(res) {
        console.log(res)
        // 上传完成需要更新 fileList
        _this.setData({
          img_url: app.service.img_url + JSON.parse(res.data).img_url
        })
      },
      fail(res) {
        console.log(res)
      }
    })
  }


})