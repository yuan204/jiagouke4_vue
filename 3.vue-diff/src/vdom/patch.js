function isSameVnode(n1, n2) {
    return n1.tag == n2.tag && n1.key === n2.key
}

export function patch(oldVnode, vnode) { // oldVnode 可能是后续做虚拟节点的时候 是两个虚拟节点的比较

    const isRealElement = oldVnode.nodeType; // 如果有说明他是一个dom元素

    if (isRealElement) {
        const oldElm = oldVnode;

        // 需要获取父节点 将当前节点的下一个元素作为参照物 将他插入，之后删除老节点

        const parentNode = oldElm.parentNode; // 父节点

        let el = createElm(vnode); // 根据虚拟节点
        parentNode.insertBefore(el, oldElm.nextSibling);
        parentNode.removeChild(oldElm)
        return el;
    } else {
        patchVnode(oldVnode, vnode)
    }
    // diff算法
}



export function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag === 'string') { // 元素
        vnode.el = document.createElement(tag); // 后续我们需要diff算法 拿虚拟节点比对后更新dom
        children.forEach(child => {
            vnode.el.appendChild(createElm(child)); // 递归渲染
        })
        // 样式类名....
        updateProperties(vnode);
    } else { // 文本
        vnode.el = document.createTextNode(text);
    }
    return vnode.el; // 从根虚拟节点创建真实节点
}

function updateProperties(vnode, oldProps = {}) {
    let newProps = vnode.data || {}; // 新props 
    // 老的props 
    // 属性的diff算法
    let el = vnode.el;
    // 比较sytle 特殊一些 需要看下样式
    let oldStyle = oldProps.style || {};
    let newStyle = newProps.style || {}
    for (let key in oldStyle) {
        if (!(key in newStyle)) {
            el.style[key] = ''
        }
    }
    for (let key in oldProps) {
        if (!(key in newProps)) {
            el.removeAttribute(key)
        }
    }
    for (let key in newProps) {
        if (key === 'style') {
            for (let styleKey in newProps[key]) {
                el.style[styleKey] = newProps[key][styleKey]
            }
        } else if (key === 'class') {
            el.className = newProps[key];
        } else {
            el.setAttribute(key, newProps[key])
        }
    }
}

// 每次更新页面的话 dom结果是不会变的， 我调用render方法时，数据变化了会根据数据渲染成新的虚拟节点，用新的虚拟节点渲染dom






function patchVnode(oldVnode, vnode) {
    // case1: 前后两个虚拟节点不是相同节点直接替换掉即可
    if (!isSameVnode(oldVnode, vnode)) {
        return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }
    // 标签一样我就复用节点
    let el = vnode.el = oldVnode.el
    // case2：两个元素虚拟节点都是文本的情况下 用新文本换掉老的文本即可
    if (!oldVnode.tag) { // 是文本
        if (oldVnode.text !== vnode.text) {
            return el.textContent = vnode.text
        }
    }
    // case3: 两个都是标签 比较属性
    updateProperties(vnode, oldVnode.data)

    // case4: 比较儿子节点
    // 一方有儿子 一方没儿子 
    // 两方都有儿子 
    let oldChildren = oldVnode.children || [];
    let newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
        // diff算法是一层层的比较 不涉及到跨级比较
        updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
        for (let i = 0; i < newChildren.length; i++) {
            el.appendChild(createElm(newChildren[i]))
        }
    } else if (oldChildren.length > 0) {
        el.innerHTML = ''; // 直接清除掉所有节点
    }
}







// diff算法采用了双指针的方式进行比对，并且是O(n)
function updateChildren(el, oldChildren, newChildren) {
    // vue中创建了4个指针 分别指向 老孩子和新孩子的头尾
    // 分别依次进行比较有一方先比较完毕就结束比较
    let oldStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newStartIndex = 0;
    let newEndIndex = newChildren.length - 1;

    let oldStartVnode = oldChildren[0];
    let oldEndVnode = oldChildren[oldEndIndex];
    let newStartVnode = newChildren[0];
    let newEndVnode = newChildren[newEndIndex];

    // 有一方比完就停止  儿子的规模变大而变大 O(n)
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {

        // 复用节点
        if (isSameVnode(oldStartVnode, newStartVnode)) { // 说明两个元素是同一个元素 要比较属性，和他的儿子
            patchVnode(oldStartVnode, newStartVnode);
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
        }
    }
    if (newStartIndex <= newEndIndex) { // 将新增的直接插入
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            el.appendChild(createElm(newChildren[i]))
        }
    }

}