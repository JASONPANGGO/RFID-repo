var Promise = require('es6-promise.js')
/**
 * BU01Reader构造
 */
function BU01Reader(connectedDeviceId, serviceId, characteristicId){

  /**
   * 使用微信蓝牙写数据
   */
  var writeBLECharacteristicValue = (buffer) => new Promise((resolve, reject) => {
    wx.writeBLECharacteristicValue({
      deviceId: connectedDeviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: buffer,
      success: resolve,
      fail: reject,
    })
  })

  var writeData = (buffer) => writeBLECharacteristicValue(buffer)
    .then(res => {
      console.log('--> 发送characteristicValue成功')
  }).catch(err => {
    reset()
    return Promise.reject(-101)
  })


  //以下为数据发送与处理

  var analysis
  var dataLength = 0
  var receiveBuffer = ''
  var inventoryResult = []

  var err_head = -1
  var err_tail = -2
  var err_crc = - 3
  var err_reply = -4
  var cmd_finish = 0
  var cmd_partial = 1
  var cmd_record = 2
  var cmd_btn = 3

  /**
   * 发送数据并注册解析
   */
  var send = (cmd) => {
    if(analysis != undefined){
      return Promise.reject(-202)
    }
    //避免无间隔连续发送指令
    analysis = ''
    var cmdBytes = hexStrToBytes(cmd)
    let buffer = new ArrayBuffer(cmdBytes.length)
    let dataView = new DataView(buffer)
    for (let i = 0; i < dataView.byteLength; i++) {
      dataView.setUint8(i, cmdBytes[i])
    }
    console.log('--> ' + cmd)
    var promise = Promise.resolve()
    //安卓系统需要分包(20字节)
    if (getApp().globalData.platform == 'android') {
      for (let i = 0; i < cmdBytes.length; i += 20) {
        promise = promise.then(() => {
          return writeData(buffer.slice(i, i + 20 > cmdBytes.length ? cmdBytes.length : i + 20))
        })
      }
    }
    else if (getApp().globalData.platform == 'ios') {
      promise = promise.then(() => {
        return writeData(buffer)
      })
    }
    else {
      //不知道mac机是否与ios一样
      promise = promise.then(() => {
        return writeData(buffer)
      })
    }
    //注册解析数据包，当onBleCharacteristicValue事件触发时将调用analysis(receive)
    return promise.then(() => new Promise((resolve, reject) => {
      var isFinish = false
      var result = ''
      analysis = (receive) => {
        receiveBuffer += receive
        var ret = parseReply(receiveBuffer)
        if (ret == cmd_record) {
          do {
            var reply = getReply()
            if (reply.cmd == command.GetUII) {
              inventoryResult.push(reply.data)
              result = inventoryResult
              if (reply.kind == cmdUIIFinish) {
                isFinish = true
              }
            } else if (reply.cmd != command.ButtonEvent) {
              if (reply.data.length > 0) {
                if (reply.cmd == command.Error) {
                  switch (reply.data) {
                    case '0E':
                      result = -101
                      break
                    case '1F':
                      result = -205
                      break
                    case '15':
                      if (cmdBytes[2].toString(16) != command.GetUII) {
                        result = -204
                      } else {
                        result = []
                      }
                      break
                    default:
                      result = -204
                      break
                  }
                } else {
                  result = reply.data
                }
              } else {
                result = -303
              }
              isFinish = true
            } else {
              if (reply.data == '01' && btnPressCallback != undefined) {
                btnPressCallback()
              } else if (reply.data == '00' && btnReleaseCallback != undefined) {
                btnReleaseCallback()
              }
            }
            ret = parseReply(receiveBuffer)
          } while(ret == cmd_record);
        }
        if (ret <= 0) {
          var reply = getReply()
          if (reply.cmd == command.GetUII && reply.kind == cmdUIIFinish) {
            inventoryResult.push(reply.data)
            result = inventoryResult
          }
          if (ret < 0) {
            result = -303
          } else if (reply.data.length > 0) {
            if (reply.cmd == command.Error) {
              switch (reply.data) {
                case '0E':
                  result = -101
                  break
                case '1F':
                  result = -205
                  break
                case '15':
                  if (cmdBytes[2].toString(16) != command.GetUII) {
                    result = -204
                  } else {
                    result = []
                  }
                  break
                default:
                  result = -204
                  break
              }
            } else if (reply.cmd != command.GetUII){
              result = reply.data
            }
          } else {
            result = -303
          }
          isFinish = true
          reset()
          if (typeof result === 'number' && result % 1 === 0) {
            return reject(result)
          } else {
            return resolve(result)
          }
        }
        if (ret == cmd_btn) {
          var reply = getReply()
          if (reply.data == '01' && btnPressCallback != undefined) {
            setTimeout(() => {
              btnPressCallback()
            }, 0)
          } else if (reply.data == '00' && btnReleaseCallback != undefined) {
            setTimeout(() => {
              btnReleaseCallback()
            }, 0)
          }
          if (isFinish) {
            reset()
            if (typeof result === 'number' && result % 1 === 0) {
              return reject(result)
            } else {
              return resolve(result)
            }
          }
        }
      }
      setTimeout(() => {
        if (!isFinish) {
          reset()
          return reject(-301)
        }
      }, 2000)
    }))
  }

  var reset = () => {
    analysis = undefined
    inventoryResult = []
    receiveBuffer = ''
  }

  var parseReply = (reply) => {
    if (reply.length < 5 * 2) {
      return cmd_partial
    }
    //byte
    dataLength = parseInt(reply.substr(6, 4), 16)
    if (reply.length < (dataLength + 8) * 2) {
      return cmd_partial
    }
    var record = reply.substr(0, (dataLength + 8) * 2)
    if (record.substr(0, 2) != cmdHead) {
      return err_head
    }
    if (record.substr((dataLength + 5) * 2, 2) != cmdTail) {
      return err_tail
    }
    if (calCRC(record.substr(2, (dataLength + 5) * 2)) != record.slice(-4)) {
      return err_crc
    }
    if (reply.length > (dataLength + 8) * 2) {
      return cmd_record
    }
    if (reply.length == (dataLength + 8) * 2) {
      if (reply.substr(4, 2) == command.GetUII) {
        if (reply.substr(2, 2) == cmdUIIFinish) {
          return cmd_finish
        } else {
          return cmd_record
        }
      } else if (reply.substr(4, 2) == command.ButtonEvent) {
        return cmd_btn
      }
      return cmd_finish
    }
    return err_reply
  }

  var getReply = () => {
    var reply = receiveBuffer.substr(0, (dataLength + 8) * 2)
    receiveBuffer = receiveBuffer.substr((dataLength + 8) * 2)
    return {
      kind: reply.substr(2, 2),
      cmd: reply.substr(4, 2),
      data: reply.substr(10, dataLength * 2),
    }
  }

  //以下为命令相关

  /**
   * 命令包头
   */
  var cmdHead = 'BB'

  /**
   * 命令发送
   */
  var cmdSend = '00'

  /**
   * 命令接收
   */
  var cmdReceive = '01'

  /**
   * UII结束标志
   */
  var cmdUIIFinish = '03'

  /**
   * 命令类型
   */

  var command = {
    GetVersion: '03',
    GetBandArea: '06',
    SetBandArea: '07',
    SelectTag: '0C',
    GetQueryParameters: '0D',
    SetQueryParameters: '0E',
    GetChannel: '11',
    SetChannel: '12',
    GetPower: '15',
    SetPower: '16',
    GetUII: '22',
    ReadTag: '29',
    WriteTag: '46',
    KillTag: '65',
    LockTag: '82',
    GetBattery: 'E2',
    SetBuzzer: 'E3',
    GetTagTemperature: 'E4',
    SetReaderName: 'E5',
    GetBuzzer: 'E6',
    SetLightIndicator: 'E7',
    GetLightIndicator: 'E8',
    SetSerialNumber: 'E9',
    GetSerialNumber: 'EA',
    ButtonEvent: 'EB',
    ControlPA: 'EC',
    Error: 'FF',
  }

  /**
   * 命令包尾
   */
  var cmdTail = '7E'

  /**
   * 生成CRC校验
   */
  var calCRC = (str) => {
    var crc = 0xFFFF
    for (let i = 0; i < str.length / 2; i++) {
      var byte = parseInt(str.substring(i * 2, (i + 1) * 2), 16)
      crc = (crc >> 8 | crc << 8) & 0xFFFF
      crc ^= byte & 0xFF
      crc ^= (crc & 0xFF) >> 4
      crc ^= (crc << 12) & 0xFFFF
      crc ^= ((crc & 0xFF) << 5) & 0xFFFF
    }
    return ('0000' + crc.toString(16).toUpperCase()).slice(-4)
  }

  /**
   * 按下按钮回调
   */
  var btnPressCallback
  /**
   * 松开按钮回调
   */
  var btnReleaseCallback

  /**
   * 命令生成
   */

  var createCmd = (cmdType, data) => {
    data = data || ''
    var dataLengthHex = ('0000' + (data.length / 2).toString(16).toUpperCase()).slice(-4)
    var cmdContent = cmdSend + cmdType + dataLengthHex + data + cmdTail
    return cmdHead + cmdContent + calCRC(cmdContent)
  }

  // 以下为对外蓝牙接口

  /**
   * 蓝牙接收数据监听
   */
  this.monitor = (onBtnPress, onBtnRelease) => {
    btnPressCallback = onBtnPress
    btnReleaseCallback = onBtnRelease
    var cmdBtnPress = 'BB01EB0001017E071B'
    var cmdBtnRelease = 'BB01EB0001007E342A'
    wx.onBLECharacteristicValueChange(characteristic => {
      let buffer = characteristic.value
      let dataView = new DataView(buffer)
      var receive = ''
      console.log('<-- 接收字节长度：' + dataView.byteLength)
      for (let i = 0; i < dataView.byteLength; i++) {
        receive += ('00' + dataView.getUint8(i).toString(16).toUpperCase()).slice(-2)
      }
      console.log('<-- ', receive)
      if (analysis == undefined) {
        if (cmdBtnPress == receive && btnPressCallback != undefined) {
          btnPressCallback()
        } else if (cmdBtnRelease == receive && btnReleaseCallback != undefined) {
          btnReleaseCallback()
        } else {
          console.log('<-- analysis undefined')
        }
      } else if (analysis == '') {
        if (cmdBtnPress == receive && btnPressCallback != undefined) {
          btnPressCallback()
        } else if (cmdBtnRelease == receive && btnReleaseCallback != undefined) {
          btnReleaseCallback()
        } else {
          console.log('<-- 还未设置好数据处理')
        }
      } else {
        analysis(receive)
      }
    })
  }

  /**
   * 获取读写器版本
   */
  this.getReaderVersion = () => send(createCmd(command.GetVersion, jointHexStr('05'))).then(res => {
    return Promise.resolve(hexStrToChar(res))
  })

  /**
   * 获取射频频段
   */
  this.getBandArea = () => send(createCmd(command.GetBandArea))

  /**
   * 设置射频频段
   */
  this.setBandArea = (area) => send(createCmd(command.SetBandArea, jointHexStr(area)))

  /**
   * 获取射频通道，注意返回结果为整数数字
   */
  this.getChannel = () => send(createCmd(command.GetChannel)).then(res => {
    return Promise.resolve(parseInt(res.substr(0, 2), 16))
  })

  /**
   * 设置射频通道，注意参数为整数数字
   * 
   * 读写器关闭电源后，设置的射频通道将复位为跳频模式
   */
  this.setChannel = (channel) => send(createCmd(command.SetChannel, jointHexStr(uint8ToHexStr(channel), '00')))

  /**
   * 获取射频功率，注意返回结果为整数数字
   */
  this.getPower = () => send(createCmd(command.GetPower)).then(res => {
    return Promise.resolve(calPower(res))
  })

  /**
   * 设置射频功率，注意参数为整数数字
   */
  this.setPower = (power) => send(createCmd(command.SetPower, jointHexStr(uint16ToHexStr(power * 10))))

  /**
   * 单次清点
   */
  this.singleInventory = () => send(createCmd(command.GetUII)).then(res => {
    return Promise.resolve(parseUII(res))
  })

  /**
   * 选择标签
   */
  this.selectTag = (epc) => send(createCmd(command.SelectTag, jointHexStr('0100000020', uint8ToHexStr(trimAllSpace(epc).length / 2 * 8), '00', epc)))

  /**
   * 读标签
   */
  this.readTag = (password, epc, bank, address, length) => send(createCmd(command.ReadTag, jointHexStr(handlePwd(password), uint16ToHexStr(trimAllSpace(epc).length / 2), epc, hexStrTo2Digits(bank), hexStrTo4Digits(address), hexStrTo4Digits(length))))

  /**
   * 写标签
   */
  this.writeTag = (password, epc, bank, address, length, data) => send(createCmd(command.WriteTag, jointHexStr(handlePwd(password), uint16ToHexStr(trimAllSpace(epc).length / 2), epc, hexStrTo2Digits(bank), hexStrTo4Digits(address), hexStrTo4Digits(length), trimAllSpace(data))))

  /**
   * 销毁标签
   */
  this.killTag = (password, epc) => send(createCmd(command.KillTag, jointHexStr(handlePwd(password), uint16ToHexStr(trimAllSpace(epc).length / 2), epc)))

  /**
   * 锁标签
   */
  this.lockTag = (password, epc, bank, action) => send(createCmd(command.LockTag, jointHexStr(handlePwd(password), uint16ToHexStr(trimAllSpace(epc).length / 2), epc, hexStrTo2Digits(bank), hexStrTo2Digits(action))))

  /**
   * 获取电量，注意返回结果为整数数字
   */
  this.getBattery = () => send(createCmd((command.GetBattery))).then(res => {
    return Promise.resolve(parseInt(res, 16))
  })

  /**
   * 设置蜂鸣器
   */
  this.setBuzzer = (action) => send(createCmd(command.SetBuzzer, hexStrTo2Digits(action)))

  /**
   * 获取温度标签的温度
   */
  this.getTagTemperature = (password, epc) => send(createCmd(command.GetTagTemperature, jointHexStr(handlePwd(password), uint8ToHexStr(trimAllSpace(epc).length / 2 * 8), epc))).then(res => {
    if(res == '0000'){
      return Promise.reject(-204)
    } else {
      return Promise.resolve(res)
    }
  })

  /**
   * 设置读写器名称
   */
  this.setReaderName = (name) => send(createCmd(command.SetReaderName, strToHexStr(name)))

  /**
   * 获取蜂鸣器状态
   */
  this.getBuzzer = () => send(createCmd(command.GetBuzzer)).then(res => {
    return Promise.resolve(res == '01')
  })

  /**
   * 设置指示灯
   */
  this.setLightIndicator = (leftLight, middleLight, rightLight) => send(createCmd(command.SetLightIndicator, jointHexStr(hexStrTo2Digits(leftLight), hexStrTo2Digits(middleLight), hexStrTo2Digits(rightLight))))

  /**
   * 获取指示灯状态
   */
  this.getLightIndicator = () => send(createCmd(command.GetLightIndicator)).then(res => {
    return Promise.resolve([res.substr(0, 2), res.substr(2, 2), res.substr(4, 2)])
  })

  /**
   * 设置序列号，10进制字符串，范围从0x00000000L-0xFFFFFFFFL
   */
  this.setSerialNumber = (serialNumber) => send(createCmd(command.SetSerialNumber, jointHexStr(handleSerialNumber(serialNumber))))

  /**
   * 获取序列号，10进制字符串
   */
  this.getSerialNumber = () => send(createCmd(command.GetSerialNumber)).then(res => {
    return Promise.resolve(('0000000000' + parseInt(res, 16).toString()).slice(-10))
  })

  /**
   * 设置清点时的查询参数，注意session, target, Q均为整数
   * 
   * 读写器关闭电源后，设置的查询参数将复位为默认值，session:0, target:0, Q:4
   */
  this.setQueryParameters = (session, target, Q) => send(createCmd(command.SetQueryParameters, jointHexStr(handleSession(session), handleTargetAndQ(target, Q))))

  /**
   * 获取清点时的查询参数，注意返回结果的对象成员均为整数数字
   */
  this.getQueryParameters = () => send(createCmd(command.GetQueryParameters)).then(res => {
    var b1 = parseInt(res.substr(0, 2), 16)
    var session = b1 & 0x03
    var b2 = parseInt(res.substr(2, 2), 16)
    var target = (b2 & 0x80) >> 7
    var Q = (b2 & 0x78) >> 3
    return Promise.resolve({
      session: session,
      target: target,
      Q: Q,
    })
  })

  /**
   * 控制PA，成功的返回结果与参数action一致，比如action为'01'，则结果为'01'
   * PA不能长时间开启，在读完标签后需要关闭，PA在开启10秒后或者完成非读标签的其它操作标签的指令时会自动关闭
   */
  this.controlPA = (action) => send(createCmd(command.ControlPA, hexStrTo2Digits(action)))
  
}

