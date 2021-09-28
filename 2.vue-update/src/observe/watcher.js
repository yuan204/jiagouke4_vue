import Dep from "./dep";
import { queueWatcher } from "./schedular";
let wid = 0;
class Watcher{
    constructor(vm,fn,cb,options){
        this.vm = vm;
        this.fn = fn;
        this.cn = cb;
        this.options = options
        this.deps = [];
        this.depsId = new Set()
        this.id = wid++
        this.get(); // 实现页面的渲染
    }
    get(){
        // todo ....
        Dep.target = this
        this.fn(); // 去实例中取值  触发getter
        Dep.target = null;
        // 只有在渲染的时候才有Dep.target属性
    }
    addDep(dep){
        let id = dep.id;// 获取收集器的id 做去重操作
        if(!this.depsId.has(id)){
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addWatcher(this)
        }
    }
    update(){
        queueWatcher(this);
    }
    run(){
        console.log('run')
        this.get();
    }
}



// 让属性记住对应的渲染函数，如果属性发生变化就调用对应的渲染函数

// 我们给每个属性增加一个收集器， 通过收集器来收集watcher

// 一个属性有一个dep -》 watcher？ 一个属性对应多个watcher
// 一个watcher 对应多少个dep？ 一个watcher对应多个dep

// 多对多

export default Watcher