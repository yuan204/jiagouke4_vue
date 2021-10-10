export default function initGlobalAPI(Vue) {
    Vue.options = {}
    Vue.mixin = function(options) { // {a:1,beforeCreate:[]}   {b：2,beforeCreate:function()}
        this.options = mergeOptions(this.options, options);
        console.log(this.options,555)
        return this;
    }
}
const LIFECYCLE_HOOKS = ['beforeCreate', 'mounted'];
const strats = {}
LIFECYCLE_HOOKS.forEach(hook=>{
    strats[hook] = function(parentVal,childVal){
        if(childVal){
            if(parentVal){
                return parentVal.concat(childVal); // 最终把声明周期都合并在一起了
            }else{
                return [childVal]
            }
        }else{
            return parentVal
        }
    }
})
// 如何合并两个对象？
export function mergeOptions(parent, child) {
    const options = {}
    for (let key in parent) {
        mergeField(key);
    }
    for (let key in child) {
        if (!(key in parent)) {
            mergeField(key);
        }
    }

    function mergeField(key) {
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key];
        }

    }
    return options
}