/**
 * 计算tag rssi
 */
function calRssi(rssiStr) {
  var tag_rssi = 0.0
  var rssi_i = 0
  var rssi_q = 0
  var gain_i = 0
  var gain_q = 0
  var rfin_i = 0.0
  var rfin_q = 0.0

  rssi_i = parseInt(rssiStr.substr(0, 2), 16) & 0xFF
  rssi_q = parseInt(rssiStr.substr(2, 2), 16) & 0xFF
  gain_i = parseInt(rssiStr.substr(4, 2), 16) & 0xFF
  gain_q = parseInt(rssiStr.substr(6, 2), 16) & 0xFF

  rfin_i = 20 * Math.log10(rssi_i) - gain_i - 33 - 30
  rfin_q = 20 * Math.log10(rssi_q) - gain_q - 33 - 30

  rfin_i = Math.pow(10, rfin_i / 20)
  rfin_q = Math.pow(10, rfin_q / 20)

  tag_rssi = Math.sqrt(Math.pow(rfin_i, 2) + Math.pow(rfin_q, 2))
  tag_rssi = 20 * Math.log10(tag_rssi)
  tag_rssi = tag_rssi.toFixed(1)

  return tag_rssi
}

/**
 * 解析UII
 */
var parseUII = (uiiArr) => {
  var epcs = uiiArr.map((element, index, arr) => {
    element = element || ''
    return {
      pc: element.substring(0, 4),
      epc: element.substring(4, element.length - 8),
      epcWithSpace: element.substring(4, element.length - 8).replace(/(.{8})/g, '$1 '),
      rssi: calRssi(element.substring(element.length - 8))
    }
  })
  return epcs
}

