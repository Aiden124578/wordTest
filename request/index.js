let ajaxNum = 0;
export const request = (params) => {
    wx.showLoading({
        title: '加载中',
        mask: true,
    });
    ajaxNum++;
    const baseUrl = 'https://www.suhongdh.cn:8081'; 
    return new Promise((resolve, reject)=>{
        wx.request({
            ...params,
            url: baseUrl+params.url,
            success: (result) => {
                ajaxNum--;
                resolve(result)
            },
            fail: (err) => {
                reject(err)
            },
            complete: () => {
                if(ajaxNum==0){
                    wx.hideLoading();
                }
            }
        });
          
    })
}