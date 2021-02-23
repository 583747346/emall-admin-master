<template>
  <el-container class="layout">
    <!--头部-->
    <el-header>
      <toppanel></toppanel>
    </el-header>
    <el-container>
      <!--侧边菜单-->
      <el-aside :width="isCollapase ? '64px':'200px'">
        <sidebar></sidebar>
      </el-aside>
      <el-container class="main-container">
        <navigation></navigation>
        <!--主区域-->
        <appmain/>
        <!--脚部-->
        <el-footer>@emall · copyright.2020</el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
  import sidebar from './components/sidebar'
  import navigation from './components/navigation'
  import toppanel from './components/toppanel'
  import appmain from './components/appmain'
  import Cookies from 'js-cookie'

  export default {
    name: 'layout',
    components: {
      sidebar,
      navigation,
      toppanel,
      appmain
    },
    computed: {
      sidebar () {
        console.log(this)
        return this.$store.state.app.sidebar
      },
      device () {
        return this.$store.state.app.device
      },
      classObj () {
        return {
          hideSidebar: !this.sidebar.opened,
          withoutAnimation: this.sidebar.withoutAnimation,
          mobile: this.device === 'mobile'
        }
      },
      isCollapase () {
        let sidebarStatus = Cookies.get('sidebarStatus')
        return this.sidebar.opened
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "./layout.less";
</style>
