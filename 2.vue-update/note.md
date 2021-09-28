
## 1.整个的依赖收集过程
- 我们会走defineReactive方法把每个属性进行劫持，我们给每个属性都配置了一个dep （dep的目的是为了收集watcher）
- 开始渲染组件之前， 我把组件渲染的watcher绑定到了Dep.target上
- 开始渲染逻辑会调用render方法，此时会发生取值操作 肯定会触发get方法. 此时Dep.target有值，我就让dep和watcher创建关系
- 我们会得到属性中对应的dep中存放一个数组watchers 用来存储哪个watcher用到了此属性，同样watcher也会存储这所依赖的所有属性 deps

> 每个属性有一个dep ，dep记住了对应的watcher （watcher就是渲染逻辑）