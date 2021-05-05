App({
  onLaunch() {
    // 登录，获取用户的openid
    wx.login({
      success: res => {
        let { code } = res
        wx.request({
          url: `https://www.suhongdh.cn:8081/words/testopenid`,
          data:{code:code},
          success:res=>{
            let openid = res.data
            wx.setStorageSync('openid', openid)
          }
        }); 
      }
    })
  }
})
