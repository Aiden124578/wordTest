import { request } from "../../request/index.js";

Page({
  data: {
    resultData:{} //结果数据
  },
  onLoad: function (options) {
    // 从缓存中获取数据
    let resultData = wx.getStorageSync('results');
    // console.log(resultData)
    this.setData({
      resultData
    })
    this.getReslutData()
  },
  //获取错误单词的数据
  async getReslutData(){
    let results = this.data.resultData
    const res = await request({
      url: "/words/errorWords",
      method: "POST",
      data: results
    })
    let errorData=wx.getStorageSync('errorData')
    let errorMeans=wx.getStorageSync('errorMeans')
    let resultData=errorData.map((item,index)=>{
      return {item,data:errorMeans[index]}
    })
    this.setData({
      resultData
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