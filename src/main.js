import Vue from 'vue'
import App from './App.vue'
import '@/assets/style.less'

const components = require.context('@/components', true, /\.vue$/)
components.keys().forEach(fileName => {
  const componentName = components(fileName).default.name
  if (componentName) {
      Vue.component(componentName, components(fileName).default)
  }
})
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
