import { initState } from "./state";

export default function initMixin(Vue){
    Vue.prototype._init = function(options){
        debugger;
        const vm = this;
        vm.$options = options // 所有后续的扩展方法都有一个$options选项可以获取用户的所有选项
        // 对于实例的数据源 props data methods computed watch
        // props data
        initState(vm);
        // vue中会判断如果是$开头的属性不会被变成响应式数据
    }   


}

