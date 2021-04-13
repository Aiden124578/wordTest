const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//传入一个日期类型，返回过去最近的一个周日日期
const getSunday = date => {

}

//获取当前日期
const formatDate = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].map(formatNumber).join('/');
}

//获得过去一个星期的时间
function getDates(date) {
  let dateObj = {};
  dateObj.count = 0;     //这里从数据库获取当前星期已经答题的次数

}

/**
 * 数据库操作
 */
// 提交评论
function submitComment(database, dataObj, callback, errObj) {
  if (errObj) {
    database.collection('user').add({ data: errObj }).then(res => {
      console.log("评论用户数据更新！")
    })
  }
  database.collection('comments').add({ data: dataObj }).then(res => {
    console.log("提交评论成功！")
    callback(res._id)
  })
}

// 提交回复
function submitreply(database, id, obj, errObj) {
  if (errObj) {
    database.collection('user').add({ data: errObj }).then(res => {
      console.log("评论用户数据更新！")
    })
  }
  wx.cloud.callFunction({
    name: 'updatesubcomment',
    data: {
      userid: id,
      message: obj
    },
    success: (res) => {
      console.log(res);
    },
    fail: (e) => {
      console.log(e)
    }
  })
}

// 查询用户是否评论过
function hasComment(database, openid, callback) {
  database.collection('user').where({
    openid: openid,
    hascomment: true
  }).get().then(res => {
    res.data[0] ? callback(res.data[0].userid) : callback('');
  })
}

// 检查用户是否点赞过该评论
function checkThumb(database, id, callback) {
  database.collection('thumbud').where({
    userid: id
  }).get().then(res => {
    callback(res.data)
  })
}

// 添加评论点赞
function addThumb(database, dataObj, num) {
  database.collection('thumbud').add({ data: dataObj }).then(res => {
    console.log('添加用户点赞成功！！')
  })
  updateThumb(dataObj.userid, num)
}

// 更新评论点赞
function updateThumb(id, num) {
  wx.cloud.callFunction({
    name: 'thumb',
    data: {
      'thumbNum': num,
      'id': id
    },
    success: res => {
      console.log(res)
    },
    fail: err => {
      console.log(err)
    }
  })
}

// 更新点赞状态
function updateThumbStatus(id, status, num) {
  wx.cloud.callFunction({
    name: 'updatethumbstatus',
    data: {
      id: id,
      isthumb: status
    },
    success: res => {
      console.log('更新点赞状态成功！')
      updateThumb(id, num)
    },
    fail: err => console.log(err)
  })
}

// 更新回复点赞
function updateThumbNum(database, id, date, isthumb, obj) {
  wx.cloud.callFunction({
    name: 'updatethumbnum',
    data: {
      id: id,
      date: date
    },
    success: res => {
      submitreply(database, id, obj)
      updateSubThumb(id, date, isthumb)
    },
    fail: err => console.log(err)
  })
}

// 更新用户点赞记录
function updateSubThumb(id, date, isthumb) {
  wx.cloud.callFunction({
    name: 'updatesubthumb',
    data: {
      id: id,
      date: date,
      isthumb: isthumb
    },
    success: res => console.log(res),
    fail: err => console.log(err)
  })
}

// 加载评论数据
function loadComments(database, begin, callback) {
  database.collection('comments').skip(begin).limit(10).orderBy('date', 'desc').get().then(res => {
    console.log(res.data)
    console.log("加载数据成功！！！")
    getAllThumb(res.data, callback)
  })
}

// 加载对应所有点赞信息
function getAllThumb(data, callback) {
  wx.cloud.callFunction({
    name: 'getallthumb',
    success: res => {
      console.log(res.result.data);
      callback(concatData(data, res.result.data));
    },
    fail: err => console.log(err)
  })
}

// 加载数据拼接
function concatData(commentInfos, thumbInfos) {
  commentInfos.map(citem => {
    //citem.date = citem.date.slice(0, 11)
    thumbInfos && thumbInfos.some(titem => {
      if (citem._id === titem.userid) {
        citem["isThumb"] = titem.isthumb ? true : false
        citem.replies.map(item => {
          item["isThumb"] = titem.subthumb.includes(item.date) ? true : false;
        })
        return true;
      } else {
        citem["isThumb"] = false;
        citem.replies.map(item => item["isThumb"] = false)
        return false;
      }
    })
  })
  return commentInfos
}

// 获取总评论人数
function getTotalComment(database, callback) {
  database.collection('user').where({ hascomment: true }).count().then(res => callback(res.total))
}

/**
 * 结果分析区域
 */

// 保存答题记录
function addRecords(database, dataObj, count) {
  database.collection('records').add({ data: dataObj }).then(res => {
    console.log(res)
    hasAnswer(database, dataObj.openid, count)
  })
}

// 查询该用户是否已经答过题
function hasAnswer(database, openid, count) {
  database.collection('user').where({
    openid: openid
  }).get().then(res => {
    console.log(res)
    res.data.length ? changeAnswerStatus(database, res.data[0]._id) : addUser(database, openid, count)
  })
}

// 修改用户答题情况
function changeAnswerStatus(database, id) {
  database.collection('user').doc(id).update({
    data: {
      hastest: true
    }
  }).then(res => console.log(res))
}

// 添加用户答题
function addUser(database, openid, count) {
  database.collection('user').count().then(res => {
    const user = {
      openid: openid,
      userid: 'user' + (res.total + 1),
      hastest: true
    }
    if (count) {
      user["count"] = 1
    }
    database.collection('user').add({
      data: user
    }).then(res => console.log(res))
  })
}

// 获取用户答题记录
function getRecords(database, openid, callback) {
  database.collection('records').where({
    _openid: openid
  }).get().then(res => {
    console.log(res)
    callback(res.data)
  })
}

// 用户反馈
function advice(database, dataObj) {
  database.collection('advice').add({
    data: dataObj
  }).then(res => console.log("添加用户反馈成功！"))
}

// 加载测试人数
function loadTestNum(database, callback) {
  database.collection('user').where({
    hastest: true
  }).count().then(res => {
    console.log("测试人数加载成功！")
    callback(res.total)
  })
}

// 加载测试次数
function loadTestTimes(database, openid, callback) {
  database.collection('user').where({
    openid: openid
  }).get().then(res => {
    console.log(res)
    callback(res.data[0])
  })
}

// 更新测试次数
function updateTestNum(database, id, dataObj) {
  database.collection('user').doc(id).update({
    data: dataObj
  }).then(res => {
    console.log(res)
  })
}

//计算前几天的日期  返回格式为2020-1-1
function dateLater(dates, later) {
  let date = new Date(dates);
  date.setDate(date.getDate() - later);
  let yearDate = date.getFullYear();
  let month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth() + 1);
  let dayFormate = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
  var time = yearDate + '-' + month + '-' + dayFormate;
  return time;
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  submitComment: submitComment,
  hasComment: hasComment,
  checkThumb: checkThumb,
  addThumb: addThumb,
  updateThumb: updateThumb,
  updateThumbStatus: updateThumbStatus,
  submitreply: submitreply,
  updateThumbNum: updateThumbNum,
  loadComments: loadComments,
  getTotalComment: getTotalComment,
  addRecords: addRecords,
  getRecords: getRecords,
  advice: advice,
  loadTestNum: loadTestNum,
  loadTestTimes: loadTestTimes,
  updateTestNum: updateTestNum,
  dateLater: dateLater,
}
