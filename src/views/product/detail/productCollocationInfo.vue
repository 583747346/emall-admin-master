<template>
  <div class="product-collocation-info">
    <el-card shadow="never">
      <el-form label-width="120px" style="margin-top:20px;width: 100%">
        <el-form-item label="搭配：">
          <template>
            <el-transfer filterable
                         :filter-method="filterMethod"
                         filter-placeholder="请输入专题名称"
                         class="product-transfer" v-model="values"
                         :data="data">
            </el-transfer>
          </template>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item label="分类：">
          <el-cascader
            v-model="selectCategory"
            :options="categorylevel"
            :props="{ expandTrigger: 'click',value: 'id', label: 'name'}"
            :clearable=true>
          </el-cascader>
        </el-form-item>
        <el-form-item style="display: inline-block">
          <div style="float: left;">
            <div class="collocation">
              <label class="goods-desc">当前商品：</label>
              <el-select v-model="data1">
                <el-option v-for="item in currentProduct"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="collocation">
              <label class="goods-desc">搭配商品：</label>
              <el-select v-model="data2">
                <el-option v-for="item in matchProdcut"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
          <div style="float: left;">
            <div><img src="src/assets/sku/Jack.jpg" class="image"></div>
            <div><img src="src/assets/sku/kuzi.jpg" class="image"></div>
          </div>
        </el-form-item>
        <el-form-item style="text-align: center">
          <el-button type="danger" size="medium" style="width: 80px" @click="handlePre"
                     icon="el-icon-back"></el-button>
          <el-button type="success" size="medium" style="width: 80px" @click="commitProduct"
                     icon="el-icon-check"></el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'productCollocation',
    props: {
      productForm: Object,
    },
    data () {
      const generateData = _ => {
        const data = []
        for (let i = 1; i <= 15; i++) {
          data.push({
            key: i,
            label: `备选项 ${i}`,
            disabled: i % 4 === 0
          })
        }
        return data
      }
      return {
        //分类商品层级
        categorylevel: [],
        selectCategory: [],
        currentProduct: [{
          value: '',
          label: ''
        }],
        data1: '',
        matchProdcut: [{
          value: '',
          label: ''
        }],
        data2: '',
        data: generateData(),
        values: [1, 4]
      }
    },
    created () {
      //获取分类信息

    },
    methods: {
      //获取筛选条件值--分类层级
      getCategoryLevel () {
        let _this = this
        this.ajaxFn.get({
          url: 'emall-goods-service/productCat/getCategory'
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
      filterMethod () {

      },
      //上一步
      handlePre () {
        this.$emit('preStep')
      },
      commitProduct () {
        console.log(this)
        this.$emit('saveProduct')
      }
    }
  }
</script>

<style scoped>
  .product-collocation-info {
    left: 0;
    right: 0;
    width: 900px;
    padding: 35px 0px 0px 35px;
    margin: 0 auto;
  }

  .el-transfer-panel {
    height: 500px;
  }

  > el-transfer .el-transfer-panel__body {
    height: 500px !important;
  }

  .el-transfer-panel__list {
    height: 500px !important;
  }

  .collocation {
    margin: 80px 0;
    margin-left: -83px;
  }

  .image {
    width: 200px;
    height: 200px;
    margin-left: 200px;
  }

  .el-form-item .el-form-item__content {
    display: flex;
  }

  .goods-desc {
    text-align: right;
    vertical-align: middle;
    float: left;
    font-size: 14px;
    color: #606266;
    line-height: 40px;
    padding: 0 12px 0 0;
    box-sizing: border-box;
  }
</style>
