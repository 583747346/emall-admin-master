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
          @click="addResource"
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
          <el-form :inline="true" :model="resourceParam" size="small" label-width="140px">
            <el-form-item label="资源名：">
              <el-input v-model="resourceParam.name" class="input-width" placeholder="" clearable></el-input>
            </el-form-item>
            <el-form-item label="请求方法：">
              <el-select v-model="resourceParam.method" clearable placeholder="请选择">
                <el-option
                  v-for="item in methods"
                  :key="item.value"
                  :label="item.label"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="请求类型：">
              <el-select v-model="resourceParam.type" clearable placeholder="请选择">
                <el-option
                  v-for="item in types"
                  :key="item.value"
                  :label="item.label"
                  :value="item">
                </el-option>
              </el-select>
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
      <el-table :data="resourceList" border stripe v-loading="loading" :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="code" label="资源code" width="200"></el-table-column>
        <el-table-column prop="type" label="资源类型"></el-table-column>
        <el-table-column prop="name" label="资源名"></el-table-column>
        <el-table-column prop="url" label="资源路径" width="250"></el-table-column>
        <el-table-column prop="method" label="请求方式"></el-table-column>
        <el-table-column prop="description" label="资源描述" width="200"></el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="200"></el-table-column>
        <el-table-column prop="createdBy" label="创建者"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope" v-if="scope.row.path !== 'home'">
            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="updateResource(scope.row)"></el-button>
            </el-tooltip>
            <!--enterable是否鼠标可以进入tooltip-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete"
                         @click="deleteResource(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="resourceParam.pageCurrent"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="resourceParam.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>

    <!--右侧滑出抽屉-->
    <el-drawer v-model="resourceForm" title="更新" :visible.sync="drawer" :with-header="false" size="40%"
               :wrapperClosable="false">
      <span class="drawer-span">资源信息更新</span>
      <!--分割线-->
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="资源类型">
            <el-select style="width: 100%;" v-model="resourceForm.type" placeholder="请选择资源类型">
              <el-option
                v-for="item in menulist"
                :key="item.id"
                :label="item.name"
                :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="资源名">
            <el-input v-model="resourceForm.name"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="resourceForm.description"></el-input>
          </el-form-item>
          <el-form-item label="资源路径">
            <el-input v-model="resourceForm.url"></el-input>
          </el-form-item>
          <el-form-item label="请求方法">
            <el-select v-model="resourceForm.method" style="width: 100%" placeholder="请选择">
              <el-option
                v-for="item in methodSelecter"
                :key="item.value"
                :label="item.value"
                :value="item">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="button_area">
            <el-button type="primary" @click="drawerUpdateDo">修 改</el-button>
            <el-button type="info" @click="drawerBackDo">取 消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <!--添加资源区域-->
    <el-dialog title="添加资源" :visible.sync="insertResourceVisible" width="30%" :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="resourceForm" label-width="80px">
        <el-form-item label="资源码" :rules="[{ required: true, message: '资源code不能为空'}]">
          <el-input v-model="resourceForm.code"></el-input>
        </el-form-item>
        <el-form-item label="资源类型" :rules="[{ required: true, message: '资源类型不能为空'}]">
          <el-select style="width: 100%;" v-model="resourceForm.type" placeholder="请选择资源类型">
            <el-option
              v-for="item in menulist"
              :key="item.id"
              :label="item.name"
              :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源路径" :rules="[{ required: true, message: '资源路径不能为空'}]">
          <el-input v-model="resourceForm.url"></el-input>
        </el-form-item>
        <el-form-item label="请求方法" :rules="[{ required: true, message: '请求方式不能为空'}]">
          <!--          <el-input v-model="resourceForm.method"></el-input>-->
          <el-select v-model="resourceForm.method" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in methodSelecter"
              :key="item.value"
              :label="item.value"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源名">
          <el-input v-model="resourceForm.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="resourceForm.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="dialogCancel">取 消</el-button>
          <el-button type="primary" @click="submit(resourceForm)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import c_select from '@/components/commonSelect'

  export default {
    components: {
      c_select
    },
    name: 'resource',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        resourceParam: {
          startTime: '',
          endTime: '',
          name: '',
          type: '',
          method: '',
          //当前每页显示多少条数据
          pageSize: 0,
          //当前的页数
          pageCurrent: 0
        },
        //用于渲染菜单列表
        resourceList: [],
        //加载
        loading: true,
        //分页total
        total: 0,
        //日期范围
        daterange: [],
        //添加按钮的对话框显示
        insertResourceVisible: false,
        //修改按钮，滑框显示控制
        drawer: false,
        //资源表单对象
        resourceForm: {
          code: '',
          type: '',
          name: '',
          description: '',
          url: '',
          method: '',
          //资源类别
          resourcekind: ''
        },
        //请求参数--请求方式
        methods: [],
        //请求参数--请求类型
        types: [],
        //资源类型--对应菜单，"资源类型"主要是分配菜单的层级展现
        menulist: [],
        //请求参数下拉框
        methodSelecter: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
      }
    },
    created () {
      this.getResourceList()
      console.log(this.select)
      //获取请求方式
      this.getResourceMethod()
      //获取请求类型
      this.getResourceType()
      //获取菜单树
      this.getSubMenus()
    },
    methods: {
      //获取菜单列表
      getSubMenus () {
        this.ajaxFn.get({
          url: 'emall-ums-service/menu/getSubMenus',
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.menulist = res.data.data
            }
          }
        })
      },
      //查询搜索
      searchList () {
        this.getResourceList()
      },
      getResourceMethod () {
        this.ajaxFn.get({
          url: 'emall-ums-service/resource/getMethods',
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.methods = res.data.data
            }
          }
        })
      },
      getResourceType () {
        this.ajaxFn.get({
          url: 'emall-ums-service/resource/getTypes',
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.types = res.data.data
            }
          }
        })
      },
      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.resourceParam.size = newSize
        this.getResourceList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        this.resourceParam.current = newPage
        this.getResourceList()
      },
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          this.resourceParam.startTime = e[0]
          this.resourceParam.endTime = e[1]
        }
      },
      //获取菜单信息
      getResourceList () {
        this.ajaxFn.post({
          url: 'emall-ums-service/resource/resourcelist',
          data: this.resourceParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.resourceList = res.data.data.records
              this.total = parseInt(res.data.data.total)
            }
          }
        })
      },
      //重置请求参数
      resetSearch () {
        this.daterange = null
        this.resourceParam.name = ''
        this.resourceParam.method = ''
        this.resourceParam.type = ''
        this.resourceParam.current = 0
        this.resourceParam.size = 10
      },
      //添加菜单
      addResource () {
        //打开对话框
        this.insertResourceVisible = true
      },
      //对话框---取消添加
      dialogCancel () {
        this.clearResourceForm()
        this.insertResourceVisible = false
      },
      //更新按钮抽屉---取消
      drawerBackDo () {
        this.drawer = false
        this.clearResourceForm()
      },
      //清空表单数据
      clearResourceForm () {
        this.resourceForm.code = ''
        this.resourceForm.name = ''
        this.resourceForm.type = ''
        this.resourceForm.description = ''
        this.resourceForm.url = ''
        this.resourceForm.method = ''
      },

      /*********************更新按钮***************/
      //操作---更新菜单
      updateResource (row) {
        this.resourceForm = JSON.parse(JSON.stringify(row))
        this.drawer = true
      },
      drawerUpdateDo () {
        console.log(this.resourceForm)
        this.ajaxFn.put({
          url: 'emall-ums-service/resource',
          data: this.resourceForm
        }, [this.resourceForm.id]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('修改成功！')
              this.drawer = false
              this.resourceParam.pageCurrent = 1
              this.getResourceList()
              this.clearResourceForm()
            }
          }
        })
      },

      //操作---删除菜单
      deleteResource (id) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-ums-service/resource'
          }, [id]).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.resourceParam.pageCurrent = 1
                this.getResourceList()
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
      //添加按钮
      submit (resourceForm) {
        this.ajaxFn.post({
          url: 'emall-ums-service/resource',
          data: resourceForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.insertResourceVisible = false
              this.$message.success('添加成功')
              this.resourceParam.pageCurrent = 1
              this.getResourceList()
              // this.$refs.addResource.refresh();
              this.clearResourceForm()
            }
          }
        })
      }

    }
  }
</script>

<style scoped>
  @import "./resource.less";
</style>
