<template>
  <el-card shadow="never">
    <el-steps :active="active" simple style="margin: 0 50px">
      <el-step title="基本信息" icon="el-icon-edit"></el-step>
      <el-step title="促销信息" icon="el-icon-upload"></el-step>
      <el-step title="规格属性" icon="el-icon-picture"></el-step>
      <el-step title="推荐搭配" icon="el-icon-s-shop"></el-step>
    </el-steps>
    <product-basic-info v-show="showStatus[0]"
                        v-model="productForm"
                        :is-edit="isEdit"
                        :categoryId="categoryId"
                        :productForm="productForm"
                        @nextStep="nextStep"
                        @returnCateId="returnCateId">
    </product-basic-info>
    <product-sale-info v-show="showStatus[1]"
                       v-model="productForm"
                       :is-edit="isEdit"
                       :productForm="productForm"
                       @preStep="preStep"
                       @nextStep="nextStep">
    </product-sale-info>
    <product-specs-param-info v-show="showStatus[2]"
                              v-model="productForm"
                              :is-edit="isEdit"
                              :categoryId="categoryId"
                              :productForm="productForm"
                              @preStep="preStep"
                              @nextStep="nextStep">
    </product-specs-param-info>
    <product-collocation-info v-show="showStatus[3]"
                              v-model="productForm"
                              :is-edit="isEdit"
                              :productForm="productForm"
                              @preStep="preStep"
                              @saveProduct="saveProduct">
    </product-collocation-info>
  </el-card>
</template>

<script>
  import productBasicInfo from '../detail/productBasicInfo'
  import productSaleInfo from '../detail/productSaleInfo'
  import productSpecsParamInfo from '../detail/productAttributeInfo'
  import productCollocationInfo from '../detail/productCollocationInfo'

  const productFieldForm = {
    //基本信息部分
    productCategoryId: '',     //商品品类id
    productCategoryName: '',   //商品品类名
    name: '',                  //商品名
    subTitle: '',              //商品描述
    brandId: '',               //品牌id
    brandName: '',             //品牌名
    description: '',           //商品描述
    productNo: '',             //商品货号
    price: 0,                  //商品售价
    marketPrice: 0,            //市场价
    unit: '',                  //商品计量单位
    weight: '',                //重量
    sort: 0,                   //排序
    note: '',                  //备注

    //营销部分
    purchasePoint: 0,          //购买所获得的积分
    purchaseGrowth: 0,         //成长值（升级会员等级）
    usePointLimit: 0,          //积分购买限制
    promotionLimit: 0,         //商品限购数量
    publishStatus: 0,          //上架状态
    newStatus: 0,              //新品|老品
    recommandStatus: 0,        //推荐状态
    serviceList: '',           //服务保证
    detailTitle: '',           //详情页标题
    detailDesc: '',            //详细页描述
    detailContent: '',         //详情内容
    promotionType: 0,          //促销类型
    promotionStartDate: '',    //促销开始时间
    promotionEndDate: '',      //促销结束时间
    promotionPrice: 0,         //促销价格
    memberPriceForms: [],      //会员价信息数组
    fullPromotionForms: [{     //商品满减
      fullPrice: 0,
      reducePrice: 0
    }],

    //商品属性部分
    pcDetailPage: '',          //电脑端详情页
    mobileDetailPage: '',      //移动端详情页
    prodcutAttributeParams: [], //商品属性参数数组
    albumPics: '',             //商品主图
    productSkus: [],           //sku列表

    //推荐搭配部分
  }
  export default {
    name: 'productDetails',
    components: {
      productBasicInfo,
      productSaleInfo,
      productSpecsParamInfo,
      productCollocationInfo
    },
    props: {
      isEdit: {
        type: Boolean,
        default: false
      },
      productId: {
        type: String,
        default: ''
      },
    },
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        active: 0,
        showStatus: [true, false, false, false],
        //用于productAttributeinfo组件监听品类改变，加载规格
        categoryId: '',
        productForm: Object.assign({}, productFieldForm)
      }
    },

    //当时更新操作时，根据货号查看商品信息
    created () {
      if (this.isEdit) {
        this.getProduct(this.productId)
      }
    },

    methods: {

      //根据商品货号查看商品信息 TODO
      getProduct (productId) {
        this.ajaxFn.get({
          url:'/emall-goods-service/product/'+productId
        }).then(res=>{
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.productForm = data
            }
          }
        })
      },

      //inputs事件写回父组件
      returnCateId (categoryId) {
        this.categoryId = categoryId
      },
      hideAll () {
        for (let i = 0; i < this.showStatus.length; i++) {
          this.showStatus[i] = false
        }
      },
      nextStep () {
        if (this.active < this.showStatus.length - 1) {
          this.active++
          this.hideAll()
          this.showStatus[this.active] = true
        }
      },
      preStep () {
        if (this.active > 0 && this.active < this.showStatus.length) {
          this.active--
          this.hideAll()
          this.showStatus[this.active] = true
        }
      },
      //提交
      saveProduct () {
        console.log('开始保存商品数据')
        this.$confirm('是否要提交保存', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.post({
            url: 'emall-goods-service/product',
            data: this.productForm
          }).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('提交成功！')
                this.$router.push('/productList')
              }
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
