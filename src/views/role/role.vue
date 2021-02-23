<template>
  <div>
    <el-card shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float:right"
          type="primary"
          @click="searchList"
          size="small">
          查询
        </el-button>
        <el-button
          style="float:right;margin-right: 15px;margin-left: 15px;"
          type="success"
          @click="addRole"
          size="small">
          添加
        </el-button>
        <el-button
          style="float:right"
          @click="resetSearch"
          size="small" type="danger">
          重置
        </el-button>
        <div style="margin-top: 20px">
          <el-form :inline="true" :model="roleParam" size="small" label-width="140px">
            <el-form-item label="角色名：">
              <el-input v-model="roleParam.name" class="input-width" placeholder="" clearable></el-input>
            </el-form-item>
            <el-form-item label="创建时间：">
              <el-date-picker
                v-model="daterange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right"
                @change='selectData(daterange)'
                clearable>
              </el-date-picker>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--数据展示区域-->
      <el-table :data="roleList" border stripe v-loading="loading" :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="code" label="角色code"></el-table-column>
        <el-table-column prop="name" label="角色"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="createdTime" label="创建时间"></el-table-column>
        <el-table-column prop="createdBy" label="创建者"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-row>
              <el-tooltip effect="dark" content="修改" placement="top-start" :span="12">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="updateRole(scope.row)"></el-button>
              </el-tooltip>
              <!--enterable是否鼠标可以进入tooltip-->
              <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false" :span="12">
                <el-button type="danger" size="mini" icon="el-icon-delete"
                           @click="deleteRole(scope.row.id)"></el-button>
              </el-tooltip>
            </el-row>
            <el-row>
              <el-tooltip effect="dark" content="分配菜单" placement="top-start" :enterable="false" :span="12">
                <el-button type="success" size="mini" icon="el-icon-setting"
                           @click="showRoleMenu(scope.row)"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="分配资源" placement="top-start" :enterable="false" :span="12">
                <el-button type="warning" size="mini" icon="el-icon-tickets"
                           @click="handleSelectResource(scope.$index, scope.row)">
                </el-button>
              </el-tooltip>
            </el-row>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="roleParam.pageCurrent"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="roleParam.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!--右侧滑出抽屉-->
    <el-drawer v-model="roleForm" title="更新" :visible.sync="drawer" :with-header="false" size="40%"
               :wrapperClosable="false">
      <span class="drawer-span">角色信息更新</span>
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="角色">
            <el-input v-model="roleForm.name"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="roleForm.description"></el-input>
          </el-form-item>
          <el-form-item class="button_area">
            <el-button type="primary" @click="drawerUpdateDo">修 改</el-button>
            <el-button type="info" @click="drawerBackDo">取 消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <!--添加角色区域-->
    <el-dialog title="添加角色" :visible.sync="insertRoleVisible" width="30%" :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="roleForm" label-width="80px">
        <el-form-item label="角色码" :rules="[{ required: true, message: '角色码不能为空'}]">
          <el-input v-model="roleForm.code"></el-input>
        </el-form-item>
        <el-form-item label="角色" :rules="[{ required: true, message: '角色不能为空'}]">
          <el-input v-model="roleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button type="info" @click="dialogCancel">取 消</el-button>
    <el-button type="primary" @click="dialogInsertRole(roleForm)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 角色分配菜单 -->
    <el-dialog title="分配菜单" :visible.sync="roleMenuVisible" width="30%" :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="roleMenu" :model="roleMenu" label-width="5px" size="small">
        <input type="hidden" v-model="roleMenu.menu">
        <el-row style="padding: 0 0 5px 5px;font-weight: bold;">
          当前角色：{{ roleMenu.name }}
        </el-row>

        <el-form-item>
          <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText" style="padding-bottom: 5px;"></el-input>
          <div style="height: 300px;">
            <el-scrollbar style="height:100%" class="aooms-scrollbar">
              <el-tree
                ref="tree"
                show-checkbox
                :expand-on-click-node="false"
                :props="{
                   label: 'menuName'
                }"
                highlight-current
                node-key="menuId"
                :data="permissionData"
                :filter-node-method="filterNode">
                <span class="aooms-tree-node" slot-scope="{ node, data }">
                  {{ node.label }}
                </span>
              </el-tree>
            </el-scrollbar>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="saveRoleMenu">保存</el-button>
          <el-button @click="roleMenuVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>

  <!--分配资源-->
</template>

