// 引入用来发送请求的方法 路径一定要补全
import { request } from "../../request/index.js";
Page({
    data: {
        inputUrl: ''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideLoading
        this.checkAuth()
    },
    copyText() {
        var vm = this
        wx.getClipboardData({
            success(res) {
                vm.setData({
                    inputUrl: res.data
                })
            }
        })
    },
    download() {
        wx.showLoading({
            title: '正在解析',
            mask: true
        })
        request({
            url: 'http://182.92.176.32:9090/bare',
            method: 'POST',
            data: {
                link: this.data.inputUrl
            },
            header: {
                "Content-Type": "application/json;charset=utf-8"
            },
        }).then(res => {
            this.checkAuth()
            if (res.data.data.type === 'VIDEO') {
                wx.hideLoading
                wx.showToast({
                    title: '解析成功',
                    icon: 'success',
                })
                wx.showLoading({
                    title: '正在下载',
                    mask: true
                })
                this.setData({
                    inputUrl: ''
                })
                let downloadUrl = res.data.data.videos[0].url
                wx.downloadFile({
                    url: downloadUrl,
                    success: (res) => {
                        wx.hideLoading
                        if (res.statusCode === 200) {
                            wx.saveVideoToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: (result) => {
                                    wx.showToast({
                                        title: '下载成功',
                                        icon: 'success',
                                    })
                                },
                                fail: (err) => {
                                    console.log(err)
                                },
                            })
                        }
                    }
                })
            } else {
                // 获取后端返回的图集
                let originList = res.data.data.images
                // 设置全局变量中的图片数组，用作渲染pictures页面
                let app =  getApp();
                originList.forEach(element => {
                    app.globalData.imageList.push(element.url)
                });
                this.setData({
                    inputUrl: ''
                })
                setTimeout(() => {
                    wx.navigateTo({
                        url: '/pages/pictures/pictures'
                    })
                }, 300);

            }
        })

    },
    /**
     * 检查用户授权情况
     */
    checkAuth() {
        // wx.getSetting 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。
        wx.getSetting({
            success: (res) => {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    // 没有获取存储系统相册的权限，则请求授权
                    // wx.authorize 提前向用户发起授权请求。调用后会立刻弹窗询问用户是否同意授权小程序使用某项功能或获取用户的某些数据
                    wx.authorize({
                        // 请求授权，类型为存储到相册
                        scope: 'scope.writePhotosAlbum',
                        success: (result) => {
                        },
                        fail: () => {
                            wx.showModal({
                                content: '请允许添加到相册',
                                showCancel: true,
                                cancelText: '取消',
                                cancelColor: '#000000',
                                confirmText: '去设置',
                                confirmColor: '#3CC51F',
                                success: (result) => {
                                    if (result.confirm) {
                                        // 如果用户点击同意授权，则设置
                                        // wx.openSetting 调起客户端小程序设置界面，返回用户设置的操作结果。设置界面只会出现小程序已经向用户请求过的权限。
                                        wx.openSetting({
                                            success(res) {
                                                if (res.authSetting['scope.writePhotosAlbum'] === true) {
                                                    console.log('授权成功......')
                                                } else {
                                                    console.log('授权失败......')
                                                }
                                            }
                                        })
                                    } else {
                                        wx.showToast({
                                            title: '授权失败',
                                            icon: 'error',
                                            mark: true
                                        })
                                    }
                                },
                                fail: () => {
                                    wx.showToast({
                                        title: '打开设置页失败',
                                        icon: 'none',
                                        image: '',
                                        duration: 1500,
                                        mask: false,
                                        success: (result) => {
                                            console.log('打开设置页失败')
                                        },
                                    });
                                }
                            });
                        }
                    });
                } else {
                    // 已有授权
                }

            },
            fail: () => {
                // 获取用户设置失败
                // 隐藏等待框
                wx.hideLoading()
                wx.showToast({
                    title: '获取授权失败',
                    icon: 'none'
                })
            }
        })
    },
})



