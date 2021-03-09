<template>
  <div>
    <!--数据展示区域-->
    <el-card shadow="never">
      <el-button
        style="float:left;margin-right: 15px;margin-bottom: 20px"
        type="success"
        @click="addSubCategory"
        size="small">
        添加
      </el-button>
      <el-table :data="categoryList" border stripe v-loading="loading" is-scrolling-none :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="name" label="分类名"></el-table-column>
        <el-table-column label="层级" align="center">
          <template slot-scope="scope">{{scope.row.level | levelFilter }}</template>
        </el-table-column>
        <el-table-column prop="navStatus" label="是否显示导航栏" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.navStatus" :active-value="switchOn.active"
                       :inactive-value="switchOn.inactive"
                       @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序"></el-table-column>
        <el-table-column prop="description" label="商品分类描述"></el-table-column>
        <el-table-column prop="createdTime" label="创建时间"></el-table-column>
        <el-table-column prop="createdBy" label="创建者"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit"
                         @click="updateCategory(scope.row)"></el-button>
            </el-tooltip>
            <!--enterable是否鼠标可以进入tooltip-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete"
                         @click="deleteCategory(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="添加商品子分类" :visible.sync="insertCategoryVisible" width="35%" :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="categoryForm" label-width="90px">
        <el-form-item label="分类名">
          <el-input v-model="categoryForm.name"></el-input>
        </el-form-item>
        <el-form-item label="分类层级">
          <el-select v-model="categoryForm.level" placeholder="请选择">
            <el-option v-if="item.value===2"
                       v-for="item in levels"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model.number="categoryForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="显示导航栏">
          <template>
            <el-radio-group v-model="categoryForm.navStatus">
              <el-radio-button label="1">是</el-radio-button>
              <el-radio-button label="0">否</el-radio-button>
            </el-radio-group>
          </template>
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input v-model="categoryForm.description" placeholder="请输入内容" type="textarea" :autosize="true"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="dialogCancel()">取 消</el-button>
          <el-button type="primary" @click="submit()">确 定</el-button>
      </span>
    </el-dialog>

    <!--右侧滑出抽屉-->
    <el-drawer v-model="categoryForm" title="更新商品子分类信息" :visible.sync="drawer" :with-header="false" size="40%"
               :wrapperClosable="false">
      <span class="drawer-span">更新商品子分类信息</span>
      <!--分割线-->
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="分类名">
            <el-input v-model="categoryForm.name"></el-input>
          </el-form-item>
          <el-form-item label="分类层级">
            <el-select v-model="categoryForm.level" placeholder="请选择">
              <el-option v-if="item.value===2"
                         v-for="item in levels"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input v-model.number="categoryForm.sort"></el-input>
          </el-form-item>
          <el-form-item label="显示导航栏">
            <el-radio-group v-model="categoryForm.navStatus">
              <el-radio-button label="1">是</el-radio-button>
              <el-radio-button label="0">否</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="分类描述">
            <el-input v-model="categoryForm.description" placeholder="请输入内容" type="textarea"
                      :autosize="true"></el-input>
          </el-form-item>
          <el-form-item class="button_area">
            <el-button type="primary" @click="drawerUpdate">修 改</el-button>
            <el-button type="info" @click="drawerBack">取 消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  export default {
    name: 'subcategory',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        //加载
        loading: true,
        //分类数据列表
        categoryList: [],
        //switch开关
        switchOn: {
          active: 1,
          inactive: 0
        },
        //添加按钮--展开dialogue
        insertCategoryVisible: false,
        //修改按钮--展开抽屉
        drawer: false,
        //更新按钮的id
        updateCategoryId: '',
        //商品分类品类
        categoryForm: {
          parentId: 0,
          name: '',
          level: 2,
          sort: 0,
          description: '',
          navStatus: 0
        },
        //分类层级下拉
        levels: [{
          value: 1,
          label: '一级'
        }, {
          value: 2,
          label: '二级'
        }],
        //父分类id
        parentId: ''
      }
    },
    created () {
      //获取路由请求参数
      this.parentId = this.$route.query.categoryId
      //获取分类列表
      this.getCategoryList()
    },
    methods: {
      //查询搜索
      searchList () {
        this.getCategoryList()
      },
      //查询商品分类列表
      getCategoryList () {
        let param = { level: 2 }
        this.ajaxFn.get({
          url: 'emall-goods-service/productCat/' + this.parentId,
          data: param
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.categoryList = res.data.data
            }
          }
        })
      },

      //添加分类
      addCategory () {
        this.categoryForm.parentId = this.parentId
        this.insertCategoryVisible = true
      },
      //修改导航栏状态显示
      statusChange (row) {
        const status = row.navStatus === false ? 1 : 0
        this.ajaxFn.put({
          url: 'emall-goods-service/productCat/updateStatusById'
        }, [row.id, status]).then(res => {
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('修改成功！')
              this.clearForm()
              this.getCategoryList()
            }
          }
        })
      },
      //删除分类
      deleteCategory (categoryId) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-goods-service/productCat'
          }, [categoryId]).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.clearForm()
                this.getCategoryList()
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
      //修改分类信息
      updateCategory (category) {
        this.categoryForm = JSON.parse(JSON.stringify(category))
        this.updateCategoryId = category.id
        this.drawer = true
      },

      //添加按钮对话框---取消按钮
      dialogCancel () {
        this.clearForm()
        this.insertCategoryVisible = false
      },

      //添加按钮对话框---添加保存
      submit () {
        this.ajaxFn.post({
          url: 'emall-goods-service/productCat',
          data: this.categoryForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.insertCategoryVisible = false
              this.getCategoryList()
              this.clearForm()
              this.$message.success('添加成功！')
            }
          }
        })
      },

      //修改按钮---抽屉---取消
      drawerBack () {
        this.clearForm()
        this.drawer = false
      },
      //修改按钮---抽屉---提交保存
      drawerUpdate () {
        this.ajaxFn.put({
          url: 'emall-goods-service/productCat/' + this.updateCategoryId,
          data: this.categoryForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.drawer = false
              this.getCategoryList()
              this.clearForm()
              this.$message.success('修改成功！')
            }
          }
        })
      },

      //清空表单
      clearForm () {
        this.categoryForm.name = ''
        this.categoryForm.level = ''
        this.categoryForm.navStatus = 0
        this.categoryForm.sort = 0
        this.categoryForm.description = ''
      },
      //类别层级---级联选择
      handleChange (value) {
        console.log(value)
      },
      //分类级别选择
      selectlevel (event) {
        this.categoryForm.level = event
      },
      //分配子商品分类
      addSubCategory (categoryId) {
        this.insertCategoryVisible = true
      },
    },
    filters: {
      levelFilter (value) {
        if (value === 1) {
          return '一级'
        } else if (value === 2) {
          return '二级'
        }
      },
      disableNextLevel (value) {
        if (value === 0) {
          return false
        } else {
          return true
        }
      },
    }
  }
</script>

<style lang="less" scoped>
  @import "src/views/category/subcategory";
</style>
