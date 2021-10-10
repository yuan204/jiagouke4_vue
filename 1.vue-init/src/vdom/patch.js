export function patch(oldVnode,vnode){ // oldVnode 可能是后续做虚拟节点的时候 是两个虚拟节点的比较

    const isRealElement = oldVnode.nodeType; // 如果有说明他是一个dom元素

    if(isRealElement){
        const oldElm = oldVnode;

        // 需要获取父节点 将当前节点的下一个元素作为参照物 将他插入，之后删除老节点

        const parentNode = oldElm.parentNode; // 父节点

        let el = createElm(vnode); // 根据虚拟节点
        parentNode.insertBefore(el,oldElm.nextSibling);
        parentNode.removeChild(oldElm)

        return el;
    }
    // diff算法
}
function createElm(vnode){
    let {tag,data,children,text} = vnode;
    if(typeof tag === 'string'){ // 元素
        vnode.el = document.createElement(tag); // 后续我们需要diff算法 拿虚拟节点比对后更新dom
        children.forEach(child=>{
            vnode.el.appendChild(createElm(child)); // 递归渲染
        })
    }else{ // 文本
        vnode.el = document.createTextNode(text);
    }
    return vnode.el; // 从根虚拟节点创建真实节点
}

// 每次更新页面的话 dom结果是不会变的， 我调用render方法时，数据变化了会根据数据渲染成新的虚拟节点，用新的虚拟节点渲染dom