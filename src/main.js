import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import './api/http'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI)
Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App)
 
}).$mount('#app')
