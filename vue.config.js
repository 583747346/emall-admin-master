const path = require('path')

const resolve = dir => {
  return path.join(__dirname, dir)
}

// 基础路径
let publicPath = process.env.VUE_APP_PUBLIC_PATH || '/'

module.exports = {
  lintOnSave: false,
  publicPath,
  devServer: {
    publicPath
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
  },
  // 设为false打包时不生成.map文件
  productionSourceMap: false
}
