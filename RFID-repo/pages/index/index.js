// pages/index/index.js
import * as echarts from '../../lib/ec-canvas/echarts';
import Dialog from '../../lib/vant-weapp/dist/dialog/dialog';
import Toast from '../../lib/vant-weapp/dist/toast/toast';
const app = getApp()
const {
  request
} = require('../../utils/promisefy.js')
const config = require('../../config.js')

const chartsColor = ["#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F", "#a0d911", "#d3f261", "#13c2c2", "#9254de"]

function initPieChart(canvas, width, height, data) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {
    backgroundColor: "#ffffff",
    color: chartsColor,
    series: [{
      label: {
        normal: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'item'
      },
      type: 'pie',
      center: ['50%', '50%'],
      radius: [0, '80%'],
      data: data,
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 2, 2, 0.3)'
        }
      }
    }]
  };

  chart.setOption(option);
  return chart;
}


function initLineChart(canvas, width, height, data) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {
    title: {
      text: '',
      left: 'center'
    },
    color: chartsColor,
    legend: {
      // data: ['A', 'B', 'C'],
      data: data.data.map(d => d.name),
      top: 10,
      left: 'center',
      backgroundColor: '#eee',
      z: 100
    },
    grid: {
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xAxis,
      // show: false
    },
    yAxis: {
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
      // show: false
    },
    // series: [{
    //   name: 'A',
    //   type: 'line',
    //   smooth: true,
    //   data: [18, 36, 65, 30, 78, 40, 33]
    // }, {
    //   name: 'B',
    //   type: 'line',
    //   smooth: true,
    //   data: [12, 50, 51, 35, 70, 30, 20]
    // }, {
    //   name: 'C',
    //   type: 'line',
    //   smooth: true,
    //   data: [10, 30, 31, 50, 40, 20, 10]
    // }],
    series: data.data
  };

  chart.setOption(option);
  return chart;
}


