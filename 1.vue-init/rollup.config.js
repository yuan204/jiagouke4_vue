import babel from 'rollup-plugin-babel'

// 常见的模块规范 import export (ESModule)   module.exports require (commonjs)
// AMD 比较老的模块规范  systemjs 模块规范

// ES6Module  commonjs  umd(支持amd 和 cmd  Vue)
export default {
    input: './src/index.js', // 打包项目的入口文件
    output: {
        file: 'dist/vue.js', // 打包出的文件结果放在哪个目录
        format:'umd', // 打包后的结果是umd模块规范
        name:'Vue',
        sourcemap: true
    },
    plugins:[ 
        babel({ // 
            exclude:"./node_modules/**"  // glob的写法
        })
    ]
}
