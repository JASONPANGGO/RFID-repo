var Promise = require('es6-promise.js')
function BU01BleUtil(bleParams){
  var serviceId
  var characteristicId
  
  /**
   * 以下为微信蓝牙
   */

  var openBluetoothAdapter = () => new Promise((resolve, reject) =>{
    wx.openBluetoothAdapter({
      success: resolve,
      fail: reject,
    })
  })

  var closeBluetoothAdapter = () => new Promise((resolve, reject) =>{
    wx.closeBluetoothAdapter({
      success: resolve,
      fail: reject,
    })
  })

  var startBluetoothDevicesDiscovery = () => new Promise((resolve,reject)=>{
    wx.startBluetoothDevicesDiscovery({
      services: ['FFB0'],
      success: resolve,
      fail: reject,
    })
  })

  var stopBluetoothDevicesDiscovery = () => new Promise((resolve,reject) => {
    wx.stopBluetoothDevicesDiscovery({
      success: resolve,
      fail: reject,
    })
  })

  var createBLEConnection = (id) => new Promise((resolve, reject) => {
    wx.createBLEConnection({
      deviceId: id,
      success: resolve,
      fail: reject,
    })
  })

  var getBLEDeviceServices = (connectedDeviceId) => new Promise((resolve, reject) =>{
    wx.getBLEDeviceServices({
      deviceId: connectedDeviceId,
      success: resolve,
      fail: reject,
    })
  })

  var getBLEDeviceCharacteristics = (connectedDeviceId, serviceId) => new Promise((resolve, reject) => {
    wx.getBLEDeviceCharacteristics({
      deviceId: connectedDeviceId,
      serviceId: serviceId,
      success: resolve,
      fail: reject,
    })
  })

  var notifyBLECharacteristicValueChange = (connectedDeviceId, serviceId, characteristicId) => new Promise((resolve,reject) => {
    wx.notifyBLECharacteristicValueChange({
      deviceId: connectedDeviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      state: true,
      success: resolve,
      fail: reject,
    })
  })

  var closeBLEConnection = (connectedDeviceId) => new Promise((resolve, reject) => {
    wx.closeBLEConnection({
      deviceId: connectedDeviceId,
      success: resolve,
      fail: reject,
    })
  })

  /**
   * 以下为对外蓝牙接口
   */

  /**
   * 初始化蓝牙
   */
  this.iniBle = () => openBluetoothAdapter()
    .then(res => {
      console.log('蓝牙初始化成功', JSON.stringify(res))   
    })
  /**
   * 关闭蓝牙
   */
  this.closeBle = () => closeBluetoothAdapter()
    .then(res => {
      console.log('关闭蓝牙成功', JSON.stringify(res))
    })
  /**
   * 开始搜索蓝牙
   */
  this.start = () => startBluetoothDevicesDiscovery()
    .then(res => {
      console.log('开始搜索', JSON.stringify(res))
    })
  /**
   * 停止搜索蓝牙
   */
  this.stop = () => stopBluetoothDevicesDiscovery()
    .then(res =>{
      console.log('停止搜索', JSON.stringify(res))
    })

  /**
   * 蓝牙连接
   */
  this.connect = (selectedId) => createBLEConnection(selectedId)
    .then(res => {
      console.log('连接成功', JSON.stringify(res))
      bleParams.connectedDeviceId = selectedId
      return getBLEDeviceServices(selectedId)
    })
    .then(res => {
      console.log('获取蓝牙服务成功', JSON.stringify(res))   
      var serviceIds = JSON.stringify(res.services).match(new RegExp(/0{4}(FFB0|ffb0)[0-9a-fA-F\-]+/))
      if (serviceIds == null) {
        return Promise.reject('找不到对应服务10004')
      }
      console.log('serviceId:', serviceIds[0])
      serviceId = serviceIds[0]
      bleParams.serviceId = serviceId
      return getBLEDeviceCharacteristics(selectedId, serviceId)
    })
    .then(res => {
      console.log('获取特征值成功', JSON.stringify(res.characteristics))
      var characteristics = JSON.stringify(res.characteristics).match(new RegExp(/0{4}(FFB2|ffb2)[0-9a-fA-F\-]+/))
      if(characteristics == null){
        return Promise.reject('找不到特征值10005')
      }
      console.log(characteristics[0])
      characteristicId = characteristics[0]
      bleParams.characteristicId = characteristicId
      return notifyBLECharacteristicValueChange(selectedId, serviceId, characteristicId)
    })
    .then(res => {
      console.log('启用notify功能成功', JSON.stringify(res.errMsg))   
    })

  /**
   * 断开蓝牙连接
   */
  this.disconnect = (connectedDeviceId) => closeBLEConnection(connectedDeviceId)
    .then(res => {
      console.log('断开连接成功', res)
    })
    .catch(res => {
      console.log('断开连接失败', res)
    })

  /**
   * 发现蓝牙设备回调
   */
  this.onBluetoothDeviceFound = (callback) => {
    wx.onBluetoothDeviceFound(res => {
      callback(res)
    })
  }

  /**
   * 蓝牙状态改变回调
   */
  this.onBluetoothAdapterStateChange = (callback) => {
    wx.onBluetoothAdapterStateChange(res => {
      callback(res)
    })
  }
}
module.exports = {
  BU01BleUtil: BU01BleUtil,
}