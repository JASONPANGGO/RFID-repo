// pages/createTask/createTask.js
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
    name: '',
    type: '',
    repo: '',
    goods: '',
    amount: '',
    nextUser: '',
    create_time: new Date().toLocaleString(),
    user: {},
    instance_goods: [],
    goods_picker: [],
    user_picker: [],
    task_types: config.task.filter(t => t.value === 0 || t.value === 1),
    showTypesPicker: false,
    showGoodsPicker: false,
    showUserPicker: false,
    showPreview: false,
    outMaxAmount: ''
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
    this.initData()
  },
  initData() {
    const user = wx.getStorageSync('user')
    this.setData({
      user: user
    })
    Promise.all([this.getGoods(user.instanceid), this.getRepo(user.instanceid)]).then(res => {
      console.log(res)
      let [goods, repo] = res
      goods = goods.map(g => {
        g.text = g.name
        return g
      })
      repo.forEach(r => {
        r.text = r.name
        r.values = goods.filter(g => g.repoid === r.id)
      })
      this.setData({
        instance_goods: repo,
        goods_picker: [{
          values: repo
        }, {
          values: repo[0].values
        }]
      })
    })
  },
  getGoods(instanceid) {
    return new Promise((resolve, rej) => {

      request({
        url: app.service.goods.get,
        data: {
          instanceid: instanceid
        },
        method: 'get'
      }).then(res => {
        if (res.data) {
          resolve(res.data)
        }
      })

    })
  },
  getRepo(instanceid) {
    return new Promise((resolve, rej) => {

      request({
        url: app.service.repo.get,
        data: {
          instanceid: instanceid
        },
        method: 'get'
      }).then(res => {
        if (res.data) {
          resolve(res.data)
        }
      })

    })
  },
  getUser(repoid) {
    request({
      url: app.service.user.get,
      data: {
        repoid: repoid
      },
      method: 'get'
    }).then(res => {
      if (res.data) {
        this.setData({
          user_picker: res.data.map(u => {
            u.text = `${u.name}  ${config.character[u.character].name}`
            return u
          })
        })
      }
    })
  },
  onSelectType() {
    this.setData({
      showTypesPicker: true
    })
  },
  onSelectGoods() {
    this.setData({
      showGoodsPicker: true
    })
  },
  onSelectNext() {
    this.setData({
      showUserPicker: true
    })
  },
  onGoodsChange(e) {
    const {
      picker,
      value,
      index
    } = e.detail;
    picker.setColumnValues(1, value[0].values);
  },
  onClose() {
    this.setData({
      showTypesPicker: false,
      showGoodsPicker: false,
      showUserPicker: false,
      showPreview: false
    })
  },
  onPickType(e) {
    this.setData({
      type: e.detail.value,
      showTypesPicker: false
    })
  },
  onPickGoods(e) {
    console.log(e)
    this.setData({
      repo: e.detail.value[0],
      goods: e.detail.value[1],
      showGoodsPicker: false
    })
    this.setData({
      outMaxAmount: e.detail.value[1].amount
    })
    this.getUser(e.detail.value[1].repoid)
  },
  onPickNext(e) {
    this.setData({
      showUserPicker: false,
      nextUser: e.detail.value
    })
  },
  onInput(e) {
    if (e.currentTarget.dataset.field === 'amount' && e.value > this.data.outMaxAmount) {
      Toast.fail('出库数量不得超出库存数量')
      this.setData({
        amount: this.data.outMaxAmount
      })
    } else {
      this.setData({
        [e.currentTarget.dataset.field]: e.detail
      })
    }
  },
  preview() {
    if (this.data.amount) {
      this.setData({
        showPreview: true
      })
    } else {
      Toast.fail('请先填完必填项目')
    }
  },
  submit() {
    console.log('submit', app.service.task.add)
    request({
      url: app.service.task.add,
      header: {
        'cookie': wx.getStorageSync('cookie')
      },
      data: {
        name: this.data.name,
        type: this.data.type.value,
        instanceid: this.data.repo.instanceid,
        repoid: this.data.repo.id,
        goodsid: this.data.goods.id,
        amount: this.data.amount,
        nextUserid: this.data.nextUser.id,
        comment: this.data.comment,
        createrid: this.data.user.id,
        status: 0
      },
      method: "post"
    }).then(res => {
      console.log(res)
      Toast.success('提交成功')
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 2000)
    })
  }
})