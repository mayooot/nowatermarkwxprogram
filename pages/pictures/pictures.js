// pages/pictures/pictures.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imageList: []
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideLoading
        wx.showToast({
            title: '解析成功!',
            icon: 'success',
        })
        let app =  getApp();
        this.setData({
            imageList: app.globalData.imageList
        })

    },
    /**
     * 生命周期函数--监听页面卸载
     * 当退出此页面或隐藏时，触发的函数
     */
    onUnload: function () {
        let app =  getApp();
        // 将全局变量中的图片数组置空
        app.globalData.imageList = []
        // 将pictures中的data里的图片数组置空
        this.setData({
            imageList: []
        })
    },
    previewImage(event) {
        let previewUrl = event.currentTarget.dataset.previewurl
        wx.previewImage({
            current: previewUrl,
            urls: this.data.imageList
        })
    }
})