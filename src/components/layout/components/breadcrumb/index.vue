<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index)  in levelList" :key="item.path" v-if="item.meta.title">
        <span v-if="item.redirect==='noredirect'||index==levelList.length-1"
              class="no-redirect">{{item.meta.title}}</span>
        <router-link v-else :to="item.redirect||item.path">{{item.meta.title}}</router-link>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
  export default {
    name: 'breadcrumb',
    created () {
      this.getBreadcrumb()
    },
    data () {
      return {
        levelList: null
      }
    },
    watch: {
      $route () {
        this.getBreadcrumb()
      }
    },
    methods: {
      getBreadcrumb () {
        let matched = this.$route.matched.filter(item => item.path)
        const first = matched[0]
        if (first && first.path !== 'home') {
          matched = [{
            path: '/home',
            meta: { title: '首页' }
          }].concat(matched)
        }
        this.levelList = matched
      }
    }
  }
</script>

<style lang="less" scoped>
  .app-breadcrumb.el-breadcrumb {
    font-size: 15px !important;
    line-height: 50px;
    margin-left: 10px;
    margin-bottom: 0px !important;

    .no-redirect {
      color: #97a8be;
      cursor: text;
    }
  }
</style>
