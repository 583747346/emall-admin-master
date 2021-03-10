<template>
  <product-detais :is-edit='true' :product-id="productId"></product-detais>
</template>

<script>
  import productDetais from '../detail/productDetais'

  export default {
    name: 'productUpdate',
    components: {
      productDetais
    },
    data () {
      return {
        productId: ''
      }
    },
    created () {
      //获取路由请求参数--商品id
      this.productId = this.$route.query.productId
    }
  }
</script>

<style scoped>

</style>
