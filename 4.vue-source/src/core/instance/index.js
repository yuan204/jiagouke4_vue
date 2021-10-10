import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options) // Vue的初始化方法
}
// 原型扩展
initMixin(Vue) // Vue.prototype._init
stateMixin(Vue) // $watch $delete $set
eventsMixin(Vue) // $on $off $emit $once
lifecycleMixin(Vue) // _update   mountComponent
renderMixin(Vue) // _render

export default Vue




