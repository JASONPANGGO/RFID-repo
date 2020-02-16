// pages/imgUpload/imgUpload.js
import WeCropper from '../../lib/we-cropper/we-cropper.min.js'
import Toast from '../../lib/vant-weapp/dist/toast/toast';

const {
  request
} = require('../../utils/promisefy.js')
const config = require('../../config.js')
const app = getApp()
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50
let eventChannel;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      },
      boundStyle: {
        color: config.themeColor,
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      }
    }
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

  },
  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage() {
    this.cropper.getCropperImage(function(path, err) {
      if (err) {
        wx.showModal({
          title: '温馨提示',
          content: err.message
        })
      } else {
        Toast.loading({
          mask: false,
          message: '加载中...'
        })
        wx.uploadFile({
          header: {
            'cookie': wx.getStorageSync('cookie')
          },
          url: app.service.util.upload,
          filePath: path,
          name: 'file',
          success(res) {
            console.log(res)
            Toast.success('上传成功')
            // 上传完成需要更新 fileList
            eventChannel.emit('getImgUrl', app.service.img_url + JSON.parse(res.data).img_url)
            wx.navigateBack({
              delta: 1,
            })
          },
          fail(res) {
            console.log(res)
            Toast.fail('上传失败')
          }
        })

        // wx.previewImage({
        //   current: '', // 当前显示图片的 http 链接
        //   urls: [path] // 需要预览的图片 http 链接列表
        // })

      }
    })
  },
  uploadTap() {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值

        self.cropper.pushOrign(src)
      }
    })
  },
  onLoad(option) {
    const {
      cropperOpt
    } = this.data
    eventChannel = this.getOpenerEventChannel()

    cropperOpt.boundStyle.color = config.themeColor

    this.setData({
      cropperOpt
    })
    console.log(cropperOpt.boundStyle.color)
    if (option.src) {
      cropperOpt.src = option.src
      this.cropper = new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
          console.log(`wecropper is ready for work!`)
        })
        .on('beforeImageLoad', (ctx) => {
          console.log(`before picture loaded, i can do something`)
          console.log(`current canvas context:`, ctx)
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          console.log(`picture loaded`)
          console.log(`current canvas context:`, ctx)
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
          console.log(`before canvas draw,i can do something`)
          console.log(`current canvas context:`, ctx)
        })
    }
  }
})