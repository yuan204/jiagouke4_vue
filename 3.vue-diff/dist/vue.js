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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 用来描述标签的

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的  捕获的是结束标签的标签名

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的  分组1 拿到的是属性名  , 分组3 ，4， 5 拿到的是key对应的值

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的    />    >   

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配双花括号中间单的内容

  function parserHTML(html) {
    function advance(n) {
      html = html.substring(n); // 每次根据传入的长度截取html
    }

    var root; // 树的操作 ，需要根据开始标签和结束标签产生一个树
    // 如何构建树的父子关系

    var stack = [];

    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        attrs: attrs,
        children: [],
        parent: null,
        type: 1
      };
    }

    function start(tagName, attrs) {
      var element = createASTElement(tagName, attrs);

      if (root == null) {
        root = element;
      }

      var parent = stack[stack.length - 1]; // 取到栈中的最后一个

      if (parent) {
        element.parent = parent; // 让这个元素记住自己的父亲是谁

        parent.children.push(element); // 让父亲记住儿子是谁
      }

      stack.push(element); // 将元素放到栈中
    }

    function end(tagName) {
      stack.pop();
    }

    function chars(text) {
      text = text.replace(/\s/g, '');

      if (text) {
        var parent = stack[stack.length - 1];
        parent.children.push({
          type: 3,
          text: text
        });
      }
    } //  ast 描述的是语法本身 ，语法中没有的，不会被描述出来  虚拟dom 是描述真实dom的可以自己增添属性


    while (html) {
      // 一个个字符来解析将结果抛出去
      var textEnd = html.indexOf('<');

      if (textEnd === 0) {
        var startTagMatch = parseStartTag(); // 解析开始标签  {tag:'div',attrs:[{name:"id",value:"app"}]}

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var matches = void 0;

        if (matches = html.match(endTag)) {
          // <div>    </div>  不是开始就会走道结束
          end(matches[1]);
          advance(matches[0].length);
          continue;
        }
      }

      var text = void 0;

      if (textEnd >= 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }
    }

    function parseStartTag() {
      var matches = html.match(startTagOpen);

      if (matches) {
        var match = {
          tagName: matches[1],
          attrs: []
        };
        advance(matches[0].length); // 继续解析开始标签的属性 

        var _end, attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 只要没有匹配到结束标签就一直匹配
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
          advance(attr[0].length); // 解析一个属性删除一个
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i]; // style="color:red;background:blue"

      if (attr.name === 'style') {
        // style="{color:red,background:blue}"
        var obj = {};
        attr.value.split(';').reduce(function (memo, current) {
          var _current$split = current.split(':'),
              _current$split2 = _slicedToArray(_current$split, 2),
              key = _current$split2[0],
              value = _current$split2[1];

          memo[key] = value;
          return memo;
        }, obj);
        attr.value = obj;
      } // 特殊的属性 style


      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type === 1) {
      return genCode(node);
    } else {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")"); // 不带表达式的
      } else {
        var tokens = [];
        var match; // exec 遇到全局匹配会有 lastIndex问题 每次匹配前需要将lastIndex 置为0

        var startIndex = defaultTagRE.lastIndex = 0; // 自动会变 ，每次用的时候置为0

        while (match = defaultTagRE.exec(text)) {
          var endIndex = match.index; // 匹配到索引    abc {{ aa }} {{bb}} cd

          if (endIndex > startIndex) {
            tokens.push(JSON.stringify(text.slice(startIndex, endIndex)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          startIndex = endIndex + match[0].length;
        }

        if (startIndex < text.length) {
          // 最后的尾巴放进去
          tokens.push(JSON.stringify(text.slice(startIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")"); // 最后将动态数据 和非动态的拼接在一起
      }
    }
  }

  function genChildren(ast) {
    var children = ast.children;
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }

  function genCode(ast) {
    // 字符串拼接 拼接成我想要的就可以 
    var code;
    code = "_c(\"".concat(ast.tag, "\",").concat(ast.attrs.length ? genProps(ast.attrs) : "undefined").concat(ast.children ? ',' + genChildren(ast) : '', ")"); // _c('div',{classNanem:"xxx"},createTextVnode('hello world'))

    return code;
  } // 将模板变成render函数 通过 with + new Function的方式让字符串变成js语法来执行


  function compileToFunction(template) {
    var ast = parserHTML(template); // 通过ast语法树转化成render函数

    var code = genCode(ast);
    var render = new Function("with(this){return ".concat(code, "}")); // 将字符串变成了函数

    return render;
  } // 4.12继续
  // 将template转化成ast语法树 -》 再讲语法树转化成一个字符串拼接在一起
  // ast 是用来描述语言本身的
  // vdom 描述dom元素的

  var did = 0;

  var Dep = /*#__PURE__*/function () {
    // 作用是收集watcher
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = did++;
      this.watchers = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // watcher 和 dep是一个多对多的关系
        Dep.target.addDep(this); // 让watcher去记录dep
      }
    }, {
      key: "addWatcher",
      value: function addWatcher(watcher) {
        this.watchers.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.watchers.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null; // 描述当前watcher是谁的

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    callbacks.forEach(function (cb) {
      return cb();
    });
    callbacks = [];
    waiting = false;
  } // 异步任务分为 两种 宏任务、微任务
  // 宏任务 setTimeout setImmediate(ie下支持性能优于setTimeout)
  // 微任务 promise.then mutationObserver
  // vue在更新的时候希望尽快的更新页面 promise.then  mutationObserver  setImmediate setTimeout
  // vue3不在考虑兼容性问题了 所以后续vue3中直接使用promise.then


  var timeFunc;

  if (typeof Promise !== 'undefined') {
    var p = Promise.resolve();

    timeFunc = function timeFunc() {
      p.then(flushCallbacks);
    };
  } else if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(flushCallbacks); // mutationObserver放的回调是异步执行的

    var textNode = document.createTextNode(1); //. 文本节点内容先是1

    observer.observe(textNode, {
      characterData: true
    });

    timeFunc = function timeFunc() {
      textNode.textContent = 2; // 改成了2  就会触发更新了
    };
  } else if (typeof setImmediate !== 'undefined') {
    timeFunc = function timeFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timeFunc = function timeFunc() {
      setTimeout(flushCallbacks, 0);
    };
  }

  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      waiting = true;
      timeFunc();
    }
  }

  var queue = [];
  var has = {};
  var pending = false;

  function flushSchedularQueue() {
    queue.forEach(function (watcher) {
      return watcher.run();
    });
    queue = [];
    has = {};
    pending = false;
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (has[id] == null) {
      queue.push(watcher);
      has[id] = true;

      if (!pending) {
        nextTick(function () {
          // 万一一个属性 对应多个更新，那么可能会开启多个定时器
          flushSchedularQueue(); // 批处理操作 ， 防抖
        });
        pending = true;
      }
    }
  }

  var wid = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, fn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.fn = fn;
      this.cn = cb;
      this.options = options;
      this.deps = [];
      this.depsId = new Set();
      this.id = wid++;
      this.get(); // 实现页面的渲染
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // todo ....
        Dep.target = this;
        this.fn(); // 去实例中取值  触发getter

        Dep.target = null; // 只有在渲染的时候才有Dep.target属性
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id; // 获取收集器的id 做去重操作

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addWatcher(this);
        }
      }
    }, {
      key: "update",
      value: function update() {
        queueWatcher(this);
      }
    }, {
      key: "run",
      value: function run() {
        console.log('run');
        this.get();
      }
    }]);

    return Watcher;
  }(); // 让属性记住对应的渲染函数，如果属性发生变化就调用对应的渲染函数

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, data, children, data.key, null);
  }
  function createTextNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, data, children, key, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      children: children,
      key: key,
      text: text // ...

    };
  }

  function isSameVnode(n1, n2) {
    return n1.tag == n2.tag && n1.key === n2.key;
  }

  function patch(oldVnode, vnode) {
    // oldVnode 可能是后续做虚拟节点的时候 是两个虚拟节点的比较
    var isRealElement = oldVnode.nodeType; // 如果有说明他是一个dom元素

    if (isRealElement) {
      var oldElm = oldVnode; // 需要获取父节点 将当前节点的下一个元素作为参照物 将他插入，之后删除老节点

      var parentNode = oldElm.parentNode; // 父节点

      var el = createElm(vnode); // 根据虚拟节点

      parentNode.insertBefore(el, oldElm.nextSibling);
      parentNode.removeChild(oldElm);
      return el;
    } else {
      patchVnode(oldVnode, vnode);
    } // diff算法

  }
  function createElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        var children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      // 元素
      vnode.el = document.createElement(tag); // 后续我们需要diff算法 拿虚拟节点比对后更新dom

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child)); // 递归渲染
      }); // 样式类名....

      updateProperties(vnode);
    } else {
      // 文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el; // 从根虚拟节点创建真实节点
  }

  function updateProperties(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var newProps = vnode.data || {}; // 新props 
    // 老的props 
    // 属性的diff算法

    var el = vnode.el; // 比较sytle 特殊一些 需要看下样式

    var oldStyle = oldProps.style || {};
    var newStyle = newProps.style || {};

    for (var key in oldStyle) {
      if (!(key in newStyle)) {
        el.style[key] = '';
      }
    }

    for (var _key in oldProps) {
      if (!(_key in newProps)) {
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in newProps) {
      if (_key2 === 'style') {
        for (var styleKey in newProps[_key2]) {
          el.style[styleKey] = newProps[_key2][styleKey];
        }
      } else if (_key2 === 'class') {
        el.className = newProps[_key2];
      } else {
        el.setAttribute(_key2, newProps[_key2]);
      }
    }
  } // 每次更新页面的话 dom结果是不会变的， 我调用render方法时，数据变化了会根据数据渲染成新的虚拟节点，用新的虚拟节点渲染dom


  function patchVnode(oldVnode, vnode) {
    // case1: 前后两个虚拟节点不是相同节点直接替换掉即可
    if (!isSameVnode(oldVnode, vnode)) {
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    } // 标签一样我就复用节点


    var el = vnode.el = oldVnode.el; // case2：两个元素虚拟节点都是文本的情况下 用新文本换掉老的文本即可

    if (!oldVnode.tag) {
      // 是文本
      if (oldVnode.text !== vnode.text) {
        return el.textContent = vnode.text;
      }
    } // case3: 两个都是标签 比较属性


    updateProperties(vnode, oldVnode.data); // case4: 比较儿子节点
    // 一方有儿子 一方没儿子 
    // 两方都有儿子 

    var oldChildren = oldVnode.children || [];
    var newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // diff算法是一层层的比较 不涉及到跨级比较
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      for (var i = 0; i < newChildren.length; i++) {
        el.appendChild(createElm(newChildren[i]));
      }
    } else if (oldChildren.length > 0) {
      el.innerHTML = ''; // 直接清除掉所有节点
    }
  } // diff算法采用了双指针的方式进行比对，并且是O(n)


  function updateChildren(el, oldChildren, newChildren) {
    // vue中创建了4个指针 分别指向 老孩子和新孩子的头尾
    // 分别依次进行比较有一方先比较完毕就结束比较
    var oldStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newStartIndex = 0;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newStartVnode = newChildren[0];
    var newEndVnode = newChildren[newEndIndex]; // 有一方比完就停止  儿子的规模变大而变大 O(n)

    function makeIndexByKey(children) {
      return children.reduce(function (memo, current, index) {
        return memo[current.key] = index, memo;
      }, {});
    }

    var map = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 这里在优化dom的常见操作 向前追加 向后追加  尾部移动头部
      // 复用节点
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // 说明两个元素是同一个元素 要比较属性，和他的儿子
        patchVnode(oldStartVnode, newStartVnode);
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        // 尾头比对
        patchVnode(oldEndVnode, newStartVnode);
        el.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // 头尾比对
        patchVnode(oldStartVnode, newEndVnode);
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } // 会根据key进行diff算法 ， 所以在使用的时候如果列表是可操作的，尽量避开用index作为key
      else {
        // 乱序比对 我们需要尽可能找出能复用的元素出来
        var moveIndex = map[newStartVnode.key];

        if (moveIndex == undefined) {
          // 不用复用直接创建插入即可
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        } else {
          // 有的话直接移动老的节点
          var moveVnode = oldChildren[moveIndex];
          oldChildren[moveIndex] = undefined;
          el.insertBefore(moveVnode.el, oldStartVnode.el);
          patchVnode(moveVnode, newStartVnode); // 比属性 比儿子
        }

        newStartVnode = newChildren[++newStartIndex];
      }
    }

    if (newStartIndex <= newEndIndex) {
      // 将新增的直接插入
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        // 可能是像前面添加 还有可能是像后添加
        // el.appendChild(createElm(newChildren[i]))
        var nextEle = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el; // nextEle 可能是null 可能是一个dom元素

        el.insertBefore(createElm(newChildren[i]), nextEle); // 如果anchor参照物是null 会被变成appendChild
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      // 老的多余的元素删除掉即可
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i] !== undefined) {
          el.removeChild(oldChildren[_i].el);
        }
      }
    } // Vue3采用了最长递增子序列，找到最长不需要移动的序列，从而减少了移动操作

  }

  function lifeCycleMixin(Vue) {
    Vue.prototype._c = function () {
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function () {
      return createTextNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      // 将数据转化成字符串 因为使用的变量对应的结果可能是一个对象
      if (_typeof(value) === 'object' && value !== null) {
        return JSON.stringify(value);
      }

      return value;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm); // _c( _s _v)  with(this)

      return vnode;
    };

    Vue.prototype._update = function (vnode) {
      // 将虚拟节点变成真实节点
      // 将vnode 渲染el元素中
      var vm = this;
      vm.$el = patch(vm.$el, vnode); // 可以初始化渲染， 后续更新也走这个patch方法
    };
  } // 将模板变成ast -> render  -> render函数产生虚拟节点(数据得是渲染好的)---|

  function mountComponent(vm, el) {
    // 实现页面的挂载流程
    vm.$el = el; // 先将el挂载到实例上 

    var updateComponent = function updateComponent() {
      // 需要调用生成的render函数 获取到虚拟节点  -> 生成真实的dom
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent, function () {
      console.log('页面重新渲染 updated');
    }, true); // updateComponent(); // 如果稍后数据变化 也调用这个函数重新执行 
    // 观察者模式 + 依赖收集 + diff算法
  }

  var oldArrayPrototype = Array.prototype; // arrayProptotype.__proto__ = Array.prototype;

  var arrayPrototype = Object.create(oldArrayPrototype);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    // 用户调用push方法会先经历我自己重写的方法,之后调用数组原来的方法
    arrayPrototype[method] = function () {
      var _oldArrayPrototype$me;

      var inserted;
      var ob = this.__ob__;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args; // 数组

          break;

        case 'splice':
          // arr.splice(1,1,xxx)
          inserted = args.slice(2);
      }

      if (inserted) {
        // 对新增的数据再次进行观测
        ob.observeArray(inserted);
      }

      var result = (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args)); // 更新页面...  靠的都是watcher数组并没有收集watcher


      ob.dep.notify();
      return result;
    };
  });

  // 2.当页面取值的时候回执行get方法， 拿到刚才新增的dep属性，让她记住这个watcher
  // 3.稍后数据变化 触发当前数组的dep中存放的watcher去更新

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // data 的类型是对象也可能是数组
      // 如果是数组的话也是用defineProperty会浪费很多性能 很少用户会通过arr[878] = 123
      // vue3中的polyfill 直接就给数组做代理了
      // 改写数组的方法，如果用户调用了可以改写数组方法的api 那么我就去劫持这个方法
      // 变异方法 push pop shift unshift reverse sort splice 
      this.dep = new Dep(); // 给所有的对象都增加一个dep, 后续我们会给对象增添新的属性也期望能实现更新

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      }); // 如果有__ob__属性 说明被观测过了
      // 修改数组的索引和长度是无法更新视图的

      if (Array.isArray(data)) {
        // 需要重写这7个方法
        data.__proto__ = arrayPrototype; // 直接将属性赋值给这个对象
        // 如果数组里面放的是对象类型 我期望他也会被变成响应式的

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        }); //如果是对象我才进行观测了  
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 循环对象 尽量不用for in （会遍历原型链）
        var keys = Object.keys(data); // [0,1,2]

        keys.forEach(function (key) {
          //没有重写数组里的每一项
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }(); // 性能不好的原因在于 所有的属性都被重新定义了一遍
  // 一上来需要将对象深度代理 性能差


  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var temp = value[i];
      temp.__ob__ && temp.__ob__.dep.depend(); // 让数组中的对象类型做依赖收集  [[[]]]

      if (Array.isArray(temp)) {
        dependArray(temp);
      }
    }
  }

  function defineReactive(data, key, value) {
    //  闭包
    // 属性会全部被重写增加了get和set
    var dep = new Dep();
    var childOb = observe(value); // 递归代理属性 , childOb就是当前的实例

    Object.defineProperty(data, key, {
      get: function get() {
        // vm.xxx
        if (Dep.target) {
          dep.depend(); // 依赖收集 要将属性收集对应的watcher

          if (childOb) {
            childOb.dep.depend(); // 让数组和对象也记录一下渲染watcher

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        // vm.xxx = {a:1} 赋值一个对象的话 也可以实现响应式数据
        if (newValue === value) return;
        childOb = observe(newValue);
        value = newValue;
        dep.notify(); // 通知依赖的watcher去重新渲染
      }
    });
  }

  function observe(data) {
    if (_typeof(data) !== 'object' || data == null) {
      return; // 如果不是对象类型，那么不要做任何处理
    }

    if (data.__ob__) {
      // 说明这个属性已经被代理过了
      return data;
    } // 我稍后要区分 如果一个对象已经被观测了，就不要再次被观测了
    // __ob__ 标识是否有被观测过


    return new Observer(data);
  }
  // 每个实例可以通过__proto__ 找到所属类的prototype对应的内容
  // 1.在Vue2中对象的响应式原理，就是给每个属性增加get和set，而且是递归操作 （用户在写代码的时候尽量不要把所有的属性都放在data中，层次尽可能不要太深）, 赋值一个新对象也会被变成响应式的
  // 2.数组没有使用defineProperty 采用的是函数劫持创造一个新的原型重写了这个原型的7个方法，用户在调用的时候采用的是这7个方法。我们增加了逻辑如果是新增的数据会再次被劫持 。 最终调用数组的原有方法 （注意数字的索引和长度没有被监控）  数组中对象类型会被进行响应式处理

  function initState(vm) {
    var options = vm.$options; // 后续实现计算属性 、 watcher 、 props 、methods

    if (options.data) {
      initData(vm);
    }
  }

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; // 如果是函数就拿到函数的返回值 否则就直接采用data作为数据源

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 属性劫持 采用defineProperty将所有的属性进行劫持
    // 我期望用户可以直接通过 vm.xxx 获取值， 也可以这样取值 vm._data.xxx

    for (var key in data) {
      proxy(vm, '_data', key);
    }

    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 所有后续的扩展方法都有一个$options选项可以获取用户的所有选项
      // 对于实例的数据源 props data methods computed watch
      // props data

      initState(vm); // vue中会判断如果是$开头的属性不会被变成响应式数据
      // 状态初始化完毕后需要进行页面挂载

      if (vm.$options.el) {
        // el 属性 和直接调用$mount是一样的
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var options = vm.$options;

      if (!options.render) {
        var template = options.template;

        if (!template) {
          template = el.outerHTML;
        } // 将template变成render函数
        // 创建render函数 -》 虚拟dom  -》 渲染真实dom


        var render = compileToFunction(template); // 开始编译

        options.render = render;
      }

      mountComponent(vm, el); // 一定存在了

      console.log(options.render.toString());
    }; // diff算法 主要是两个虚拟节点的比对  我们需要根据模板渲染出一个render函数，render函数可以返回一个虚拟节点 ,数据更新了重新调用render函数 可以再返回一个虚拟节点，

  }

  // 整个自己编写的Vue的入口

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); // 后续在扩展都可以采用这种方式

  lifeCycleMixin(Vue);
  Vue.prototype.$nextTick = nextTick; // 给Vue添加原型方法我们通过文件的方式来添加，防止所有的功能都在一个文件中来处理

  return Vue;

}));
//# sourceMappingURL=vue.js.map
