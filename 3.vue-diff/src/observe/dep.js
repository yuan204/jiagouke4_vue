let did = 0;
class Dep{ // 作用是收集watcher
    constructor(){
        this.id = did++;
        this.watchers = []
    }
    depend(){ // watcher 和 dep是一个多对多的关系
        Dep.target.addDep(this); // 让watcher去记录dep
    }
    addWatcher(watcher){
        this.watchers.push(watcher)
    }
    notify(){
        this.watchers.forEach(watcher=>watcher.update());
    }
}
Dep.target = null; // 描述当前watcher是谁的
export default Dep