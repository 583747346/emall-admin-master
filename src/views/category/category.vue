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
          @click="addCategory"
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
          <el-form :inline="true" :model="categoryParam" size="small" label-width="140px">
            <el-form-item label="分类：" :prop="categoryParam.name">
              <el-cascader
                v-model="selectCategory"
                :options="categorylevel"
                :props="{ expandTrigger: 'click',value: 'id', label: 'name'}"
                :clearable=true>
              </el-cascader>
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
      <el-card shadow="never">
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
              <el-tooltip effect="dark" content="查看子分类" placement="top-start">
                <el-button type="success" size="mini" icon="el-icon-setting"
                           @click="addSubCategory(scope.row.id)"></el-button>
              </el-tooltip>
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
        <!--分页区域-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                       :current-page="categoryParam.current"
                       :page-sizes="[10, 20, 50, 100]"
                       :page-size="categoryParam.size"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total">
        </el-pagination>
      </el-card>
    </el-card>

    <el-dialog title="添加商品分类" :visible.sync="insertCategoryVisible" width="35%" :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="categoryForm" label-width="90px">
        <el-form-item label="分类名">
          <el-input v-model="categoryForm.name"></el-input>
        </el-form-item>
        <el-form-item label="分类层级">
          <el-select v-model="categoryForm.level" placeholder="请选择">
            <el-option
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
    <el-drawer v-model="categoryForm" title="更新商品分类信息" :visible.sync="drawer" :with-header="false" size="40%"
               :wrapperClosable="false">
      <span class="drawer-span">更新商品分类信息</span>
      <!--分割线-->
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="分类名">
            <el-input v-model="categoryForm.name"></el-input>
          </el-form-item>
          <el-form-item label="分类层级">
            <el-select v-model="categoryForm.level" placeholder="请选择">
              <el-option
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
    name: 'category',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        //品类请求参数
        categoryParam: {
          //请求参数分类层级
          name: '',
          startTime: '',
          endTime: '',
          //当前每页显示多少条数据
          size: 10,
          //当前的页数
          current: 1
        },
        //分页总数记录
        total: 0,
        // 日期范围
        daterange: [],
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
          level: 1,
          sort: 0,
          description: '',
          navStatus: 0
        },
        //分类商品层级
        categorylevel: [],
        selectCategory: [],
        //分类层级下拉
        levels: [{
          value: 1,
          label: '一级'
        }, {
          value: 2,
          label: '二级'
        }]
      }
    },
    created () {
      this.getCategoryList()
      //获取层级关系
      this.getCategoryLevel()
    },
    methods: {
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          this.categoryParam.startTime = e[0]
          this.categoryParam.endTime = e[1]
        }
      },
      //查询搜索
      searchList () {
        this.getCategoryList()
      },
      //查询商品分类列表
      getCategoryList () {
        this.ajaxFn.post({
          url: 'emall-manageplat/productCat/categorylist',
          data: this.categoryParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.categoryList = res.data.data.records
              this.total = parseInt(res.data.data.total)
            }
          }
        })
      },

      //获取筛选条件值--分类层级
      getCategoryLevel () {
        let _this = this
        this.ajaxFn.get({
          url: 'emall-manageplat/productCat/getCategory'
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              _this.categorylevel = res.data.data
              for (let i = 0; i < res.data.data.length; i++) {
                _this.selectCategory.push(res.data.data[i].name)
              }
            }
          }
        })
      },

      //添加分类
      addCategory () {
        this.insertCategoryVisible = true
      },
      //修改导航栏状态显示
      statusChange (row) {
        const status = row.navStatus === false ? 1 : 0
        this.ajaxFn.put({
          url: 'emall-manageplat/productCat/updateStatusById'
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
            url: 'emall-manageplat/productCat'
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
      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.categoryParam.size = newSize
        this.getCategoryList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        console.log(newPage)
        this.categoryParam.current = newPage
        this.getCategoryList()
      },

      //添加按钮对话框---取消按钮
      dialogCancel () {
        this.clearForm()
        this.insertCategoryVisible = false
      },

      //添加按钮对话框---添加保存
      submit () {
        this.ajaxFn.post({
          url: 'emall-manageplat/productCat',
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
          url: 'emall-manageplat/productCat/' + this.updateCategoryId,
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

      //重置请求参数
      resetSearch () {
        this.daterange = null
        this.categoryParam.name = ''
        this.categoryParam.current = 0
        this.categoryParam.size = 10
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
        this.$router.push({
          path: '/subcategory',
          query: { categoryId: categoryId }
        })
      }
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
  @import "category";
</style>