/**
 * 计算功率，hex --> int
 */
var calPower = (hexStr) => {
  var powerStr = hexStr.substr(0, 4)
  return Math.round(parseInt(powerStr, 16) / 10.0)
}

/**
 * 字符串拼接
 */
var jointHexStr = function () {
  var hexStr = ''
  Array.prototype.forEach.call(arguments, (elem, i) => {
    elem = elem || ''
    hexStr += trimAllSpace(elem)
  })
  return hexStr
}

/**
 * 16进制字符串 --> 字符 ASCII
 */
var hexStrToChar = (data) => {
  var converted = ''
  for (let i = 0; i < data.length / 2; i++) {
    converted += String.fromCharCode(parseInt(data.substring(i * 2, (i + 1) * 2), 16))
  }
  return converted
}

/**
 * 字符 --> 16进制字符串
 */
var strToHexStr = (str) => {
  str = str || ''
  var hexStr = ''
  for (let i = 0; i < str.length; i++) {
    hexStr += ('00' + str.codePointAt(i).toString(16)).slice(-2)
  }
  return hexStr
}

/**
 * 16进制字符串 --> byte array
 */
var hexStrToBytes = (str) => {
  str = str || ''
  for (var result = [], c = 0; c < str.length; c += 2) {
    result.push(parseInt(str.substr(c, 2), 16))
  }
  return result
}

