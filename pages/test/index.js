import { request } from "../../request/index.js";
const util = require('../../utils/util');

Page({
  data: {
    wordsData: [],  //单词接口数据
    word: '',  //单词title
    audio: '', //单词发音
    meanData: [],  //单词选项意思,
    scores: 0,  //单词得分
    type: '', //词汇量等级
    wordID: '', //单词正确的id
    selectwordID: [], //单词选项的id
    wordid: '', //选中选项的id
    visible: '', //ABCD的显隐
    result: {},
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
    tabs: [  //导航栏选项卡
      {
        id: 0,
        value: "首页",
        isActive: true
      },
      {
        id: 1,
        value: "测试",
        isActive: false
      },
      {
        id: 2,
        value: "结果",
        isActive: false
      },
      {
        id: 3,
        value: "单词数据",
        isActive: false
      }
    ],

    // 单词测试
    nickName: '', //用户名称
    timer: '', //定时器名字
    countDownNum: '40:00', //倒计时初始值
    min: 0,   //答题时间
    src: "",   //题目路径
    flag: 0,   //判断答题是否结束
    count: 0,   //答对题目数量
    value: 0,  //选中选项
    number: 1,   //题号
    percent: 1,  //进度
    url: '#',
    random: [],   //打乱的数组
    // result: [],  //返回数据的结果
    counts: [0, 0, 0, 0, 0, 0, 0],   //分别计算ABCDF五类题目答对的数量
    radioname: ["A", "B", "C", "D", "E", "F"],
    radios: [
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
    ],
    radio: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "F1", "F2", "F3", 'F4', "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
  },

  onLoad(option) {
    //获取等级数据
    this.setData({
      type: option.type
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

  onShow() {
    this.audioCtx = wx.createAudioContext('myAudio')
    this.audioCtx.play()
  },

  //获取单词数据
  async wordsData() {
    // 点击测试，开始测试
    const res = await request({ url: `/words/list/${this.data.type}`, method: "GET" })
    // console.log(res)
    this.setData({
      wordsData: res.data,
      resultData: res.data,
      result: res
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
    console.log(this.data.word)
    console.log(this.data.meanData)
    // console.log(this.data.wordID)
    // console.log(this.data.selectwordID)
    // console.log(this.data.audio)
  },

  //计算答题时间
  // countDown: function () {
  //   var that = this;
  //   var countDownNum = that.data.countDownNum;
  //   var dateList = countDownNum.split(":");
  //   var min = that.data.min;
  //   var m, s;
  //   var time = parseInt((parseInt(dateList[0]) * 60) + parseInt(dateList[1]));
  //   var timer = setInterval(() => {
  //     if (time > 0) {
  //       --time;
  //       min = Math.floor(time / 60 % 60);
  //       s = Math.floor(time % 60);
  //       s = s < 10 ? "0" + s : s
  //       min = min < 10 ? "0" + min : min
  //       this.setData({
  //         countDownNum: min + ":" + s,
  //         min: 40 - min,
  //       });
  //     } else {
  //       console.log('已截止');
  //       clearInterval(timer);
  //       that.setData({
  //         countDownNum: '00:00',
  //         min: 0
  //       })
  //     }
  //   }, 1000);

  // },

  // // 随机算法
  // getRandomArray: function (arr) {
  //   let len = arr.length;
  //   for (let i = 0; i < len; i++) {
  //     let randowIndex = parseInt(Math.random() * (len - i));
  //     let tem = arr[len - i - 1];
  //     arr[len - i - 1] = arr[randowIndex];
  //     arr[randowIndex] = tem;
  //   }
  //   return arr;
  // },

  // 更新题目图片
  getNewsrc: function () {
    var that = this;
    var number = that.data.number;
    var result = that.data.wordsData;
    var arr = result[number - 1];
    var radios = that.data.radios;
    // var src = that.data.src;
    //获取题目路径
    // src = arr.title;
    //先打乱选项顺序，再获取选项路径
    for (var i = 0; i < 4; i++) {
      radios[i].imagesrc = arr.selection[i];
    }
    radios = that.getRandomArray(radios);
    console.log("------------------");
    console.log(radios);
    that.setData({
      radios: radios,
      // src: src,
    })
    console.log("题目图片已更新!")
  },
  //点击下一题
  async buttonEvent(e) {
    var that = this;
    var radios = that.data.radios;
    var flags = 0;

    //如果没有选择答案，弹出提示
    // for (var i = 0; i < 4; i++) {
    //   if (!radios[i].check) {
    //     flags = flags + 1;
    //   }
    // }
    // if (flags == 4) {
    //   wx.showToast({
    //     title: '请选择答案',
    //   })
    //   return;
    // }
    //获取题目及答案
    var number = that.data.number;
    var title = that.data.random[number - 1];
    var count = that.data.count;
    var counts = that.data.counts;
    var value = that.data.value;
    var result = that.data.result;
    var arr = result[number - 1];  //获取题目
    // var answer = parseInt(arr[number].means[0])
    // var answer = parseInt(arr.answer);  //获取题目对应的答案
    // console.log("answer的值为：" + answer);
    // for (var i = 0; i < 4; i++) {   //判断题目答案是否正确
    //   var str = radios[i].imagesrc;
    //   var len = str.length - 5;
    //   if (str.lastIndexOf(answer) == len) {
    //     answer = radios[i].value;
    //     break;
    //   }
    // }
    console.log(that.data.resultData[number - 1].meanss[0].mean)
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
      console.log(that.data.resultData[number - 1])
      //判断是哪一类题目
      // if (title.indexOf("A") >= 0) {
      //   counts[0] = counts[0] + 1;
      //   console.log('A类题目答对' + counts[0] + "道!");
      // } else if (title.indexOf("B") >= 0) {
      //   counts[1] = counts[1] + 1;
      //   console.log('B类题目答对' + counts[1] + "道!");
      // } else if (title.indexOf("C") >= 0) {
      //   counts[2] = counts[2] + 1;
      //   console.log('C类题目答对' + counts[2] + "道!");
      // } else if (title.indexOf("D") >= 0) {
      //   counts[3] = counts[3] + 1;
      //   console.log('D类题目答对' + counts[3] + "道!");
      // }

      // //答对题目数加1
      // count = count + 1;
      // console.log("您答对了" + count + "道题目！");

    } else {
      console.log("您答错了！");
    }
    this.update();
    var flags = that.data.flag;
    //最后一题答完,跳转到结果页面
    if (flags == 1) {
      //停止播放英语音频
      this.audioCtx = wx.createAudioContext('myAudio')
      this.audioCtx.pause()

      console.log("答完了")
      var active = 'tabs[2].isActive'
      var noactive = 'tabs[1].isActive'
      that.setData({
        [active]: true,
        [noactive]: false,
        visible: 'flag'
      })
      var results = that.data.result.data
      // console.log(results)
      // 请求结果接口
      const res = await request({
        url: "/words/result",
        method: "POST",
        data: results
      })
      // console.log(res)
      that.setData({
        scores: res.data.scores
      })
      wx.setStorageSync('scores', that.data.scores);
      console.log(that.data.scores)
      //答完所有题目，跳转至词汇量测试结果页面
      wx.navigateTo({ url: '../index/index' })

      //   // 与页面衔接  触发页面中的方法并传数据
      //   counts[4] = count;
      //   var min = that.data.min;
      //   counts[5] = min;
      //   that.setData({
      //     counts: counts,
      //   })
      //   that.triggerEvent('showTab', that.data.counts);
      //   //答完所有题目，跳转至保密测试结果页面
      //   wx.navigateTo({
      //     url: '../result2/index',
      //     success() {
      //       let dateTime;
      //       const timestamp = Date.parse(new Date());
      //       const date = new Date(timestamp);
      //       //获取年份  
      //       const Y = date.getFullYear();
      //       //获取月份  
      //       const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
      //       //获取当日日期 
      //       const D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      //       //获取时
      //       // const hour = date.getHours()
      //       //获取分
      //       // const minute = date.getMinutes()
      //       that.setData({
      //         dateTime: Y + '年' + M + '月' + D + '日'
      //       })
      //       // 调用云函数examNum添加答题数目到数据库exam表
      //       DB.add({
      //         data: {
      //           countNumber: that.data.count,
      //           date: that.data.dateTime,
      //           min:that.data.min
      //         }, success(res) {
      //           console.log("添加成功", res)
      //         }, fail(err) {
      //           console.log("添加失败", err)
      //         }
      //       })
      //     }
      //   })
    }

    // that.setData({
    //   count: count,
    // })

  },

  //更新页面内容
  update: function () {
    var that = this;
    var number = that.data.number;
    var flag = that.data.flag;
    var percent;
    var url = that.data.url;
    //清空单选框
    var radios = this.data.radios;//选项集合
    radios.forEach(item => {
      item.check = false;
    })
    //判断是不是最后一题，最后一题跳转
    if (number < 5) {
      number = number + 1;
      // this.getPictureData(this.data.random[number - 1]);
      that.setData({
        wordsData: that.data.resultData[number - 1]
      })
      // console.log(that.data.wordsData)

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
      console.log(that.data.word)
      console.log(that.data.meanData)

      url = '#';

      //英语音频
      this.audioCtx = wx.createAudioContext('myAudio')
      this.audioCtx.play()
    } else {
      // var count = app.globalData.count + 1;
      var nowDate = new Date();
      var date = new Date(nowDate);
      var week = date.getDay();
      date = util.dateLater(date, week);
      // console.log("得到count的值：" + count)
      //在这里将count存入数据库
      // util.updateTestNum(db, app.globalData.countId, {
      // count: count,
      // date: date
      // })
      flag = 1;
    }
    // console.log(number);
    //输出结果
    percent = parseInt((number / 5) * 100);
    that.setData({
      number: number,
      percent: percent,
      url: url,
      flag: flag,
      radios: radios,
      value: 0,
    })
    // console.log("update函数成功执行!")
  },

  //实时更新单选框的状态
  radioEvent: function (e) {
    console.log(e);
    var index = e.currentTarget.dataset.index;//获取当前点击的下标
    var wordid = e.currentTarget.dataset.wordid;//获取当前点击的单词id
    var value = this.data.value;
    // console.log(value);
    // console.log(index);
    var radios = this.data.radios;//选项集合
    // console.log(radios);
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
    });
    console.log(this.data.wordid)

    // 直接点击跳转下一题
    setTimeout(() => {
      this.buttonEvent()
      this.setData({
        wordid: -1
      })
    }, 1000)
  },

  //获得答案
  onClick: function (e) {
    var that = this;
    var value = e.detail.value;
    that.setData({
      value: value,
    })
    // console.log("value的值为：" + value);
  },

  // 点击喇叭，播放音频
  audioPlay() {
    this.audioCtx.play()
  }

  // 云服务图片数据
  // getPictureData: function (name) {
  //     let data = this.data.wordsData[0];
  //     data.title = this.data.wordsData.map(item => item.word);
  //     data.options = this.data.wordsData.selection.map(item => item.means);
  //     console.log(data);
  //     let arr = this.data.wordsData;
  //     console.log("123", arr);
  //     arr.push(data);
  //     this.setData({
  //       result: arr,
  //       contents: data.contents
  //     })
  //     this.getNewsrc()
  // },

  // lifetimes: {
  //   attached: function () {
  //     this.countDown();
  //     //先打乱数组
  //     var that = this;
  //     var number = that.data.number;
  //     if (number == 1) {
  //       var radio = that.data.radio;
  //       var random = that.data.random;
  //       //第一题时，打乱代码并保存，随机打乱题型并获取题型
  //       // random = that.getRandomArray(radio);
  //       that.setData({
  //         random: random,
  //       })
  //     }
  //     //获取data里面的random[number-1]，返回result[]
  //     // 云服务图片数据
  //     this.getPictureData(this.data.random[number - 1]);
  //   }
  // },
})