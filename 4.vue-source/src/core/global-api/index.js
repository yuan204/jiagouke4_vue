/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  //Vue.config
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // Vue.util
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  // Vue.set Vue.delete Vue.nextTick
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 小型的Vuex
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }
  // Vue.options Vue的全局选项都存在这里
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    // Vue.options.componments 
    // Vue.options.directives
    // VUe.options.filters
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue
  // 增加keep-alive组件
  extend(Vue.options.components, builtInComponents)

  initUse(Vue) // Vue.use
  initMixin(Vue) //Vue.mixin
  initExtend(Vue) //Vue.extend
  initAssetRegisters(Vue) // Vue.component Vue.directive Vue.filter
}
