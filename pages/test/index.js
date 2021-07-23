import { request } from "../../request/index.js";

Page({
  data: {
    wordsData: [],  //单词接口数据
    word: '',  //单词title
    audio: '', //单词发音
    meanData: [],  //单词选项意思,
    scores: 0,  //单词得分
    type: 1, //词汇量等级
    wordID: '', //单词正确的id
    selectwordID: [], //单词选项的id
    wordid: '', //选中选项的id
    visible: '', //ABCD的显隐
    value: 0,  //选中选项
    flag: 0,   //判断答题是否结束
    percent: 0,  //进度
    testNum:1, // 测试总题数
    number: 1,   //题号
    radioname: ["A", "B", "C", "D"], //选项
    disabled:false, //控制按钮的点击
    errorNum:0, //答错题数
    errorData:[], //不认识的单词
    errorMeans:[], //不认识单词的词意
    result: {},
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
    radios: [  //选项集合
      {
        value: 1,
        imagesrc: "",
        check: false
      },
      {
        value: 2,
        imagesrc: "",
        check: false
      },
      {
        value: 3,
        imagesrc: "",
        check: false
      },
      {
        value: 4,
        imagesrc: "",
        check: false
      }
    ]
  },

  onLoad(option) {
    // 获取openid
    let openId = wx.getStorageSync('openid');
    //获取等级数据
    this.setData({
      type: parseInt(option.type),
      openId
    })
    // 获取用户的信息
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    //获取单词数据
    this.wordsData()
  },

  // 播放音频
  onShow() {
    this.audioCtx = wx.createAudioContext('myAudio')
    this.audioCtx.play()
  },

  //获取单词数据
  async wordsData() {
    // 点击测试，开始测试
    const res = await request({ url: `/words/list/${this.data.type}`,data:{openId:this.data.openId}, method: "GET" })
    this.setData({
      wordsData: res.data.wordsList,
      resultData: res.data.wordsList,
      result: res,
      testNum:res.data.wordsList.length
    })
    console.log(this.data.wordsData)
    let word = this.data.wordsData[this.data.number - 1].word
    let audio = JSON.parse(this.data.wordsData[this.data.number - 1].voice).ph_tts_mp3
    let meanData = this.data.wordsData[this.data.number - 1].selection
    let wordID = this.data.wordsData[this.data.number - 1].meanss[0].wordId
    let selectwordID = this.data.wordsData[this.data.number - 1].selection.map(item => item.wordId)
    this.setData({
      word,
      meanData,
      audio,
      wordID,
      selectwordID
    })
    // console.log(this.data.word)
    // console.log(this.data.meanData)
  },

  //点击下一题
  async buttonEvent(e) {
    var that = this;
    var flags = 0;
    //获取题目及答案
    var number = that.data.number;
    var value = that.data.value;
    // console.log(that.data.resultData[number - 1].meanss[0].mean)
    if (value == 1) {
      value = that.data.resultData[number - 1].selection[0].mean
    }
    if (value == 2) {
      value = that.data.resultData[number - 1].selection[1].mean
    }
    if (value == 3) {
      value = that.data.resultData[number - 1].selection[2].mean
    }
    if (value == 4) {
      value = that.data.resultData[number - 1].selection[3].mean
    }
    if (value == that.data.resultData[number - 1].meanss[0].mean) {
      that.data.resultData[number - 1].flag = true
      // console.log(that.data.resultData[number - 1])
      console.log(that.data.resultData[number - 1].score)
    } else {
      let errorData = []
      let errorMeans = []
      errorData[errorData.length] = that.data.resultData[that.data.number - 1].word
      errorMeans[errorMeans.length] = that.data.resultData[that.data.number - 1].meanss[0].mean
      that.setData({
        errorMeans:[...that.data.errorMeans,...errorMeans],
        errorData:[...that.data.errorData,...errorData],
        errorNum:that.data.errorNum + 1
      })
      console.log("您答错了,答错了" + that.data.errorNum + "道题！");
    }
    this.update();
    var flags = that.data.flag;
    //最后一题答完,跳转到结果页面
    if (flags == 1) {
      //停止播放英语音频
      this.audioCtx = wx.createAudioContext('myAudio')
      this.audioCtx.pause()
      that.setData({
        visible: 'flag'
      })
      const results = that.data.result.data
      // 请求结果接口
      const res = await request({
        url: "/words/result",
        method: "POST",
        data: results
      })
      that.setData({
        scores: res.data.scores
      })
      // 获取当前测试时间
      let date = new Date()
      let y = date.getFullYear()
      let m = date.getMonth()+1
      m = m < 10 ? '0' + m : m
      let d = date.getDate()
      d = d < 10 ? '0' + d : d
      let newDate = y + '年' + m + '月' + d + '日'
      // 将测试结果和时间存入缓存
      wx.setStorageSync('scores', that.data.scores); //最后得分单词词汇量
      wx.setStorageSync('newDate', newDate);  //测试时间
      // 将测试完的结果返回给结果页
      wx.setStorageSync('errorNum', that.data.errorNum);  //答错题数
      wx.setStorageSync('testNum', that.data.testNum);  //测试总题数
      wx.setStorageSync('errorData', that.data.errorData);  //不认识的单词
      wx.setStorageSync('errorMeans', that.data.errorMeans);  //不认识单词的词意
      wx.setStorageSync('type', that.data.type);  //词汇量等级
      wx.setStorageSync('results', results);  //结果数据
      //答完所有题目，跳转至词汇量测试结果页面
      wx.redirectTo({ url: '../result/index' })
    }
  },

  //更新页面内容
  update: function () {
    var that = this;
    var number = that.data.number;
    var flag = that.data.flag;
    var percent;
    //清空单选框
    var radios = this.data.radios;//选项集合
    radios.forEach(item => {
      item.check = false;
    })
    //判断是不是最后一题，最后一题跳转
    if (number < that.data.testNum) {
      number = number + 1;
      that.setData({
        wordsData: that.data.resultData[number - 1],
        disabled:false
      })
      let word = that.data.wordsData.word
      let meanData = that.data.wordsData.selection
      let audio = JSON.parse(that.data.wordsData.voice).ph_tts_mp3
      let wordID = this.data.wordsData.meanss[0].wordId
      let selectwordID = this.data.wordsData.selection.map(item => item.wordId)
      that.setData({
        word,
        meanData,
        audio,
        wordID,
        selectwordID
      })
      // console.log(that.data.word)
      // console.log(that.data.meanData)

      //英语音频
      this.audioCtx = wx.createAudioContext('myAudio')
      this.audioCtx.play()
    } else {
      flag = 1;
    }
    //输出结果
    percent = parseInt((number / that.data.testNum) * 100);
    that.setData({
      number: number,
      percent: percent,
      flag: flag,
      radios: radios,
      value: 0,
    })
  },

  //实时更新单选框的状态
  radioEvent: function (e) {
    var index = e.currentTarget.dataset.index;//获取当前点击的下标
    var wordid = e.currentTarget.dataset.wordid;//获取当前点击的单词id
    var value = this.data.value;
    var radios = this.data.radios;//选项集合
    if (radios[index].check) return;//如果点击的当前已选中则返回
    radios.forEach(item => {
      item.check = false;
    })
    radios[index].check = true;//改变当前选中的checked值
    this.setData({
      radios: radios,
      value: value,
      wordid,
      visible: 'flag',
      disabled:true
    });
    // console.log(this.data.wordid)

    // 直接点击跳转下一题
    setTimeout(() => {  
      this.buttonEvent()
      this.setData({
        wordid: -1
      })
    }, 500)
  },

  //获得答案
  onClick: function (e) {
    var that = this;
    var value = e.detail.value;
    that.setData({
      value: value,
    })
  },

  // 点击喇叭，播放音频
  audioPlay() {
    this.audioCtx.play()
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