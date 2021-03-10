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
          @click="uploadBatch"
          size="small">
          批量导入
        </el-button>
        <el-button
          style="float:right;margin-left: 15px;"
          type="success"
          @click="addProduct"
          size="small">
          添加
        </el-button>
        <el-button
          style="float:right;margin-left: 15px;"
          type="danger"
          @click="deleteBatch"
          size="small">
          批量删除
        </el-button>
        <el-button
          style="float:right;margin-left: 15px;"
          type="warning"
          @click="offProductBatch"
          size="small">
          批量下架
        </el-button>
        <el-button
          style="float:right"
          @click="resetSearch"
          size="small" type="info">
          重置
        </el-button>
        <div style="margin-top: 20px">
          <el-form :inline="true" :model="productParam" size="small" label-width="140px">
            <el-form-item label="商品名称：">
              <el-input v-model="productParam.name" class="input-width" placeholder="" clearable></el-input>
            </el-form-item>
            <el-form-item label="品类：">
              <el-cascader
                clearable
                v-model="categoryValue"
                :options="categoryList"
                :props="{ expandTrigger: 'click',value: 'id', label: 'name'}">
              </el-cascader>
            </el-form-item>
            <el-form-item label="品牌：">
              <el-select v-model="productParam.brandId" placeholder="请选择" clearable>
                <el-option
                  v-for="item in brandList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="活动状态：">
              <el-select v-model="productParam.deleteStatus" placeholder="请选择" clearable>
                <el-option value="0" label="活动"></el-option>
                <el-option value="1" label="非活动"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="上架状态：">
              <el-select v-model="productParam.publishStatus" placeholder="请选择" clearable>
                <el-option value="0" label="上架"></el-option>
                <el-option value="1" label="下架"></el-option>
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

      <!--数据展示区-->
      <el-table :data="productList" border stripe v-loading="loading" is-scrolling-none
                :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column property="checked" width="40px">
          <template slot-scope="scope" slot="header">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
                         @change="handleCheckAllChange"></el-checkbox>
          </template>
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.checked"
                         @change="handleCheckedItemChange(scope.row,scope.$index)"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="商品图片">
          <template slot-scope="scope"><img style="height: 60px;width: 60px;" :src="scope.row.albumPics || defaultPicture"></template>
        </el-table-column>
        <el-table-column prop="brandName" label="品牌名"></el-table-column>
        <el-table-column prop="productNo" label="商品货号"></el-table-column>
        <el-table-column prop="categoryName" label="品类"></el-table-column>
        <el-table-column prop="name" label="商品名"></el-table-column>
        <el-table-column label="单价|市价">
          <template slot-scope="scope">
            <span>单价：￥{{scope.row.price}}</span>
            <br>
            <span>市价：￥{{scope.row.marketPrice}}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-row style="margin-bottom: 10px">
              <span>上架：</span>
              <el-switch
                v-model="scope.row.publishStatus"
                :active-value="0"
                :inactive-value="1" @change="updateStatus(scope.row,'publish_status')">
              </el-switch>
            </el-row>
            <el-row style="margin-bottom: 10px">
              <span>新品：</span>
              <el-switch
                v-model="scope.row.newStatus"
                :active-value="0"
                :inactive-value="1" @change="updateStatus(scope.row,'new_status')">
              </el-switch>
            </el-row>
            <el-row>
              <span>推荐：</span>
              <el-switch
                v-model="scope.row.recommandStatus"
                :active-value="0"
                :inactive-value="1" @change="updateStatus(scope.row,'recommand_status')">
              </el-switch>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column label="审核状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.verifyStatus=== 0" type='success'>
              已审核
            </el-tag>
            <el-tag v-if="scope.row.verifyStatus===1" type='danger'>
              未审核
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="活动状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.deleteStatus"
              :active-value="0"
              :inactive-value="1" @change="updateStatus(scope.row),'delete_status'">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit"
                         @click="updateAttribute(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete"
                         @click="deleteAttribute(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="productParam.current"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="productParam.size"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  import defaultPicture from '@/assets/picture/default/default.png'
  export default {
    name: 'productList',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        productParam: {
          name: '',
          productCategoryId: '',
          brandId: '',
          deleteStatus: '',
          publishStatus: '',
          //当前每页显示多少条数据
          size: 10,
          //当前的页数
          current: 1,
          startTime: '',
          endTime: ''
        },
        //分页总条数
        total: 0,
        //商品列表信息
        productList: [],
        //列表加载
        loading: false,
        //日期范围
        daterange: null,
        switchOn: {
          active: 0,
          inactive: 1
        },
        //筛选-品牌列表
        brandList: [],
        //筛选-品类列表
        categoryList: [],
        categoryValue: null,
        //数据列表中--复选框
        checkAll: false,        //控制是否选中“所有”
        checkedItem: [],        //所选的项
        isIndeterminate: false, //用于控制父级复选框的状态
        dataKey: 'id',

        //默认图片
        defaultPicture: defaultPicture,
      }
    },
    //观察品类表达式的值
    watch: {
      categoryValue: function (object) {
        if (object != null && object.length != 0) {
          this.productParam.productCategoryId = object[object.length - 1]
        } else {
          this.productParam.productCategoryId = null
        }
      }
    },

    created () {
      //获取商品列表
      this.getProductList()
      //获取品牌列表
      this.getBrandList()
      //获取类别
      this.getProductCateId()
    },
    methods: {
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          this.productParam.startTime = e[0]
          this.productParam.endTime = e[1]
        }
      },

      searchList () {
        this.getProductList()
      },

      //获取品牌筛选目录
      getBrandList () {
        let param = {
          current: 0,
          size: 9999
        }
        this.ajaxFn.post({
          url: '/emall-goods-service/brand/brandlist',
          data: param
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            let memberPriceList = []
            if (this.ajaxFn.respIsTrue(data)) {
              this.brandList = data.data.records
            }
          }
        })
      },

      //获取品类筛选目录
      getProductCateId () {
        let _this = this
        this.ajaxFn.get({
          url: 'emall-goods-service/productCat/getCategory'
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              _this.categoryList = res.data.data
            }
          }
        })
      },

      getProductList () {
        this.ajaxFn.post({
          url: 'emall-goods-service/product/productlist',
          data: this.productParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.productList = res.data.data.records
              this.total = parseInt(res.data.data.total)
            }
          }
        })

      },

      //添加商品信息
      addProduct () {
        this.$router.push('/productAdd')
      },

      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.productParam.size = newSize
        this.getProductList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        console.log(newPage)
        this.productParam.current = newPage
        this.getProductList()
      },

      //复选框选择所有项操作
      handleCheckAllChange (val) {
        this.checkedItem = []  //用于控制重置所选项
        this.isIndeterminate = false
        let productData = this.productList
        if (this.checkAll) {
          for (let nx = 0; nx < productData.length; nx++) {
            let resData = productData[nx]
            this.checkedItem.push(resData.id)
            productData[nx].checked = true
          }
        } else {
          for (let nx = 0; nx < productData.length; nx++) {
            productData[nx].checked = false
          }
        }
        this.productList = productData
      },

      //单项复选框操作
      handleCheckedItemChange (value, idx) {
        let productItemData = this.productList
        this.$set(productItemData[idx], 'checked', value.checked)
        if (value.checked) {
          this.checkedItem.push(value.id)
        } else {
          for (let nx = 0; nx < this.checkedItem.length; nx++) {
            if (value.id === this.checkedItem[nx]) {
              this.checkedItem.splice(nx, 1)
            }
          }
        }
        if (this.checkedItem.length === 0) {
          this.isIndeterminate = false
          this.checkAll = false
        } else {
          if (this.checkedItem.length === productItemData.length) {
            this.checkAll = true
            this.isIndeterminate = false
          } else {
            this.checkAll = false
            this.isIndeterminate = true
          }
        }
      },

      /******************************状态的更新******************************/
      updateStatus (row, type) {
        const status = row.status == false ? 0 : 1
        this.ajaxFn.post({
          url: '/emall-goods-service/product/updateStatus'
        }, [row.id, status, type]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('修改成功')
              this.getProductList()
            }
          }
        })
      },
      /********************************************************************/

      /***************************批量删除商品信息****************************/
      deleteBatch () {
        if (this.checkedItem.length === 0) {
          this.$message.info('请选择需要删除的选项!')
        }
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-goods-service/product',
          }, this.checkedItem.join(',')).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.checkAll = false
                this.productParam.current = 1
                this.checkedItem = []
                this.getProductList()
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
      /***************************************************************/

      /************************操作--删除单条商品记录*********************/
      deleteAttribute (id) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-goods-service/product',
          }, id).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.checkAll = false
                this.productParam.current = 1
                this.getProductList()
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
      /***************************************************************/

      //批量下架商品
      offProductBatch () {
        this.$confirm('确定要下架吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.put({
            url: 'emall-goods-service/off',
          }, this.checkedItem.join(',')).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.productParam.current = 1
                this.checkedItem = []
                this.getProductList()
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

      //更新商品信息
      updateAttribute (row) {
        this.$router.push({
          path: '/productUpdate',
          query: { productId: row.id }
        })
      },

      //重置参数
      resetSearch () {
        this.productParam.name = ''
        this.productParam.category = ''
        this.productParam.brandId = ''
        this.productParam.deleteStatus = ''
        this.productParam.publishStatus = ''
        this.attributeParam.current = 0
        this.attributeParam.size = 10
        this.daterange = null
      }
    }
  }
</script>

<style scoped>

</style>
