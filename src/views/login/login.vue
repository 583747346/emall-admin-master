<template>
  <div class="login_container">
    <div class="login_box" v-loading="loading">
      <!--头像区-->
      <div class="avatar_pic">
        <img src="../../assets/picture/logo.png" alt="">
      </div>
      <!--表单区-->
      <!--loginFormRef表单的实例对象，通过其调用resetFields重置表单-->
      <el-form ref="loginFormRef" label-width="0px" class="login_form" :model="loginForm" :rules="loginRule">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" type="text" prefix-icon="iconfont icon-user"
                    placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"
                    placeholder="请输入密码" @keyup.enter.native="login"></el-input>
        </el-form-item>
        <el-form-item class="button_area">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
        <!--<div class="third_icon">
          <svg class="icon" aria-hidden="true" @click="">
            <use xlink:href="#icon-zhifubao"></use>
          </svg>
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-QQ"></use>
          </svg>
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-weixin"></use>
          </svg>
        </div>-->
      </el-form>
    </div>
  </div>
</template>

<script>
  import '../../assets/fontslogin/iconfont.js'

  export default {
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        loading: false,
        loginForm: {
          username: '',
          password: ''
        },
        loginRule: {
          username: [
            {
              required: true,
              message: '请输入账号',
              trigger: 'blur'
            },
            {
              min: 5,
              max: 12,
              message: '长度在 5 到 12 个字符',
              trigger: 'blur'
            }
          ],
          password: [
            {
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 5,
              max: 15,
              message: '长度在 5 到 15 个字符',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      login () {
        this.$refs.loginFormRef.validate(valid => {
          if (valid) {
            //登录
            console.log(this)
            this.ajaxFn.login({
              data: this.loginForm
            }).then(res => {
              let { data, status } = res
              if (status === 200) {
                //将生成的token保存在sessionStorage【sessionStorage会话期间的存储机制，localStorage是持久话的存储机制】
                window.sessionStorage.setItem('token', res.data.access_token)
                //登录成功跳转到home首页
                this.$message.success('登录成功')
                this.$router.push({ path: this.redirect || '/home' })
              }
            })
          } else {
            console.log('参数验证不合法！')
            return false
          }
        })
      },
      resetLoginForm () {
        this.$refs.loginFormRef.resetFields()
      }
    }
  }


</script>

<style lang="less" scoped>
  @import './login.less';
</style>
