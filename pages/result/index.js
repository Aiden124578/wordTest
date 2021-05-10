Page({
  data: {
    type:1, //测试等级
    scores:'', //词汇量
    rightNum:0, //正确的单词数
    errorNum:0, //答错的单词数
    rightPersent:0, //正确率
    testNum:1 , //测试单词的总数
    errorData:[], //不认识的单词
    errorMeans:[], //不认识单词的词意
    word:'', //答错的单词
    wordMean:'', //答错单词的词意
    number:0, //控制题目的显示和隐藏
    flag:'', //单词淡出效果
    flags:'' //词意淡出效果
  },
  onLoad: function (options) {
    let type = wx.getStorageSync('type');
    let scores = wx.getStorageSync('scores');
    let errorNum = wx.getStorageSync('errorNum');
    let testNum = wx.getStorageSync('testNum');
    let errorData = wx.getStorageSync('errorData');
    let errorMeans = wx.getStorageSync('errorMeans');
    let rightNum = testNum - errorNum
    let rightPersent = parseInt(rightNum / testNum * 100)
    // 从缓存中获取数据
    this.setData({
      type,
      scores,
      errorNum,
      testNum,
      rightNum,
      rightPersent,
      errorData,
      errorMeans
    })
    this.fadeOut()
    setInterval(()=>{
      this.fadeOut()
    },3000)
  },
  fadeOut(){
    if(this.data.number === this.data.errorData.length){
      this.setData({
        number:0
      })
    }
    let number = this.data.number
    let word = this.data.errorData[number]
    let wordMean = this.data.errorMeans[number]
    this.setData({
      word,
      wordMean,
      flag:'fadeout',
      flags:'fadeouts'
    })
    this.data.number = this.data.number + 1
  },
  // 重新测试
  againTest(){
    wx.navigateTo({
      url:`../test/index?type=${this.data.type}`
    })
  },
  //返回首页
  navIndex(){
    wx.redirectTo({
      url:'../index/index'
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
      }
    return {
      title: '英语词汇量测试',
      path: '/pages/index/index', // 路径，传递参数到指定页面。
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }   
})