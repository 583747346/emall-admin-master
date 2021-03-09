<template>
  <div>
    <!--侧边菜单栏区域-->
    <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened
             :collapse="isCollapase" :collapse-transition="false" :router="true" :default-active="activePath">
      <template v-for="item in menuList">
        <el-menu-item v-if="item.children.length === 0" :index=" '/' + item.path "
                      :key="item.menuId"
                      @click="saveNavStatus('/'+item.path)">
          <i :class="item.icon"></i>
          <span>{{item.menuName}}</span>
        </el-menu-item>
        <!--一级菜单-->
        <el-submenu v-if="item.children.length != 0" :index="item.menuId +'' " :key="item.menuId"
                    popper-append-to-body>
          <template slot="title">
            <i :class="item.icon"></i>
            <span>{{item.menuName}}</span>
          </template>
          <!--二级菜单-->
          <el-menu-item :index=" '/' + subItem.path " v-for="subItem in item.children"
                        :key="subItem.menuId"
                        @click="saveNavStatus('/'+subItem.path)">
            <template slot="title">
              <i :class="subItem.icon"></i>
              <span>{{subItem.menuName}}</span>
            </template>
          </el-menu-item>
        </el-submenu>
      </template>
    </el-menu>

  </div>
</template>

<script>
  export default {
    name: 'index',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        //菜单信息
        menuList: [],
        //被激活的链接地址
        activePath: ''
      }
    },
    computed: {
      sidebar () {
        return this.$store.state.app.sidebar
      },
      isCollapase () {
        return this.sidebar.opened
      }
    },
    //页面加载前执行
    created () {
      this.getMenuList()
      // 在加载页面前从sessionStorage中获取激活路径状态
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      //获取菜单信息
      getMenuList () {
        this.ajaxFn.get({
          url: '/emall-ums-service/home/treeList'
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.menuList = res.data.data
            }
          }
        })
      },
      // 点击的菜单进行高亮
      saveNavStatus (activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "index.less";
</style>
