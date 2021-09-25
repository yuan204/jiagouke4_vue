

class Observer{
    constructor(data){
        this.walk(data)
    }
    walk(data){ // 循环对象 尽量不用for in （会遍历原型链）
        let keys = Object.keys(data);
        keys.forEach(key=> {
            defineReactive(data,key,data[key])
        })
    }
}
// 性能不好的原因在于 所有的属性都被重新定义了一遍
// 一上来需要将对象深度代理 性能差
function defineReactive(data,key,value){ //  闭包
    // 属性会全部被重写增加了get和set
    observe(value); // 递归代理属性
    Object.defineProperty(data,key,{
        get(){ // vm.xxx
            return value;
        },
        set(newValue){ // vm.xxx = {a:1} 赋值一个对象的话 也可以实现响应式数据
            if(newValue === value) return
            observe(newValue)
            value = newValue;
        }
    })
}
export function observe(data) {
    if(typeof data !== 'object' || data == null){
        return ; // 如果不是对象类型，那么不要做任何处理
    }

    // 我稍后要区分 如果一个对象已经被观测了，就不要再次被观测了
    // __ob__ 标识是否有被观测过

    return new Observer(data)
};