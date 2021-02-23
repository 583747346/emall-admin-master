<template>
  <div class="product-basic">
    <el-form :model="productForm" ref="productInfoForm" label-width="120px" style="width: 600px" size="small"
             :rules="productBasicRules">
      <el-form-item label="商品分类：" prop="productCategoryId">
        <el-cascader
          v-model="selectProductCateIds"
          :options="productCateOptions"
          :props="{ expandTrigger: 'click',value: 'id', label: 'name'}"
          clearable>
        </el-cascader>
      </el-form-item>
      <el-form-item label="商品名称：" prop="name">
        <el-input v-model="productForm.name"></el-input>
      </el-form-item>
      <el-form-item label="副标题：" prop="subTitle">
        <el-input v-model="productForm.subTitle"></el-input>
      </el-form-item>
      <el-form-item label="商品品牌：" prop="brandId">
        <el-select
          v-model="productForm.brandId"
          @change="handleBrandChange"
          placeholder="请选择品牌" clearable>
          <el-option
            v-for="item in brandList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品介绍：">
        <el-input
          :autoSize="true"
          v-model="productForm.description"
          type="textarea"
          placeholder="请输入内容..."></el-input>
      </el-form-item>
      <el-form-item label="商品货号：">
        <el-input v-model="productForm.productSn"></el-input>
      </el-form-item>
      <el-form-item label="商品售价：">
        <el-input v-model="productForm.price"></el-input>
      </el-form-item>
      <el-form-item label="市场价：">
        <el-input v-model="productForm.originalPrice"></el-input>
      </el-form-item>
      <el-form-item label="计量单位：">
        <el-select v-model="productForm.unit" placeholder="请选择" size="small">
          <el-option
            v-for="item in productUnitSelecter"
            :key="item.id"
            :label="item.unit"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品重量：">
        <el-input v-model="productForm.weight">
          <i slot="suffix" style="font-style:normal;margin-right: 10px;color: #42b983;">克</i>
        </el-input>
      </el-form-item>
      <el-form-item label="排序：">
        <el-input-number v-model="productForm.sort" controls-position="right" :min="0"></el-input-number>
      </el-form-item>
      <el-form-item label="商品备注：">
        <el-input
          :autoSize="true"
          v-model="productForm.note"
          type="textarea"
          placeholder="请输入内容..."></el-input>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="success" size="medium" style="width: 80px" @click="handleNext('productInfoForm')"
                   icon="el-icon-right"></el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

  export default {
    name: 'productBasicInfo',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        //所有的品类树
        productCateOptions: [],
        //选中的品类ids集合【包括父级】
        selectProductCateIds: [],
        //品牌列表
        brandList: [],
        //商品单位列表
        productUnitSelecter: [],
        //规则校验
        productBasicRules: {
          productCategoryId: [{
            required: true,
            message: '请选择商品分类',
            trigger: 'change'
          }],
          brandId: [{
            required: true,
            message: '请选择所属品牌',
            trigger: 'blur'
          }],
          name: [
            {
              required: true,
              message: '请输入商品名称',
              trigger: 'blur'
            },
            {
              min: 4,
              max: 64,
              message: '长度在 4 到 64 个字符',
              trigger: 'blur'
            }
          ],
        },
        cateId: this.categoryId
      }
    },
    props: {
      productForm: Object,
      categoryId: [String]
    },
    //观察某个表达式的值
    watch: {
      selectProductCateIds: function (object) {
        console.log(object)
        if (object != null) {
          this.productForm.productCategoryId = object[object.length - 1]
          this.cateId = object[object.length - 1]
          this.$emit('inputs', this.cateId)
        }
      }
    },
    created () {
      //获取分类层级
      this.getCategoryRank()
      //获取品牌列表
      this.getBrandList()
      //获取商品单位
      this.getProductUnitList()
    },
    methods: {
      //获取筛选条件值--分类层级
      getCategoryRank () {
        let _this = this
        this.ajaxFn.get({
          url: 'emall-manageplat/productCat/getCategory'
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              _this.productCateOptions = res.data.data
              for (let i = 0; i < res.data.data.length; i++) {
                _this.selectProductCateIds.push(data.data[i].id)
              }
            }
          }
        })
      },
      //获取品牌列表
      getBrandList () {
        let param = {
          current: 0,
          size: 9999
        }
        this.ajaxFn.post({
          url: 'emall-manageplat/brand/brandlist',
          data: param
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.brandList = data.data.records
            }
          }
        })
      },
      //获取商品单位列表
      getProductUnitList () {
        let param = {
          current: 0,
          size: 9999
        }
        this.ajaxFn.post({
          url: 'emall-manageplat/product-unit/productUnitList',
          data: param
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.productUnitSelecter = data.data.records
            }
          }
        })
      },

      //获取品牌列表
      handleBrandChange () {

      },
      handleNext (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$emit('nextStep')
          } else {
            this.$message({
              message: '验证失败',
              type: 'error',
              duration: 1000
            })
            return false
          }
        })
      },
    }
  }
</script>

<style scoped>
  .product-basic {
    left: 0;
    right: 0;
    width: 720px;
    padding: 35px 0px 0px 35px;
    margin: 0 auto;
  }
</style>
