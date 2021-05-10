import { request } from "../../request/index.js";

Page({
  data: {
    resultData:[], //结果数据
    pageNum:1, //当前页码数
    startIndex:0, //记录下一次请求起始索引
    pageSize:10, //页面条数
  },
  totalPages:1, //总条数

  onLoad(options) {
    // 获取openId
    let openId = wx.getStorageSync('openid');
    this.setData({
      openId
    })
    this.getResultData()
  },

  // 获取结果数据
  async getResultData(){
    const res = await request({
      url:'/words/list/recordList',
      data:{
        openId:this.data.openId,
        startIndex:this.data.startIndex,
        pageSize:this.data.pageSize
      }
    })
    // 获取总条数
    const total = res.data.totalPage
    // 计算总页数
    this.totalPages = Math.ceil(total/this.data.pageSize)
    // 判断等级
    let resultData = res.data.recordList
    if(resultData === null ){
      console.log("没有历史数据")
    }else{
      resultData.forEach(item => {
        if(item.level === 1){
          item.level = '小学'
        }else if(item.level ===2 ){
          item.level = '初中'
        }else if(item.level ===3 ){
          item.level = '高中'
        }else if(item.level ===4 ){
          item.level = '大学'
        }else if(item.level ===5 ){
          item.level = '四级'
        }else{
          item.level = '六级'
        }
      })
      this.setData({
        resultData:[...this.data.resultData,...res.data.recordList]
      })
      console.log(this.data.resultData)
    }
  },

  // 上拉触底
  onReachBottom(){
    if(this.data.pageNum >= this.totalPages){
      wx.showToast({
        title: '没有下一页数据'
      });
    }else{
      this.data.pageNum++
      this.setData({
        startIndex:this.data.resultData.length
      })
      this.getResultData()
    }
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