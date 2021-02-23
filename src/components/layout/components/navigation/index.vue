<template>
  <el-menu class="navbar" mode="horizontal">
    <!--汉堡包 菜单折叠-->
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
    <!--面包屑-->
    <bread-crumb></bread-crumb>
  </el-menu>
</template>

<script>
  import { mapGetters } from 'vuex'
  import breadCrumb from '../breadcrumb'
  import hamburger from '../hamburger'

  export default {
    components: {
      breadCrumb,
      hamburger
    },
    computed: {
      ...mapGetters([
        'sidebar',
        'avatar'
      ])
    },
    name: 'navigation',
    methods: {
      toggleSideBar () {
        this.$store.dispatch('ToggleSideBar')
      }
    }
  }
</script>

<style scoped>
  @import "index.less";
</style>
