<template>
  <div>
    <p style="color: red;">{{ message }}</p>
    呼叫组件简易demo，使用步骤如下：
    1、输入appkey等账号信息
    2、后点击登录
    3、呼叫对方或者收到对方呼叫之后点击接听
    <div>
      <button @click="login">登录</button>
      <button @click="call">呼叫</button>
      <button @click="hangup">取消</button>
      <button @click="accept">接听</button>
      <button @click="hangup">挂断</button>
      <button @click="switchView">切换视图</button>
      <button @click="switchCallType">切换通话类型</button>
      <button @click="enableLocalVideo">开关摄像头</button>
      <button @click="enableLocalAudio">开关麦克风</button>
    </div>
    <div>
      appkey:
      <input type="text" v-model="appkey" />
      accId:
      <input type="text" v-model="accId" />
      token:
      <input type="text" v-model="token" />
      callee:
      <input type="text" v-model="callee" />
    </div>
    <div id="NE_view">
      <div id="NE_large">
      </div>
      <div id="NE_small" @click="switchView">
      </div>
    </div>
  </div>
</template>

<script>
import V2NIM from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK"
import { NECall } from '@xkit-yx/call-kit'

const neCall = NECall.getInstance()
window.neCall = neCall

export default {
  name: 'App',
  data() {
    return {
      appkey: '',
      accId: '',
      token: '',
      callee: '',
      message: '',
      switchViewFlag: true,
      enableVideoFlag: true,
      enableTypeFlag: true,
      enableAudoFlag: true
    }
  },
  methods: {
    async login() {
      const nim = V2NIM.getInstance({
        appkey: this.appkey, // im appkey
        token: this.token, // im token
        account: this.accId, // im account
        apiVersion: 'v2',
        debugLevel: 'debug',
      })
      await nim.V2NIMLoginService.login(this.accId, this.token)
      neCall.setup({
        nim: nim, // im 实例用户需要先初始化
        appkey: this.appkey, // 应用的 appKey，G2 平台的 appKey
        debug: true, // 是否需要开启日志，默认开启
      })
      // 来电监听
      neCall.on('onReceiveInvited', (value) => {
        // 用户可以触发视图，比如弹起邀请页面
        console.log(value)
        this.message = `收到 ${value.callerAccId} 呼叫，可以点击接听按钮了`

      })
      // 通话结束的回调。通话被取消、拒绝、通话中挂断，即所有导致通话结束的行为都会触发此回调
      neCall.on('onCallEnd', (value) => {
        console.log(value)
        this.message = ''
      })
      // 话单回调
      neCall.on('onRecordSend', (value) => {
        console.log(value)
      })
      // 主被叫加入通道的回调，通话建立后触发
      neCall.on('onCallConnected', (value) => {
        console.log("onCallConnected: ", value)
      })
      // 通话方式切换
      neCall.on('onCallTypeChange', (NECallTypeChangeInfo) => {
        console.log("onCallTypeChange: ", NECallTypeChangeInfo)
        if (NECallTypeChangeInfo.callType === "1") {
          NECall.getInstance().enableLocalVideo(false)
          this.enableTypeflag = false
        } else {
          NECall.getInstance().enableLocalVideo(true)
          this.enableTypeflag = true
        }
      })
    },
    call() {
      // 发起呼叫
      const localView = document.getElementById('NE_small')
      const remoteView = document.getElementById('NE_large')
      neCall.setLocalView(localView)
      neCall.setRemoteView(remoteView, this.callee)
      neCall.setTimeout(30)//设置呼叫超时取消时间，单位：秒
      neCall.call({
        accId: this.callee, // 被叫 im 的 id
        callType: '2', //呼叫类型，1表示语音通话，2表示视频通话 
      })
    },
    accept() {
      // 接受邀请
      const localView = document.getElementById('NE_small')
      const remoteView = document.getElementById('NE_large')
      neCall.setLocalView(localView)
      neCall.setRemoteView(remoteView, this.callee)
      // 接受邀请，需要先设置视图
      neCall.accept()
      this.message = ''
    },
    hangup() {
      // 挂断
      neCall.hangup()
      this.message = ''
    },
    switchView() {
      if (this.switchViewFlag) {
        const localView = document.getElementById('NE_small')
        const remoteView = document.getElementById('NE_large')
        neCall.setLocalView(remoteView)
        neCall.setRemoteView(localView)
        neCall.rtcController.playLocalStream()
        neCall.rtcController.playRemoteStream(neCall.rtcController.remoteStreams[0])
        this.switchViewFlag = false
      } else {
        const localView = document.getElementById('NE_small')
        const remoteView = document.getElementById('NE_large')
        neCall.setLocalView(localView)
        neCall.setRemoteView(remoteView)
        neCall.rtcController.playLocalStream()
        neCall.rtcController.playRemoteStream(neCall.rtcController.remoteStreams[0])
        this.switchViewFlag = true
      }
    },
    switchCallType() {
      if (this.enableTypeFlag) {
        NECall.getInstance().switchCallType({ callType: 1, state: 1 })
        NECall.getInstance().enableLocalVideo(false)
        this.enableTypeFlag = false
      } else {
        NECall.getInstance().switchCallType({ callType: 2, state: 1 })
        NECall.getInstance().enableLocalVideo(true)
        this.enableTypeFlag = true
      }
    },
    enableLocalVideo() {
      if (this.enableVideoFlag) {
        NECall.getInstance().muteLocalVideo(true)
        this.enableVideoFlag = false
      } else {
        NECall.getInstance().muteLocalVideo(false)
        this.enableVideoFlag = true
      }
    },
    enableLocalAudio() {
      if (this.enableAudoFlag) {
        NECall.getInstance().muteLocalAudio(true)
        this.enableAudoFlag = false
      } else {
        NECall.getInstance().muteLocalAudio(false)
        this.enableAudoFlag = true
      }
    }
  },
}
</script>
<style>
#NE_view {
  width: 375px;
  height: 606px;
  background: #1d1d23;
  box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014,
    0 9px 28px 8px #0000000d;
  position: absolute;
  z-index: 98;
  top: 120px;
  left: 50px;
  overflow: hidden;
}

#NE_large {
  background-color: #000;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;
}

#NE_small {
  background-color: #000;
  position: absolute;
  top: 20px;
  right: 20px;
  width: 125px;
  height: 202px;
  display: block;
}
</style>