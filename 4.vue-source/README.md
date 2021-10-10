- 先下载源代码 https://github.com/vuejs/vue
- 1.安装vue所需的依赖 `npm install`
- 2.运行开发环境，实现代码的调试 `npm run dev`
- 3.增加sourcemap 方便源代码调试


## 查看源码是怎么样打包的
- vue2采用的是flow来编写的 facebook发明的类似ts 实现代码的类型检测和标注
- scripts 放置的是打包的脚本  入口-》 出口
- src 源代码目录
    - compiler 做编译的
    - core 核心目录 
    - platform 平台代码  （我要扩展vue需要在vue的源码目录下增加自己的代码）
    - sfc 解析.vue文件的
    - shared 一些共享的代码 常量...
- 通过package.json 看到打包的时候采用的配置是scripts/config.js
- 打包的时候会将源代码打包成不同的格式 `umd`、`commonjs`、`esm`
- 打包的时候会有两个入口  entry-runtime / entry-runtime-with-compiler (在代码运行时候能否编译模板) 我们开发的时候采用的.vue文件 直接可以在打包的时候就被编译了，所以运行的时候不需要with-compiler
- 通过配置文件找到我们最终Vue的入口 
  

## Vue整个的扩展流程
- 最终上线用的肯定是entry-runtime 可以减少运行时编译模板. .vue文件在编译的时候会把template转化成了render函数，不需要运行时在转化了
- 对应runtime-with-compiler而言 先看 render->template->外部的template->template变成render函数 （重写$mount） 如果不考虑编译过程直接看runtime/index.js
- runtime/index.js 内部扩展了平台代码的指令， Vue.prototype.\__patch\__ diff算法
- core/index.js  initGlobalAPI安装全局的api
- instance/index  Vue的构造函数



## 依赖收集原理  动态属性收集watcher
- 每个属性（动态）和对象类型都会配置一个dep属性 用作依赖收集
- 每个页面在渲染的时候都会创造一个watcher， 渲染时会发生取值操作 （c会将当前watcher放到全局上）, 取值的时候就可以让dep和watcher创造关联  (watcher 调用的是_render 这个render里用到了哪个属性，才会对这个属性取值)
- 后续属性值发生变化后会让对应watcher重新渲染


