import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import './assets/fontslogin/iconfont.css'
//引用富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//引入富文本css
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
//富文本编辑器添加实例
Vue.use(VueQuillEditor)

import AjaxFn from './plugin/api'

Vue.prototype._AjaxFn = AjaxFn
Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
