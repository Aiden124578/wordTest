Page({
  data: {
    errorData:[], //不认识的单词
    errorMeans:[], //不认识单词的词意
    wordData:[]
  },
  onLoad: function (options) {
    // 从缓存中获取数据
    let errorData = wx.getStorageSync('errorData');
    let errorMeans = wx.getStorageSync('errorMeans');
    for(let i=0;i<this.data.errorData.length;i++){
      let wordData = []
      wordData.word[i] = errorData[i]
      wordData.wordmean[i] = errorMeans[i]
      this.setData({
        wordData
      })
    }
    this.setData({
      errorData,
      errorMeans      
    })
    console.log(this.data.errorData)
    console.log(this.data.errorMeans)
    console.log(this.data.wordData)
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