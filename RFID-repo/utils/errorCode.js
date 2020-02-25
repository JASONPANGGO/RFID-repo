function ErrorCode(){
  var code = {
    //蓝牙设备错误码
    '0': '操作成功',
    '-101': '无效参数',
    '-201': '设备尚未打开',
    '-202': '设备繁忙：设备正在处于操作中',
    '-203': '设备报错：解析正确，FE开头',
    '-204': '设备失败：解析正确，回复操作失败',
    '-205': '电量不足：解析正确，提示电量不足',
    '-301': '通信超时：没回复',
    '-302': '通信异常：解析正确，格式出错（例如应该回复应答包，却回复数据包）',
    '-303': '通信失败：解析不正确',
    //微信蓝牙错误码
    '10000': '未初始化蓝牙适配器',
    '10001': '当前蓝牙适配器不可用，请检查手机蓝牙是否打开',
    '10002': '没有找到指定设备',
    '10003': '连接失败，请重新搜索再连接',
    '10004': '没有找到指定服务',
    '10005': '没有找到指定特征值',
    '10006': '当前连接已断开',
    '10007': '当前特征值不支持此操作',
    '10008': '蓝牙连接已断开，请重新连接',
    '10009': 'Android 系统版本低于 4.3 不支持BLE',
    '10010': '没有找到指定描述符',
    '10011': '未打开定位导致搜寻失败',
    '10012': '蓝牙操作超时',
  }

  this.getErrorMsg = function (title, errMsg){
    var errCode = [] 
    errCode = JSON.stringify(errMsg).match(new RegExp(/(100[0-9]{2})|(-[0-9]{3})/))
    //100xx或-x
    if(errCode.length > 0){
      if(errCode[0] == '10003' || errCode[0] == '10008'){
        wx.showModal({
          title: title,
          content: '当前蓝牙连接已断开',
          showCancel: false,
          confirmText: '重新连接',
          success: function (res) {
            if (res.confirm && getCurrentPages().length > 1) {
              var pages = getCurrentPages()
              wx.navigateBack({
                delta: pages.length - 1
              })
            }
          }
        })
      } else if (errCode[0] == '-205') {
        wx.showModal({
          title: title,
          content: '请及时充电',
          showCancel: false,
          confirmText: '确定'
        })
      } else{
        wx.showModal({
          title: title,
          content: code[errCode[0]] == null ? '未知错误码' + errCode[0] : code[errCode[0]],
          showCancel: false,
          confirmText: '确定'
        })
      }    
    }
    else{
      wx.showModal({
        title: title,
        content: '未知错误',
        showCancel: false,
        confirmText: '确定'
      })
    }
  }
}
module.exports = {
  ErrorCode: ErrorCode
}