// pages/utils-demo/index.js
const util = require('../../utils/common.js')

Page({
  data: {
    // 工具函数测试数据
    testData: {
      isEmpty: {
        value: '',
        result: ''
      },
      deepClone: {
        obj: { a: 1, b: { c: 2 } },
        result: ''
      },
      merge: {
        target: { a: 1, c: 3 },
        source: { b: 2, c: 4 },
        result: ''
      },
      formatDate: {
        date: new Date(),
        format: 'YYYY-MM-DD HH:mm:ss',
        result: ''
      },
      formatNumber: {
        number: 12345.6789,
        decimals: 2,
        addCommas: true,
        result: ''
      },
      random: {
        min: 1,
        max: 100,
        isInteger: true,
        result: ''
      },
      getUrlParam: {
        name: 'id',
        url: 'https://example.com?id=123&name=test',
        result: ''
      },
      buildUrlParams: {
        params: { id: 123, name: 'test' },
        result: ''
      },
      randomString: {
        length: 8,
        chars: '',
        result: ''
      },
      formatFileSize: {
        bytes: 1024 * 1024 * 3.5,
        decimals: 2,
        result: ''
      }
    }
  },

  onLoad() {
    // 预先测试一些函数
    this.testIsEmpty()
    this.testDeepClone()
    this.testFormatDate()
    this.testFormatNumber()
  },
  
  // isEmpty 测试
  testIsEmpty(e) {
    const value = e ? e.detail.value : this.data.testData.isEmpty.value
    const result = util.isEmpty(value)
    
    this.setData({
      'testData.isEmpty.value': value,
      'testData.isEmpty.result': result.toString()
    })
  },
  
  // deepClone 测试
  testDeepClone() {
    const obj = this.data.testData.deepClone.obj
    const cloned = util.deepClone(obj)
    // 修改原对象验证是否影响克隆对象
    obj.b.c = 999
    
    this.setData({
      'testData.deepClone.result': JSON.stringify(cloned)
    })
  },
  
  // merge 测试
  testMerge() {
    const target = util.deepClone(this.data.testData.merge.target)
    const source = this.data.testData.merge.source
    const result = util.merge(target, source)
    
    this.setData({
      'testData.merge.result': JSON.stringify(result)
    })
  },
  
  // formatDate 测试
  testFormatDate(e) {
    const format = e ? e.detail.value : this.data.testData.formatDate.format
    const date = this.data.testData.formatDate.date
    const result = util.formatDate(date, format)
    
    this.setData({
      'testData.formatDate.format': format,
      'testData.formatDate.result': result
    })
  },
  
  // formatNumber 测试
  testFormatNumber() {
    const { number, decimals, addCommas } = this.data.testData.formatNumber
    const result = util.formatNumber(number, decimals, addCommas)
    
    this.setData({
      'testData.formatNumber.result': result
    })
  },
  
  // 修改formatNumber的decimals
  onDecimalsChange(e) {
    const decimals = parseInt(e.detail.value)
    const { number, addCommas } = this.data.testData.formatNumber
    const result = util.formatNumber(number, decimals, addCommas)
    
    this.setData({
      'testData.formatNumber.decimals': decimals,
      'testData.formatNumber.result': result
    })
  },
  
  // 切换formatNumber的addCommas
  toggleAddCommas() {
    const { number, decimals, addCommas } = this.data.testData.formatNumber
    const newAddCommas = !addCommas
    const result = util.formatNumber(number, decimals, newAddCommas)
    
    this.setData({
      'testData.formatNumber.addCommas': newAddCommas,
      'testData.formatNumber.result': result
    })
  },
  
  // random 测试
  testRandom() {
    const { min, max, isInteger } = this.data.testData.random
    const result = util.random(min, max, isInteger)
    
    this.setData({
      'testData.random.result': result.toString()
    })
  },
  
  // 修改random的min
  onMinChange(e) {
    this.setData({
      'testData.random.min': parseInt(e.detail.value)
    })
  },
  
  // 修改random的max
  onMaxChange(e) {
    this.setData({
      'testData.random.max': parseInt(e.detail.value)
    })
  },
  
  // 切换random的isInteger
  toggleIsInteger() {
    this.setData({
      'testData.random.isInteger': !this.data.testData.random.isInteger
    })
  },
  
  // getUrlParam 测试
  testGetUrlParam() {
    const { name, url } = this.data.testData.getUrlParam
    const result = util.getUrlParam(name, url)
    
    this.setData({
      'testData.getUrlParam.result': result || '未找到参数'
    })
  },
  
  // 修改getUrlParam的name
  onParamNameChange(e) {
    this.setData({
      'testData.getUrlParam.name': e.detail.value
    })
  },
  
  // buildUrlParams 测试
  testBuildUrlParams() {
    const params = this.data.testData.buildUrlParams.params
    const result = util.buildUrlParams(params)
    
    this.setData({
      'testData.buildUrlParams.result': result
    })
  },
  
  // randomString 测试
  testRandomString() {
    const { length, chars } = this.data.testData.randomString
    const result = util.randomString(length, chars)
    
    this.setData({
      'testData.randomString.result': result
    })
  },
  
  // 修改randomString的length
  onLengthChange(e) {
    this.setData({
      'testData.randomString.length': parseInt(e.detail.value)
    })
  },
  
  // formatFileSize 测试
  testFormatFileSize() {
    const { bytes, decimals } = this.data.testData.formatFileSize
    const result = util.formatFileSize(bytes, decimals)
    
    this.setData({
      'testData.formatFileSize.result': result
    })
  },
  
  // debounce测试
  testDebounce() {
    const debouncedFunc = util.debounce(() => {
      wx.showToast({
        title: '防抖函数执行',
        icon: 'none'
      })
    }, 1000)
    
    // 连续调用，只会在最后一次调用后1秒执行
    debouncedFunc()
    debouncedFunc()
    debouncedFunc()
  },
  
  // throttle测试
  testThrottle() {
    const throttledFunc = util.throttle(() => {
      wx.showToast({
        title: '节流函数执行',
        icon: 'none'
      })
    }, 1000)
    
    // 每秒最多执行一次
    throttledFunc()
    
    setTimeout(() => {
      throttledFunc()
    }, 500)
    
    setTimeout(() => {
      throttledFunc()
    }, 1200)
  }
})