<template>
  <div class="header">
    <div>
      <span>emall后台管理系统</span>
    </div>
    <div class="userInfo">
      <el-dropdown class="avatar-container" trigger="click">
        <div style="display: flex">
          <img class="user_avatarImg" :src="userInfo.avatar || defaultIcon">
          <p style="color: #f7f7f7;font-weight: bold;">{{userInfo.username}}</p>
          <!--          设置一个向下的箭头标签-->
          <!--          <i class="el-icon-caret-bottom"></i>-->
        </div>
        <el-dropdown-menu class="user-dropdown" slot="dropdown" style="width: 100px">
          <router-link class="inlineBlock" to="/dashboard">
            <el-dropdown-item style="display:block;">
              <i class="el-icon-s-home"></i>
              首页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided style="display:block;">
            <i class="el-icon-switch-button"></i>
            <span @click="logout">注销</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
  import defaultIcon from '@/assets/picture/default.png'
  import { mapActions } from 'vuex'
  import store from '@/store'
  import Cookies from 'js-cookie'

  export default {
    name: 'toppanel',
    data () {
      return {
        defaultIcon: defaultIcon,
        userInfo: {}
      }
    },
    methods: {
      logout () {
        //清空用户信息
        store.commit('SET_USER_INFO', '')
        //清空sessionStorage缓存
        window.sessionStorage.clear()
        //重定向到登录界面
        this.$router.push('/')
      },
      ...mapActions(['getUserInfo'])
    },
    mounted () {
      this.getUserInfo().then((res) => {
        console.log(res)
        this.userInfo = res
      })
    }
  }
</script>

<style lang="less" scoped>
  @import "index.less";
</style>
