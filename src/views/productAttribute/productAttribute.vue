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
          style="margin-right: 15px;float:right"
          @click="resetSearch"
          size="small" type="danger">
          重置
        </el-button>
        <div style="margin-top: 20px">
          <el-form :inline="true" :model="attributeParam" size="small" label-width="140px">
            <el-form-item label="分类：" :prop="attributeParam.name">
              <el-cascader
                v-model="selectCategory"
                :options="categorylevel"
                :props="{ expandTrigger: 'click',value: 'id', label: 'name'}"
                @change="changeCategory"
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
      <!--数据展示区-->
      <el-table :data="attributeList" border stripe v-loading="loading" is-scrolling-none :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="name" label="分类名"></el-table-column>
        <el-table-column prop="specsNum" label="规格值数量"></el-table-column>
        <el-table-column prop="paramNum" label="参数数量"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini"
                       @click="getSpecs(scope.row)">查看规格
            </el-button>
            <el-button type="success" plain size="mini" :span="12"
                       @click="getParams(scope.row)">查看参数
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="attributeParam.current"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="attributeParam.size"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'attribute',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        attributeParam: {
          name: '',
          startTime: '',
          endTime: '',
          //当前每页显示多少条数据
          size: 10,
          //当前的页数
          current: 1
        },
        //筛选条件--时间范围
        daterange: null,
        //商品属性列表
        attributeList: [],
        //加载中
        loading: true,
        //总数
        total: 0,
        //switch开关
        switchOn: {
          active: 1,
          inactive: 0
        },
        //分类商品层级
        categorylevel: [],
        selectCategory: [],
      }
    },
    created () {
      //获取商品属性列表
      this.getAttributeList()
      //获取筛选条件分类层级关系
      this.getCategoryLevel()
    },
    methods: {
      //搜索按钮查询
      searchList () {
        this.getAttributeList()
      },
      //获取列表
      getAttributeList () {
        this.ajaxFn.post({
          url: 'emall-manageplat/product-attribute/attributeList',
          data: this.attributeParam,
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.attributeList = res.data.data.records
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
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          this.attributeParam.startTime = e[0]
          this.attributeParam.endTime = e[1]
        }
      },
      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.attributeParam.size = newSize
        this.getAttributeList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        console.log(newPage)
        this.attributeParam.current = newPage
        this.getAttributeList()
      },
      //查看规格值的列表
      getSpecs (row) {
        this.$router.push({
          path: '/productSpecsOrParam',
          query: {
            categoryId: row.id,
            type: 0,
            categoryName: row.name
          }
        })
      },
      //查看属性参数的列表
      getParams (row) {
        this.$router.push({
          path: '/productSpecsOrParam',
          query: {
            categoryId: row.id,
            type: 1,
            categoryName: row.name
          }
        })
      },
      changeCategory (value) {
        console.log(value)
      },
      //重置请求参数
      resetSearch () {
        this.daterange = null
        this.attributeParam.name = ''
        this.attributeParam.current = 0
        this.attributeParam.size = 10
      }
    }
  }
</script>

<style scoped>

</style>
