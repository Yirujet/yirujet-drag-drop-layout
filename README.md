# xw-drag-drop-layout 
Vue实现的拖拽布局组件 

# 使用说明 
1. 安装
```
npm i xw-drag-drop-layout
```

2. 入口文件中引入组件定义
```javascript 
import 'xw-drag-drop-layout'
import 'xw-drag-drop-layout/dist/xw-drag-drop-layout.css'
``` 

3. 使用 
```
<xw-drag-drop-layout></xw-drag-drop-layout>
```

## 参数说明 
| 参数 | 说明 | 类型 | 默认值 | 是否必须 | 
| :---- | :---- | :----: | :----: | :----: | 
| defaultList | 拖拽节点列表 | Array\<draggerNode\> | [] | true | 
| defaultDraggerMargin | 拖拽节点之间的间距 | number | 5 | false | 
| defaultCols | 水平方向网格数量 | number | 36 | false | 
| defaultCanExceedHorizontalViewingArea | 拖拽节点是否可超出水平可视区域 | boolean | false | false | 
| defaultShowGridLine | 是否展示网格线 | boolean | false | false | 
| defaultAnimation | 是否启动拖拽动画 | boolean | true | false | 
| defaultCanvasMode | 画布模式 | 'preview' \| 'design' | 'preview' | false |

## 方法说明 
> #### setState(states: DragLayoutContainer.states): void  
> 设置xw-drag-drop-layout组件状态，比如：
```javascript 
    this.dragLayoutContainerRef.setState({
        draggerMargin: 5,
        cols: 36,
        canExceedHorizontalViewingArea: true,
        showGridLine: true,
        animation: true
    })
``` 

> ### appendDraggerNode(node: draggerNode): void 
> 添加拖拽节点，比如: 
```javascript 
    this.dragLayoutContainerRef.appendDraggerNode({
        id: uuidv4(),
        comp: 'XanwayEmpty',
        w: 2,
        h: 4
    })
```

## 类型说明 
> #### 拖拽节点类型draggerNode
```javascript 
    //  contentVNode类型与vue中createElement的参数对象类型对应
    interface contentVNode {
        tag: string;
        data?: VNodeData; 
        children?: VNodeChildren;
    }

    interface draggerNode {
        id: string; //  唯一标识
        title: string;  //  标题
        comp: contentVNode;   //  内容组件对象
        x: number;  //  拖拽节点左上角横坐标网格索引
        y: number;  //  拖拽节点左上角纵坐标网格索引
        w: number;  //  拖拽节点宽度（占据网格数）
        h: number;  //  拖拽节点高度（占据网格数）
    }

    //  from vue.d.ts
    interface VNodeData {
        key?: string | number;
        slot?: string;
        scopedSlots?: { [key: string]: ScopedSlot | undefined };
        ref?: string;
        refInFor?: boolean;
        tag?: string;
        staticClass?: string;
        class?: any;
        staticStyle?: { [key: string]: any };
        style?: string | object[] | object;
        props?: { [key: string]: any };
        attrs?: { [key: string]: any };
        domProps?: { [key: string]: any };
        hook?: { [key: string]: Function };
        on?: { [key: string]: Function | Function[] };
        nativeOn?: { [key: string]: Function | Function[] };
        transition?: object;
        show?: boolean;
        inlineTemplate?: {
            render: Function;
            staticRenderFns: Function[];
        };
        directives?: VNodeDirective[];
        keepAlive?: boolean;
    }
``` 


