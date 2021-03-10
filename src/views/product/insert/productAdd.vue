<template>
  <product-detais :is-edit='true'></product-detais>
</template>

<script>
  import productDetais from '../detail/productDetais'

  export default {
    name: 'productAdd',
    components: {
      productDetais
    }
  }
</script>

<style lang="less" scoped>

</style>
