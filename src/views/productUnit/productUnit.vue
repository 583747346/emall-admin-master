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
          @click="addProductUnit"
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
          <el-form :inline="true" :model="productUnitParam" size="small" label-width="140px">
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
      <el-table :data="productUnitList" border stripe v-loading="loading"
                :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="unit" label="商品单位"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间"></el-table-column>
        <el-table-column prop="createdBy" label="创建者"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope" v-if="scope.row.path !== 'home'">
            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit"
                         @click="updateProductUnit(scope.row)"></el-button>
            </el-tooltip>
            <!--enterable是否鼠标可以进入tooltip-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete"
                         @click="deleteProductUnit(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="productUnitParam.pageCurrent"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="productUnitParam.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>
    <!--右侧滑出抽屉-->
    <el-drawer v-model="productUnitForm" title="更新" :visible.sync="drawer" :with-header="false" size="40%"
               :wrapperClosable="false">
      <span class="drawer-span">商品单位信息更新</span>
      <!--分割线-->
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="商品单位">
            <el-input v-model="productUnitForm.unit"></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="productUnitForm.status" :active-value="1"
                       :inactive-value="0"></el-switch>
          </el-form-item>
          <el-form-item class="button_area">
            <el-button type="primary" @click="drawerUpdateDo">修 改</el-button>
            <el-button type="info" @click="drawerBackDo">取 消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <!--添加商品单位区域-->
    <el-dialog title="添加商品单位" :visible.sync="insertProductUnitVisible" width="30%"
               :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="productUnitForm" label-width="80px">
        <el-form-item label="商品单位">
          <el-input v-model="productUnitForm.unit"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="productUnitForm.status" :active-value="1"
                     :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="dialogCancel">取 消</el-button>
        <el-button type="primary" @click="dialogInsertProductUnit(productUnitForm)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'productUnit',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        productUnitParam: {
          endTime: '',
          name: '',
          //当前每页显示多少条数据
          pageSize: 0,
          //当前的页数
          pageCurrent: 0
        },
        //日期范围
        daterange: [],
        loading: true,
        //商品单位列表
        productUnitList: [],
        drawer: false,
        productUnitForm: {
          unit: '',
          status: ''
        },
        insertProductUnitVisible: false,
        total: 0,
        productUnitId: ''
      }
    },
    created () {
      //获取商品单位列表
      this.getProductUnitList()
    },
    methods: {
      //获取商品单位列表
      getProductUnitList () {
        this.ajaxFn.post({
          url: 'emall-manageplat/product-unit/productUnitList',
          data: this.productUnitParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.productUnitList = res.data.data.records
              this.total = parseInt(res.data.data.total)
            }
          }
        })
      },
      searchList () {
        this.getProductUnitList()
      },
      selectData (e) {
        if (e != null) {
          this.productUnitParam.startTime = e[0]
          this.productUnitParam.endTime = e[1]
        }
      },
      // 添加信息的商品单位信息
      addProductUnit () {
        this.insertProductUnitVisible = true
      },
      //添加按钮--提交表单
      dialogInsertProductUnit () {
        this.ajaxFn.post({
          url: 'emall-manageplat/product-unit',
          data: this.productUnitForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.clearForm()
              this.getProductUnitList()
            }
          }
        })
      },
      dialogCancel () {
        this.insertProductUnitVisible = false
        this.clearForm()
      },
      //删除按钮
      deleteProductUnit (id) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-manageplat/product-unit'
          }, [id]).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.getProductUnitList()
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
      //操作--更新按钮
      updateProductUnit (row) {
        this.productUnitForm = JSON.parse(JOSN.stringify(row))
        this.productUnitId = row.id
        this.drawer = true
      },
      //更新提交保存
      drawerUpdateDo () {
        this.ajaxFn.update({
          url: 'emall-manageplat/product-unit'
        }, [this.productUnitId]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('更新成功！')
              this.drawer = false
              this.getProductUnitList()
            }
          }
        })
      },
      drawerBackDo () {
        this.clearForm()
        this.drawer = false
      },
      //修改装填
      statusChange (row) {
        const status = row.status === false ? 0 : 1
        this.ajaxFn.put({
          url: 'emall-manageplat/product-unit'
        }, [row.id, status]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('更新成功！')
              this.getProductUnitList()
            }
          }
        })
      },
      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.productUnitParam.size = newSize
        this.getProductUnitList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        console.log(newPage)
        this.productUnitParam.current = newPage
        this.getProductUnitList()
      },
      clearForm () {
        this.productUnitForm.unit = ''
        this.productUnitForm.status = ''
      },
      resetSearch () {
        this.daterange = null
        this.productUnitParam.current = 0
        this.productUnitParam.size = 10
      }
    }
  }
</script>

<style scoped>

</style>
