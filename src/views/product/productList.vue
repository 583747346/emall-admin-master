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
          @click="addProduct"
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
          <el-form :inline="true" :model="productParam" size="small" label-width="140px">
            <el-form-item label="商品名称：">
              <el-input v-model="productParam.name" class="input-width" placeholder="" clearable></el-input>
            </el-form-item>
            <el-form-item label="类别：">
              <el-input v-model="productParam.category" class="input-width" placeholder="" clearable></el-input>
            </el-form-item>
            <el-form-item label="品牌：">
              <el-input v-model="productParam.brand" class="input-width" placeholder="" clearable></el-input>
            </el-form-item>
            <el-form-item label="状态：">
              <el-input v-model="productParam.deleteStatus" class="input-width" placeholder="" clearable></el-input>
            </el-form-item>
            <el-form-item label="上架状态：">
              <el-input v-model="productParam.publishStatus" class="input-width" placeholder="" clearable></el-input>
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
      <el-table :data="productList" border stripe v-loading="loading" is-scrolling-none :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品图片">
          <template slot-scope="scope"><img style="height: 60px;width: 60px;" :src="scope.row.picture"></template>
        </el-table-column>
        <el-table-column prop="brandName" label="品牌名"></el-table-column>
        <el-table-column prop="categoryName" label="品类"></el-table-column>
        <el-table-column prop="name" label="商品名"></el-table-column>

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


    </el-card>
  </div>
</template>

<script>

  export default {
    name: 'productList',
    data () {
      return {
        productParam: {
          name: '',
          category: '',
          brand: '',
          deleteStatus: '',
          publishStatus: '',
          //当前每页显示多少条数据
          size: 10,
          //当前的页数
          current: 1,
          startTime: '',
          endTime: ''
        },
        //商品列表信息
        productList: [],
        //列表加载
        loading: false,
        //日期范围
        daterange: null
      }
    },
    created () {
      //获取商品列表
      this.getProductList()
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

      getProductList () {

      },

      //添加商品信息
      addProduct () {
        this.$router.push("/productAdd")
      },

      //重置参数
      resetSearch () {
        this.productParam.name = ''
        this.productParam.category = ''
        this.productParam.brand = ''
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