<script>
  import c_select from '@/components/commonSelect'

  export default {
    created () {
      this.getRoleList()
      this.getAllMenu()
    },
    components: {
      c_select
    },
    name: 'role',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        daterange: [],
        roleParam: {
          startTime: '',
          endTime: '',
          name: '',
          //当前每页显示多少条数据
          pageSize: 0,
          //当前的页数
          pageCurrent: 0
        },
        //用于渲染角色列表
        roleList: [],
        total: 0,
        //单开抽屉
        drawer: false,
        //角色表单对象
        roleForm: {
          code: '',
          name: '',
          description: ''
        },
        //添加角色弹出对话框
        insertRoleVisible: false,
        //修改某个角色的id
        updateRoleId: '',
        //加载
        loading: true,
        roleMenu: {
          menu: []
        },
        roleMenuVisible: false,
        filterText: '',
        //全部的菜单信息
        permissionData: [],
        selectResourceIds: [],
        halfSelectResourceIds: []
      }
    },
    watch: {
      filterText (val) {
        this.$refs.tree.filter(val)
      }
    },
    methods: {
      //获取角色信息
      getRoleList () {
        this.ajaxFn.post({
          url: 'emall-manageplat/role/rolelist',
          data: this.roleParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.roleList = res.data.data.records
              this.total = parseInt(res.data.data.total)
            }
          }
        })
      },
      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.roleParam.size = newSize
        this.getRoleList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        this.roleParam.current = newPage
        this.getRoleList()
      },
      //查询搜索
      searchList () {
        this.getRoleList()
      },
      //重置请求参数
      resetSearch () {
        this.daterange = null
        this.roleParam.name = ''
        this.roleParam.current = 0
        this.roleParam.size = 10
      },
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          console.log(e[0])
          this.roleParam.startTime = e[0]
          this.roleParam.endTime = e[1]
        }
      },
      //添加角色
      addRole () {
        this.roleForm.code = ''
        this.roleForm.name = ''
        this.roleForm.description = ''
        //打开对话框
        this.insertRoleVisible = true
      },
      //对话框---取消添加
      dialogCancel () {
        this.clearRoleForm()
        this.insertRoleVisible = false
      },
      //对话框---提交
      dialogInsertRole (roleForm) {
        this.insertRoleVisible = false
        this.ajaxFn.post({
          url: 'emall-manageplat/role',
          data: roleForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('添加成功')
              this.roleParam.pageCurrent = 1
              this.getRoleList()
            }
          }
        })
        //添加完成，清空角色表单对象
        this.clearRoleForm()
      },
      //操作---更新角色
      updateRole (row) {
        this.roleForm = JSON.parse(JSON.stringify(row))
        this.drawer = true
      },
      //操作---删除角色
      deleteRole (id) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-manageplat/role'
          }, [id]).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.roleParam.pageCurrent = 1
                this.getRoleList()
              }
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      //抽屉---更新角色信息
      drawerUpdateDo () {
        console.log(this.roleForm)
        this.ajaxFn.put({
          url: 'emall-manageplat/role',
          data: this.roleForm
        }, [this.roleForm.id]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('修改成功！')
              this.drawer = false
              this.roleParam.pageCurrent = 1
              this.getRoleList()
            }
          }
        })
      },
      //抽屉---取消
      drawerBackDo () {
        this.drawer = false
        this.updateRoleId = ''
        this.clearRoleForm()
      },
      //清空表单数据
      clearRoleForm () {
        this.roleForm.name = ''
        this.roleForm.code = ''
        this.roleForm.description = ''
      },
      getRoleMenu () {
        this.ajaxFn.get({
          url: 'emall-manageplat/role/getMenuByRoleId/' + this.roleMenu.id,
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              let mList = data.data
              if (mList && mList.length > 0) {
                for (let obj of mList) {
                  let children = obj.children

                  if (children && children.length > 0) {
                    for (let sub of children) {
                      this.roleMenu.menu.push({
                        menuId: sub.id
                      })
                    }
                  } else {
                    this.roleMenu.menu.push({
                      menuId: obj.id
                    })
                  }
                }
                console.log(this.roleMenu.menu)
                this.menuIds = this.roleMenu.menu
                this.$refs.tree.setCheckedNodes(this.menuIds)
              }
            }
          }
        })
      },
      //显示该角色对应的菜单列表
      showRoleMenu (row) {
        this.roleMenu = JSON.parse(JSON.stringify(row))
        this.roleMenuVisible = true
        this.$nextTick(() => {
          this.roleMenu.menu = []
          this.menuIds = this.roleMenu.menu
          this.$refs.tree.setCheckedNodes([])
          this.getRoleMenu()
        })
      },
      //获取所有菜单
      getAllMenu () {
        this.ajaxFn.get({
          url: 'emall-manageplat/menu/menutree'
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.permissionData = res.data.data
            }
          }
        })
      },
      //为该角色分配菜单
      saveRoleMenu () {
        let nodes = this.$refs.tree.getCheckedNodes()
        let halfNodes = this.$refs.tree.getHalfCheckedNodes()
        this.selectResourceIds = []
        this.halfSelectResourceIds = []
        nodes.forEach(node => {
          this.selectResourceIds.push(node.menuId)
        })
        halfNodes.forEach(node => {
          this.halfSelectResourceIds.push(node.menuId)
        })
        this.ajaxFn.post({
          url: 'emall-manageplat/role/menu/' + this.roleMenu.id,
          data: this.selectResourceIds.concat(this.halfSelectResourceIds)
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('菜单分配成功！')
              this.roleMenuVisible = false
            }
          }
        })
      },
      filterNode (value, data) {
        if (!value) return true
        return data.menuName.indexOf(value) !== -1
      },

      //操作--为角色分配资源
      handleSelectResource(index,row){
        this.$router.push({path:'/roleResource',query:{roleId:row.id}})
      },
    }
  }
</script>

<style lang="less" scoped>
  @import "./role.less";
</style>
