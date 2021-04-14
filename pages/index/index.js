import { request } from "../../request/index.js";

// 获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    index:1, //默认选中的等级
    score:''
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    // 判断用户是否授权
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    //下拉窗口背景色
    wx.setBackgroundColor({
      backgroundColor: '#fff',
      backgroundColorTop: '#d8e4f4',
      backgroundColorBottom: '#fff'
    });
    // 从缓存中获取测试分数
    let scores = wx.getStorageSync('scores');
    this.setData({
      scores
    })
  },

  //获取用户信息
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  // 点击等级更换颜色
  handleClickChange(e) {
    // console.log(e)
    var { index } = e.currentTarget.dataset;
    this.setData({
      index
    })
  },

  // 开始测试
  startTest(){
    wx.navigateTo({
      url:`../test/index?type=${this.data.index}`
    })
  },

})
