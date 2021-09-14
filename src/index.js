import multiCascader from './index.vue'

const install = (Vue) => {
  Vue.component(multiCascader.name, multiCascader)
}
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default { install }
