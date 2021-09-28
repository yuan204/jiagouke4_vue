let oldArrayPrototype = Array.prototype;
// arrayProptotype.__proto__ = Array.prototype;

let arrayPrototype = Object.create(oldArrayPrototype);
let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]
methods.forEach(method => { // 用户调用push方法会先经历我自己重写的方法,之后调用数组原来的方法
    arrayPrototype[method] = function(...args) {

        console.log('数组修改了')


        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args; // 数组
                break;
            case 'splice': // arr.splice(1,1,xxx)
                inserted = args.slice(2); // 接去掉前两个参数
            default:
                break
        }
        if (inserted) {
            // 对新增的数据再次进行观测
            ob.observeArray(inserted)
        }
        return oldArrayPrototype[method].call(this, ...args)
    }
})
export default arrayPrototype