/**
 * 8位 --> 16进制字符串
 */
var uint8ToHexStr = (data) => {
  data = data || ''
  return ('00' + data.toString(16).toUpperCase()).slice(-2)
}

/**
 * 16位 --> 16进制字符串
 */
var uint16ToHexStr = (data) => {
  data = data || ''
  return ('0000' + data.toString(16).toUpperCase()).slice(-4)
}

/**
 * 2位16进制字符串补0
 */
var hexStrTo2Digits = (data) => {
  data = data || ''
  return ('00' + data.toUpperCase()).slice(-2)
}

/**
 * 4位16进制字符串补0
 */
var hexStrTo4Digits = (data) => {
  data = data || ''
  return ('0000' + data.toUpperCase()).slice(-4)
}

/**
 * 密码处理
 */
var handlePwd = (pwd) => {
  pwd = trimAllSpace(pwd) || ''
  return ('00000000' + pwd.toUpperCase()).slice(-8)
}

/**
 * 10进制序列号 --> 4字节16进制
 */
var handleSerialNumber = (no) => {
  no = trimAllSpace(no) || ''
  return ('00000000' + Number(no).toString(16).toUpperCase()).slice(-8)
}

/**
 * 去掉字符串中所有的空格
 */
var trimAllSpace = (str) => {
  return str.replace(/ /g, '')
}

/**
 * 每个2个字符插入空格
 */
function insertSpaceEveryTwo (str) {
  return str.replace(/(.{2})/g, '$1 ')
}

/**
 * session处理
 */
var handleSession = (session) => {
  var b = 0xE0
  b = b | session
  return ('00' + b.toString(16).toUpperCase()).slice(-2)
}

/**
 * target、Q处理
 */
var handleTargetAndQ = (target, Q) => {
  var b = 0x00
  b = b | target << 7
  b = b | Q << 3
  return ('00' + b.toString(16).toUpperCase()).slice(-2)
}

module.exports = {
  BU01Reader: BU01Reader,
  insertSpaceEveryTwo: insertSpaceEveryTwo,
  trimAllSpace: trimAllSpace,
}
