(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      this.walk(data);
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象 尽量不用for in （会遍历原型链）
        var keys = Object.keys(data);
        keys.forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }(); // 性能不好的原因在于 所有的属性都被重新定义了一遍
  // 一上来需要将对象深度代理 性能差


  function defineReactive(data, key, value) {
    //  闭包
    // 属性会全部被重写增加了get和set
    observe(value); // 递归代理属性

    Object.defineProperty(data, key, {
      get: function get() {
        // vm.xxx
        return value;
      },
      set: function set(newValue) {
        // vm.xxx = {a:1} 赋值一个对象的话 也可以实现响应式数据
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
      }
    });
  }

  function observe(data) {
    if (_typeof(data) !== 'object' || data == null) {
      return; // 如果不是对象类型，那么不要做任何处理
    } // 我稍后要区分 如果一个对象已经被观测了，就不要再次被观测了
    // __ob__ 标识是否有被观测过


    return new Observer(data);
  }

  function initState(vm) {
    var options = vm.$options; // 后续实现计算属性 、 watcher 、 props 、methods

    if (options.data) {
      initData(vm);
    }
  }

  function initData(vm) {
    var data = vm.$options.data; // 如果是函数就拿到函数的返回值 否则就直接采用data作为数据源

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 属性劫持 采用defineProperty将所有的属性进行劫持

    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      debugger;
      var vm = this;
      vm.$options = options; // 所有后续的扩展方法都有一个$options选项可以获取用户的所有选项
      // 对于实例的数据源 props data methods computed watch
      // props data

      initState(vm); // vue中会判断如果是$开头的属性不会被变成响应式数据
    };
  }

  // 整个自己编写的Vue的入口

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); // 后续在扩展都可以采用这种方式

  return Vue;

}));
//# sourceMappingURL=vue.js.map
