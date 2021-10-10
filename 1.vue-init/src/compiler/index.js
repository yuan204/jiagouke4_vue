const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 用来描述标签的
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的  捕获的是结束标签的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的  分组1 拿到的是属性名  , 分组3 ，4， 5 拿到的是key对应的值

const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的    />    >   
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配双花括号中间单的内容

function parserHTML(html) {
    function advance(n) {
        html = html.substring(n); // 每次根据传入的长度截取html
    }
    let root; // 树的操作 ，需要根据开始标签和结束标签产生一个树
    // 如何构建树的父子关系
    let stack = [];

    function createASTElement(tagName, attrs) {
        return {
            tag: tagName,
            attrs,
            children: [],
            parent: null,
            type: 1
        }
    }

    function start(tagName, attrs) {
        let element = createASTElement(tagName, attrs);
        if (root == null) {
            root = element;
        }
        let parent = stack[stack.length - 1]; // 取到栈中的最后一个
        if (parent) {
            element.parent = parent; // 让这个元素记住自己的父亲是谁
            parent.children.push(element) // 让父亲记住儿子是谁
        }
        stack.push(element); // 将元素放到栈中
    }

    function end(tagName) {
        stack.pop();
    }

    function chars(text) {
        text = text.replace(/\s/g, '');
        if (text) {
            let parent = stack[stack.length - 1];
            parent.children.push({
                type: 3,
                text
            })
        }
    }
    //  ast 描述的是语法本身 ，语法中没有的，不会被描述出来  虚拟dom 是描述真实dom的可以自己增添属性
    while (html) { // 一个个字符来解析将结果抛出去
        let textEnd = html.indexOf('<');
        if (textEnd === 0) {
            const startTagMatch = parseStartTag(); // 解析开始标签  {tag:'div',attrs:[{name:"id",value:"app"}]}
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue
            }
            let matches;
            if (matches = html.match(endTag)) { // <div>    </div>  不是开始就会走道结束
                end(matches[1]);
                advance(matches[0].length);
                continue
            }
        }
        let text;
        if (textEnd >= 0) {
            text = html.substring(0, textEnd)
        }
        if (text) {
            advance(text.length);
            chars(text);
        }
    }

    function parseStartTag() {
        const matches = html.match(startTagOpen);
        if (matches) {
            const match = {
                tagName: matches[1],
                attrs: []
            }
            advance(matches[0].length);
            // 继续解析开始标签的属性 
            let end, attr
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) { // 只要没有匹配到结束标签就一直匹配
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true });
                advance(attr[0].length); // 解析一个属性删除一个
            }
            if (end) {
                advance(end[0].length);
                return match;
            }
        }
    }
    return root;
}

function genProps(attrs) {
    let str = '';
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        // style="color:red;background:blue"
        if (attr.name === 'style') { // style="{color:red,background:blue}"
            let obj = {}
            attr.value.split(';').reduce((memo, current) => {
                let [key, value] = current.split(':')
                memo[key] = value;
                return memo;
            }, obj);
            attr.value = obj;
        }

        // 特殊的属性 style
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}

function gen(node) {
    if (node.type === 1) {
        return genCode(node)
    } else {
        let text = node.text;
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})` // 不带表达式的
        } else {
            let tokens = [];
            let match;
            // exec 遇到全局匹配会有 lastIndex问题 每次匹配前需要将lastIndex 置为0
            let startIndex = defaultTagRE.lastIndex = 0; // 自动会变 ，每次用的时候置为0
            while (match = defaultTagRE.exec(text)) {
                let endIndex = match.index; // 匹配到索引    abc {{ aa }} {{bb}} cd

                if (endIndex > startIndex) {
                    tokens.push(JSON.stringify(text.slice(startIndex, endIndex)));
                }
                tokens.push(`_s(${match[1].trim()})`);
                startIndex = endIndex + match[0].length
            }
            if (startIndex < text.length) { // 最后的尾巴放进去
                tokens.push(JSON.stringify(text.slice(startIndex)));
            }
            return `_v(${tokens.join('+')})` // 最后将动态数据 和非动态的拼接在一起
        }
    }
}

function genChildren(ast) {
    const children = ast.children;
    return children.map(child => gen(child)).join(',')
}

function genCode(ast) {
    // 字符串拼接 拼接成我想要的就可以 

    let code;
    code = `_c("${ast.tag}",${
        ast.attrs.length? genProps(ast.attrs) : "undefined"
    }${
        ast.children ? ','+genChildren(ast) :''
    })`; // _c('div',{classNanem:"xxx"},createTextVnode('hello world'))
    return code;
}
// 将模板变成render函数 通过 with + new Function的方式让字符串变成js语法来执行
export function compileToFunction(template) {
    let ast = parserHTML(template)

    // 通过ast语法树转化成render函数
    let code = genCode(ast);
    const render = new Function(`with(this){return ${code}}`); // 将字符串变成了函数
    return render;
}
// 4.12继续

// 将template转化成ast语法树 -》 再讲语法树转化成一个字符串拼接在一起
// ast 是用来描述语言本身的
// vdom 描述dom元素的