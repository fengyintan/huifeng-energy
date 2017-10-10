var loading = {
    show: function() {
        document.getElementById("loading").className = "";
    },
    close: function() {
        document.getElementById("loading").className = "hidden";
        document.getElementById("loading").style.background = "rgba(255,255,255,0)";
    }
}
var vm = new Vue({
    el: "#app",
    data: {
        waringState: false,
        warningText: "",
        sureState: false,
        pageState1: true,
        pageState2: false,
        pageState3: false,
        nickName: "",
        menuState: 1,
        menuClass1: "menuList active",
        menuClass2: "menuList",
        menuClass3: "menuList",
        transClass: "",
        boxState1: true,
        boxState2: false,
        boxState3: false,
        showBoxState: false,
        gift_id: 2,
        proIntro: ["common/assets/img/program1/text1.png", "common/assets/img/program1/text2.png", "common/assets/img/program1/text3.png", "common/assets/img/program1/text4.png", "common/assets/img/program1/text5.png", "common/assets/img/program1/text6.png", ],
        giftList: ["common/assets/img/gift/gift1.jpg", "common/assets/img/gift/gift2.jpg", "common/assets/img/gift/gift3.jpg", "common/assets/img/gift/gift4.jpg", "common/assets/img/gift/gift5.jpg", ],
        chooseIntro: "",
        energy1: 0,
        energy2: 0,
        energy3: 0,
        energy4: 0,
        energy5: 0,
        energy6: 0,
        userPower: 0, //用户能量值
        giftNum: 0,
        giftResultState: false,
        giftResultPic: "",
        giftName: "",
        user_id: '',
        scanID: 0,
    },
    methods: {
        goPages: function(num) {
            if (num == 1) {
                if (!this.nickName) {
                    this.pageState1 = false;
                    this.pageState2 = true;
                } else {
                    this.pageState1 = false;
                    this.pageState3 = true;
                }
            } else if (num == 2) {
                this.pageState2 = false;
                this.pageState3 = true;
            }
        },
        createNickName: function() {
            //发送请求，判断昵称是否存在
            var reg = /^\s*$/;
            if (!this.nickName || reg.test(this.nickName)) {
                this.warning("请输入昵称！");
            } else {
                var url = "api.php?type=action&action=reg";
                var formData = new FormData();
                formData.append('nickname', this.nickName);
                formData.append('user_id', this.user_id);
                //              this.goPages(2);//test代码
                loading.show();
                this.$http.post(url, formData).then(function(response) {
                    loading.close();
                    console.log(response.body)
                    if (response.body.state == "1") { //创建成功
                        this.goPages(2);
                    } else if (response.body.state == "-1") { //注册失败
                        this.warning(response.body.msg);
                        this.nickName = "";
                    }
                }, function(response) {
                    loading.close();
                    this.warning("网络错误,请重试!")
                })
            }
        },
        getUserState: function() {
            var self = this;
            //          
            loading.show();
            var url = "api.php?type=action&action=getdata";
            var formData = new FormData();
            formData.append('user_id', this.user_id);
            this.$http.post(url, formData).then(function(response) {
                loading.close();
                this.nickName = response.body.nickname;
                this.gift_id = response.body.gift_id;
                if (this.gift_id > 0) {
                    this.pageState1 = false;
                    this.pageState3 = true;
                    this.menuState = 3;
                    setTimeout(function() {
                        var gift = document.getElementsByClassName("gift");
                        document.getElementsByClassName("gift")[(self.gift_id - 1)].className = "gift active";
                        var div = document.createElement("div");
                        div.style.position = "fixed";
                        div.style.zIndex = "2000";
                        div.style.width = "100%";
                        div.style.height = "100%";
                        document.body.appendChild(div)
                    }, 500);
                }
                for (var i = 0; i < response.body.energy_list.length; i++) {
                    if (response.body.energy_list[i].id == 1) {
                        this.energy1 = 1;
                    }
                    if (response.body.energy_list[i].id == 2) {
                        this.energy2 = 1;
                    }
                    if (response.body.energy_list[i].id == 3) {
                        this.energy3 = 1;
                    }
                    if (response.body.energy_list[i].id == 4) {
                        this.energy4 = 1;
                    }
                    if (response.body.energy_list[i].id == 5) {
                        this.energy5 = 1;
                    }
                    if (response.body.energy_list[i].id == 6) {
                        this.energy6 = 1;
                    }
                }
            }, function(response) {
                loading.close();
                this.warning("网络错误,请重试!")
            })
        },
        changeMenu: function(num) {
            this.menuState = num;
        },
        checkTip: function(num) {
            this.showBoxState = true;
            this.chooseIntro = this.proIntro[num];
            this.scanID = Number(num) + 1;
        },
        closeShowBox: function() {
            this.showBoxState = false;
        },
        chooseGift: function(e) {
            //总能量值
            var gift = document.getElementsByClassName("gift");
            gift[0].className = "gift";
            gift[1].className = "gift";
            gift[2].className = "gift";
            gift[3].className = "gift";
            gift[4].className = "gift";
            var target = e.currentTarget;
            var power = target.getAttribute("data-power");
            this.giftName = target.getAttribute("data-gift");
            if (target.className == "gift active") {
                target.className = "gift";
            } else {
                target.className = "gift active";
            }
            this.userPower = this.energy1 + this.energy2 + this.energy3 + this.energy4 + this.energy5 + this.energy6;
            if (this.userPower < power) {
                this.warning("能量值不够,赶紧去挑战项目收集能量吧");
            } else {
                this.warning2("确定兑换该礼物？");
                this.sureState = true;
                this.giftNum = power;
            }
        },
        sureGift: function() {
            //          this.giftResult();
            if (this.gift_id == -1) {
                this.closeWarning();
                var url = "api.php?type=action&action=exchangegift";
                var formData = new FormData();
                formData.append('user_id', this.user_id);
                formData.append('gift_id', (this.giftNum - 1));
                formData.append('giftName', this.giftName);
                formData.append('optionTime', this.getJoinTime(new Date().getTime()));
                loading.show();
                this.$http.post(url, formData).then(function(response) {
                    loading.close();
                    console.log(response.body)
                    if (response.body.state == "1") { //获取奖品成功
                        this.giftResult(); //显示奖品详情
                        this.getUserState();
                    } else if (response.body.state == "-1") { //获取奖品成功
                        this.warning(response.body.msg)
                    }
                }, function(response) {
                    loading.close();
                    this.warning("网络错误,请重试!")
                })
            } else if (this.gift_id == 1) {
                this.warning("您已经领取过奖品，每人只能领一个奖品哦")
            }
        },
        giftResult: function() {
            this.giftResultState = true;
            this.giftResultPic = this.giftList[this.giftNum - 2];
        },
        closeGiftResult: function() {
            this.giftResultState = false;
        },
        warning: function(msg) {
            this.waringState = true;
            this.warningText = msg;
            this.sureState = false;
        },
        warning2: function(msg) {
            this.waringState = true;
            this.warningText = msg;
            this.sureState = true;
        },
        closeWarning: function() {
            this.waringState = false;
        },
        scanQRcode: function() {
            var self = this;
            //          console.log("调用二维码扫描");
            wx.scanQRCode({
                needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有
                success: function(res) {
                    var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                    if (result != self.scanID) {
                        self.warning("您扫描的不是此项目的二维码")
                    } else {
                        self.QRRequest(result);
                    }
                }
            });
        },
        QRRequest: function(energy_id) {
            var url = "api.php?type=action&action=scanqr";
            var formData = new FormData();
            formData.append('user_id', this.user_id);
            formData.append('energy_id', energy_id);
            loading.show();
            this.$http.post(url, formData).then(function(response) {
                loading.close();
                this.warning(response.body.msg);
                if (response.body.state == 1) {
                    if (energy_id == '1') {
                        this.energy1 = 1;
                    }
                    if (energy_id == '2') {
                        this.energy2 = 1;
                    }
                    if (energy_id == '3') {
                        this.energy3 = 1;
                    }
                    if (energy_id == '4') {
                        this.energy4 = 1;
                    }
                    if (energy_id == '5') {
                        this.energy5 = 1;
                    }
                    if (energy_id == '6') {
                        this.energy6 = 1;
                    }
                } else {}
            }, function(response) {
                loading.close();
            });
        },
        getJoinTime: function(date2) {
            console.log(date2)
            var date = new Date(Number(date2));
            var year = date.getFullYear();
            var month = (date.getMonth() + 1).toString();
            month = (month.length < 2 ? ("0" + month) : month);
            var day = date.getDate().toString();
            day = day.length < 2 ? "0" + day : day;
            var hour = date.getHours().toString();
            hour = hour.length < 2 ? "0" + hour : hour;
            var min = date.getMinutes().toString();
            min = min.length < 2 ? "0" + min : min;
            var second = date.getSeconds().toString();
            second = second.length < 2 ? "0" + second : second;
            return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + second;
        },
        jsSdk: function() {
            var url = "api.php?type=action&action=jssdk";
            var formData = new FormData();
            formData.append('jssdk_url', location.href);
            this.$http.post(url, formData).then(function(response) {
                wxConfig(response.body);
            }, function(response) {});
        }
    },
    mounted: function() {
        this.jsSdk();
        this.user_id = document.getElementById("user_id").value;
        this.getUserState();
    },
    watch: {
        menuState: function(newVal, oldVal) {
            if (newVal > oldVal) {
                this.transClass = "rp";
            } else {
                this.transClass = "lp"
            }
            this.menuClass1 = "menuList";
            this.menuClass2 = "menuList";
            this.menuClass3 = "menuList";
            this.boxState1 = false;
            this.boxState2 = false;
            this.boxState3 = false;
            if (newVal == 1) {
                this.menuClass1 = "menuList active";
                this.boxState1 = true;
            } else if (newVal == 2) {
                this.menuClass2 = "menuList active";
                this.boxState2 = true;
                //更新状态
                //              this.getUserState();
            } else if (newVal == 3) {
                this.menuClass3 = "menuList active";
                this.boxState3 = true;
                //更新状态
                //              this.getUserState();
            }
        }
    }
});

function wxConfig(jssdkInfo) {
    window.bigfoot = window.bigfoot | {
        jssdk_info: jssdkInfo
    };
    var shareImg = 'common/assets/img/wx_share.jpg';
    var shareInfo = {
        title: document.title,
        des: '',
        link: location.href,
        image: location.protocol + '//' + location.hostname + location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1) + shareImg
    }
    wx.config({
        debug: false,
        appId: jssdkInfo.appid,
        timestamp: jssdkInfo.timestamp,
        nonceStr: jssdkInfo.nonce_str,
        signature: jssdkInfo.signature,
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'scanQRCode']
    });
    wx.ready(function() {
        wx.onMenuShareTimeline({
            title: shareInfo.title, // 分享标题
            link: shareInfo.link, // 分享链接
            imgUrl: shareInfo.image, // 分享图标
            success: function() {},
            cancel: function() {
                // 用户取消分享后执行的回调函数
            }
        });
        wx.onMenuShareAppMessage({
            title: shareInfo.title, // 分享标题
            desc: shareInfo.des, // 分享描述
            link: shareInfo.link, // 分享链接
            imgUrl: shareInfo.image, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function() {
                // 用户确认分享后执行的回调函数
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
            }
        });
    });
    wx.error(function(res) {});
};