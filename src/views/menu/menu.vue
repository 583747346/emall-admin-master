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
          @click="addMenu"
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
          <el-form :inline="true" :model="menuParam" size="small" label-width="140px">
            <el-form-item label="菜单名：">
              <el-input v-model="menuParam.name" class="input-width" placeholder="" clearable></el-input>
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
      <el-table :data="menuList" border stripe v-loading="loading" :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="type" label="菜单类型"></el-table-column>
        <el-table-column prop="name" label="菜单"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="path" label="菜单路径"></el-table-column>
        <el-table-column prop="icon" label="菜单图标" width="100" align="center">
          <template slot-scope="scope">
            <i v-if="scope.row.icon" :class="scope.row.icon" style="font-size: 22px;"></i>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="菜单排序"></el-table-column>
        <el-table-column prop="createdTime" label="创建时间"></el-table-column>
        <el-table-column prop="createdBy" label="创建者"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope" v-if="scope.row.path !== 'home'">
            <el-tooltip effect="dark" content="子菜单管理" placement="top-start" :enterable="false">
              <el-button type="success" size="mini" icon="el-icon-folder-add"
                         @click="showSubMenu(scope.row)"></el-button>
            </el-tooltip>

            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="updateMenu(scope.row)"></el-button>
            </el-tooltip>
            <!--enterable是否鼠标可以进入tooltip-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete"
                         @click="deleteMenu(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="menuParam.pageCurrent"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="menuParam.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>
    <!--右侧滑出抽屉-->
    <el-drawer v-model="menuForm" title="更新" :visible.sync="drawer" :with-header="false" size="40%"
               :wrapperClosable="false">
      <span class="drawer-span">菜单信息更新</span>
      <!--分割线-->
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="菜单">
            <el-input v-model="menuForm.name"></el-input>
          </el-form-item>
          <el-form-item label="菜单类型">
            <el-input v-model="menuForm.type"></el-input>
          </el-form-item>
          <el-form-item label="上级菜单">
            <c_select
              style="width: 100%"
              @changeSelectedValue="setEditMenuSelected"
              :initValue="{
                'value': menuForm.parentId
              }"
              :beforeOptions="{
                'option':[
                  {
                    value: '0',
                    label: '主菜单'
                  }
                ]
              }"
              placeholder="请选择上级菜单"
              target="menu"
              ref="editMenu"
            />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="menuForm.description"></el-input>
          </el-form-item>
          <el-form-item label="菜单路径">
            <el-input v-model="menuForm.path"></el-input>
          </el-form-item>
          <el-form-item label="菜单图标">
            <el-input v-model="menuForm.icon"></el-input>
          </el-form-item>
          <el-form-item label="菜单排序">
            <el-input v-model="menuForm.orderNum"></el-input>
          </el-form-item>
          <el-form-item class="button_area">
            <el-button type="primary" @click="drawerUpdateDo">修 改</el-button>
            <el-button type="info" @click="drawerBackDo">取 消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <el-dialog :title="subMenuData.name + ' - 子菜单管理'" :visible.sync="subMenuShow" width="80%"
               :close-on-press-escape="false"
               :close-on-click-modal="false">
      <div class="">
        <el-button
          type="success"
          size="mini" icon="el-icon-folder-add"
          @click="addSubMenu(subMenuData.id)"
        >
          添加子菜单
        </el-button>
      </div>
      <el-table :data="subMenuList" border stripe v-loading="loading" :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="type" label="菜单类型"></el-table-column>
        <el-table-column prop="name" label="菜单"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="path" label="菜单路径"></el-table-column>
        <el-table-column prop="icon" label="菜单图标" align="center">
          <template slot-scope="scope">
            <i v-if="scope.row.icon" :class="scope.row.icon" style="font-size: 22px;"></i>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="菜单排序"></el-table-column>
        <el-table-column prop="createdTime" label="创建时间"></el-table-column>
        <el-table-column prop="createdBy" label="创建者"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope" v-if="scope.row.path !== 'home'">
            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="updateMenu(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteMenu(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="subMenuShow = false">确 定</el-button>
      </span>
    </el-dialog>

    <!--添加菜单区域-->
    <el-dialog :title="addSubMenuIng?'添加子菜单':'添加菜单'" :visible.sync="insertMenuVisible" width="30%"
               :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="menuForm" label-width="80px">
        <el-form-item label="菜单类型">
          <el-input v-model="menuForm.type"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单">
          <c_select
            style="width: 100%;"
            @changeSelectedValue="setMenuAddMenuSelected"
            :beforeOptions="{
                'option':[
                  {
                    value: '0',
                    label: '主菜单'
                  }
                ]
              }"
            :initValue="{
                'value': menuForm.parentId
              }"
            :disabled="addSubMenuIng"
            placeholder="请选择上级菜单"
            target="menu"
            ref="addMenu"
          />
        </el-form-item>
        <el-form-item label="菜单路径" :rules="[{ required: true, message: '菜单路径不能为空'}]">
          <el-input v-model="menuForm.path"></el-input>
        </el-form-item>
        <el-form-item label="菜单名" :rules="[{ required: true, message: '菜单名不能为空'}]">
          <el-input v-model="menuForm.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="menuForm.description"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="menuForm.orderNum"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标">
          <el-input v-model="menuForm.icon"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="dialogCancel">取 消</el-button>
        <el-button type="primary" @click="dialogInsertMenu(menuForm)">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
  import c_select from '@/components/commonSelect'

  export default {
    name: 'menus',
    created () {
      this.getMenuList()
      console.log(this.select)
    },
    components: {
      c_select
    },
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        daterange: [],
        menuParam: {
          startTime: '',
          endTime: '',
          name: '',
          //当前每页显示多少条数据
          pageSize: 0,
          //当前的页数
          pageCurrent: 0
        },
        //用于渲染菜单列表
        menuList: [],
        total: 0,
        //单开抽屉
        drawer: false,
        //菜单表单对象
        menuForm: {
          type: '',
          name: '',
          description: '',
          path: '',
          icon: '',
          orderNum: '',
          parentId: ''
        },
        //添加菜单弹出对话框
        insertMenuVisible: false,
        //修改某个菜单的id
        updateMenuId: '',
        //加载
        loading: true,
        addSubMenuIng: false,
        subMenuShow: false,
        subMenuList: [],
        subMenuData: {}
      }
    },
    methods: {
      showSubMenu (row) {
        this.subMenuShow = true
        this.subMenuData = row
        this.getSubMenuList()
      },
      getSubMenuList () {
        this.ajaxFn.post({
          url: 'emall-ums-service/menu/menulist',
          data: {
            id: this.subMenuData.id,
            pageSize: 9999,
            pageCurrent: 1
          }
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.subMenuList = res.data.data.records
            }
          }
        })
      },
      //获取菜单信息
      getMenuList () {
        this.ajaxFn.post({
          url: 'emall-ums-service/menu/menulist',
          data: this.menuParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.menuList = res.data.data.records
              this.total = parseInt(res.data.data.total)
            }
          }
        })
      },
      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.menuParam.size = newSize
        this.getMenuList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        this.menuParam.current = newPage
        this.getMenuList()
      },
      //查询搜索
      searchList () {
        this.getMenuList()
      },
      //重置请求参数
      resetSearch () {
        this.daterange = null
        this.menuParam.name = ''
        this.menuParam.current = 0
        this.menuParam.size = 10
      },
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          this.menuParam.startTime = e[0]
          this.menuParam.endTime = e[1]
        }
      },
      //添加菜单
      addMenu () {
        this.addSubMenuIng = false
        this.menuForm.parentId = ''
        //打开对话框
        this.insertMenuVisible = true
      },
      addSubMenu (row) {
        this.addSubMenuIng = true
        this.menuForm.parentId = this.subMenuData.id
        //打开对话框
        this.insertMenuVisible = true
      },
      //对话框---取消添加
      dialogCancel () {
        this.clearMenuForm()
        this.insertMenuVisible = false
      },
      //对话框---提交
      dialogInsertMenu (menuForm) {
        this.ajaxFn.post({
          url: 'emall-ums-service/menu',
          data: menuForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.insertMenuVisible = false
              this.$message.success('添加成功')
              this.menuParam.pageCurrent = 1
              if (this.subMenuShow) {
                this.getSubMenuList()
              } else {
                this.getMenuList()
                this.$refs.addMenu.refresh()
              }
              this.clearMenuForm()
            }
          }
        })
      },
      //操作---更新菜单
      updateMenu (row) {
        this.menuForm = JSON.parse(JSON.stringify(row))
        this.drawer = true
      },
      //操作---删除菜单
      deleteMenu (id) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-ums-service/menu'
          }, [id]).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.menuParam.pageCurrent = 1
                if (this.subMenuShow) {
                  this.getSubMenuList()
                } else {
                  this.getMenuList()
                  this.$refs.addMenu.refresh()
                }
                this.clearMenuForm()
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
      //抽屉---更新菜单信息
      drawerUpdateDo () {
        this.ajaxFn.put({
          url: 'emall-ums-service/menu',
          data: this.menuForm
        }, [this.menuForm.id]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.drawer = false
              this.$message.success('修改成功')
              this.menuParam.pageCurrent = 1

              if (this.subMenuShow) {
                this.getSubMenuList()
              } else {
                this.getMenuList()
                this.$refs.addMenu.refresh()
              }
              this.clearMenuForm()
            }
          }
        })
      },
      //抽屉---取消
      drawerBackDo () {
        this.drawer = false
        this.updateMenuId = ''
        this.clearMenuForm()
      },
      //清空表单数据
      clearMenuForm () {
        this.menuForm.type = ''
        this.menuForm.icon = ''
        this.menuForm.description = ''
        this.menuForm.name = ''
        this.menuForm.orderNum = ''
        this.menuForm.path = ''
        this.menuForm.description = ''
        this.menuForm.parentId = ''
      },
      setMenuAddMenuSelected (val, obj) {
        this.menuForm.parentId = val
      },
      setEditMenuSelected (val, obj) {
        this.menuForm.parentId = val
      }
    }
  }
</script>

<style scoped>
  @import "./menu.less";
</style>
