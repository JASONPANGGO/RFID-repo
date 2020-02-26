Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#1296db",
    list: [{
        pagePath: "/pages/index/index",
        iconPath: "/image/index.png",
        selectedIconPath: "/image/index_HL.png",
        text: "总览",
        styleClass: 'tab-bar-item'
      },
      {
        pagePath: "/pages/goods/goods",
        iconPath: "/image/goods.png",
        selectedIconPath: "/image/goods_HL.png",
        text: "库存",
        styleClass: 'tab-bar-item'
      },
      {
        pagePath: "scan",
        iconPath: "/image/good-op.png",
        text: '',
        styleClass: 'tab-bar-item tab-bar-middle'
      },
      {
        pagePath: "/pages/task/task",
        iconPath: "/image/task.png",
        selectedIconPath: "/image/task_HL.png",
        text: "消息",
        styleClass: 'tab-bar-item tab-bar-task'
      },
      {
        pagePath: "/pages/my/my",
        iconPath: "/image/my.png",
        selectedIconPath: "/image/my_HL.png",
        text: "我的",
        styleClass: 'tab-bar-item'
      }
    ],
    middleShow: false
  },
  attached() {},
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      if (url === 'scan') {
        this.setData({
          middleShow: true
        })
        wx.navigateTo({
          url: '/pages/middlePage/middle'
        })
      } else {
        wx.switchTab({
          url
        })
        this.setData({
          selected: data.index
        })
        console.log(this.data.selected)
      }
    },
    getClass(index) {
      return 'tab-bar-item'
    },
    onClose() {
      this.setData({
        middleShow: false
      })
    }
  }

})