function initBarChart(canvas, width, height, data) {
  let chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {
    color: chartsColor,
    tooltip: {
      trigger: 'axis',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      },
      confine: true
    },
    legend: {
      data: ['库存', '入库总量', '出库总量']
    },
    grid: {
      left: 20,
      right: 20,
      bottom: 15,
      top: 40,
      containLabel: true
    },
    xAxis: [{
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#666'
      }
    }],
    yAxis: [{
      type: 'category',
      axisTick: {
        show: false
      },
      data: data.map(d => d.name),
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#666'
      }
    }],
    series: [{
        name: '库存',
        type: 'bar',
        label: {
          normal: {
            show: true,
            position: 'inside'
          }
        },
        data: data.map(d => d.amount),
        itemStyle: {
          emphasis: {
            color: '#37a2da'
          }
        }
      },
      {
        name: '入库总量',
        type: 'bar',
        stack: '总量',
        label: {
          normal: {
            show: true
          }
        },
        data: data.map(d => d.inData),
        itemStyle: {
          emphasis: {
            color: '#32c5e9'
          }
        }
      },
      {
        name: '出库总量',
        type: 'bar',
        stack: '总量',
        label: {
          normal: {
            show: true,
            position: 'left'
          }
        },
        data: data.map(d => d.outData),
        itemStyle: {
          emphasis: {
            color: '#67e0e3'
          }
        }
      }
    ]
  };

  chart.setOption(option);
  return chart;
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    instance: {},
    repo: {},
    ecPie: {},
    ecLine: {},
    ecBar: {},
    dataReady: false,
    pieData: [],
    lineData: {},
    barData: [],
    greet: '晚上好~'
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
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }

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
  echartInitPie(e) {
    initPieChart(e.detail.canvas, e.detail.width, e.detail.height, this.data.pieData);
  },
  echartInitLine(e) {
    initLineChart(e.detail.canvas, e.detail.width, e.detail.height, this.data.lineData);
  },
  echartInitBar(e) {
    initBarChart(e.detail.canvas, e.detail.width, e.detail.height, this.data.barData);
  },
  initData() {
    Toast.loading({
      mask: false,
      message: '加载中...'
    })
    const hours = new Date().getHours()
    let greet = '晚上好~'
    if (hours > 0 && hours < 6) {
      greet = '注意休息~'
    }
    if (hours > 6 && hours < 12) {
      greet = '上午好~'
    }
    if (hours > 12 && hours < 18) {
      greet = '下午好~'
    }
    this.setData({
      dataReady: false,
      greet: greet
    })
    const user = wx.getStorageSync('user')
    const query = {}
    if (user.character === 1) {
      query.instanceid = user.instanceid
    } else {
      query.repoid = user.repoid
    }
    this.getTaskGoodsRepo(query)
    this.getInstance(user.instanceid)
    this.setData({
      user: user
    })
  },
  getTaskGoodsRepo(query) {
    request({
      url: app.service.task.get,
      data: query,
      method: 'get'
    }).then(res => {
      console.log(res)
      if (res.statusCode === 200) {
        let {
          goodsData,
          repoData,
          taskData,
          userData
        } = res.data

        // 折线图
        const lineData = {
          data: [],
          xAxis: []
        }

        taskData = taskData.filter(t => t.type !== 2).sort((a, b) => b.create_time - a.create_time)
        const latestTask = taskData.find(t => t.status === 0)
        const noticeText = `[新任务]${latestTask.name} 任务类型：${config.task[latestTask.type].name} 商品：${goodsData.find(g => g.id === latestTask.goodsid).name} 数量：${latestTask.amount}`
        const barDataType = ['outData', 'inData']
        // 条形图
        const barData = goodsData.map(g => {
          g.inData = 0
          g.outData = 0
          return g
        })

        // const dataAmount = taskData.length
        taskData.forEach((t, i) => {
          const goodsName = goodsData.find(g => g.id === t.goodsid).name
          const goodsAmount = goodsData.find(g => g.id === t.goodsid).amount

          // 条形图数据格式化
          const barDataIndex = barData.findIndex(b => b.id === t.goodsid)
          barData[barDataIndex][barDataType[t.type]] += t.amount

          // 折线图数据格式化
          // 未有该任务类型的该商品
          const date = new Date(t.create_time)
          const date_text = `${date.getMonth() + 1}/${date.getDate()}`
          t.name = `${goodsName} - ${config.task[t.type].name.substr(2, 2)}` //最后两个字
          t.taskType = t.type
          t.smooth = 'true'
          const lineDataIndex = lineData.data.findIndex(e => (e.goodsid === t.goodsid && t.taskType === e.taskType))
          const xAxisIndex = lineData.xAxis.indexOf(date_text)
          if (t.type === 0) {
            t.amount = -t.amount
          }
          if (xAxisIndex < 0) {
            lineData.xAxis.push(date_text)
            for (let i = 0; i < lineData.data.length; i++) {
              lineData.data[i].data.push(0)
            }
            if (lineDataIndex < 0) {
              t.data = Array.apply(null, Array(lineData.xAxis.length)).map(() => 0)

              t.data[lineData.xAxis.length - 1] = t.amount
              lineData.data.push(t)
            } else {
              for (let i = 0; i < lineData.data.length; i++) {
                lineData.data[i].data.push(0)
              }
              lineData.data[lineDataIndex].data[lineData.xAxis.length - 1] = t.amount
            }
          } else {

            if (lineDataIndex < 0) {
              t.data = [t.amount]
              lineData.data.push(t)

            } else {
              lineData.data[lineDataIndex].data[xAxisIndex] += t.amount
            }
          }


        })
        lineData.data = lineData.data.map(l => {
          l.type = 'line'
          return l
        })

        this.setData({
          // 饼图数据格式化
          pieData: goodsData.map(g => {
            g.value = g.amount
            return g
          }),
          lineData: lineData,
          barData: barData,
          repo: repoData[0],
          noticeText: noticeText,
          dataReady: true
        })
        Toast.clear()

      }
    })
  },
  getInstance(instanceid) {
    request({
      url: app.service.instance.get,
      data: {
        instanceid: instanceid
      },
      method: 'get'
    }).then(res => {
      console.log(res)
      this.setData({
        instance: res.data.instanceData
      })
    })
  }
})