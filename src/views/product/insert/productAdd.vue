<template>
  <product-detais :is-edit='true'></product-detais>
</template>

<script>
  import productDetais from '../detail/productDetais'

  export default {
    name: 'productAdd',
    components: {
      productDetais
    },
    data () {
      return {}
    },
    created () {
      //获取路由请求参数--商品id
      this.productId = this.$route.query.productId
    }
  }
</script>

<style lang="less" scoped>

</style>
