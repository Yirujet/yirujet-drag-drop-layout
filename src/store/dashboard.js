import { intersect, calcMinTop, Common } from '@/utils/common'
import { METHOD_NAMES, OPERATION_TYPE } from '@/utils/model'

const DashboardStore = {
    name: 'dashboard',

    store: {
        list: [],   //  拖拽单元列表
        draggerMargin: 5,   //  拖拽单元间隔
        cols: 36,   //  将可视区划分为多少格
        cellWidth: 0,
        left: 0,    //  当前容器组件对应的offsetLeft
        top: 0, //  当前容器组件对应的offsetTop
        currentNode: null,
        cache: null,
        canExceedHorizontalViewingArea: false,  //  是否可超出水平可视区域
        showGridLine: false, //  是否展示网格线
        animation: true,    //  是否启动拖拽动画
        mode: null,   //  操作模式：drag、resize
        canvasMode: null,   //  画布模式：preview、design
    },

    mutations: {
        setState(state, payload) {
            Object.assign(state, payload)
        }
    },

    actions: {
        init({ commit, state }, rect) {
            const { left, top, width } = rect
            const { cols } = state
            commit('setState', {
                cellWidth: Math.floor(width / cols),
                left,
                top
            })
        },
        /**
         * 根据页面空白部分选取最佳位置插入拖拽节点
         */
        appendDraggerNode({ commit, state }, payload) {
            const { id, comp, w, h, title } = payload
            const { list, cellWidth } = state
            const compLayoutTag = 'Dragger'
            const compLayoutList = this.__super__.$children.filter(item => item.$options._componentTag === compLayoutTag)
            const { left, right, top, bottom } = this.__super__.$el.getBoundingClientRect()
            const sortedCompsOffsetBottom = [...compLayoutList.map(e => e.$el.getBoundingClientRect())].sort((e1, e2) => e2.bottom - e1.bottom)
            const maxOffsetBottom = sortedCompsOffsetBottom.length > 0 ? sortedCompsOffsetBottom.shift().bottom + bottom : bottom
            const parentRect = { left, right, top: 0, bottom: maxOffsetBottom - top }
            const validRects = Common(METHOD_NAMES.VACBTC.name, compLayoutList, parentRect)
            const draggerWidth = cellWidth * w
            const draggerHeight = cellWidth * h
            const usableRects = validRects.filter(item => item.width >= draggerWidth && item.height >= draggerHeight)
            const betterRect = [...usableRects].sort((e1, e2) => {
                if (e1.top < e2.top) {
                    return -1
                } else if (e1.top > e2.top) {
                    return 1
                } else {
                    if (e1.left < e2.left) {
                        return -1
                    } else if (e1.left > e2.left) {
                        return 1
                    } else {
                        return 0
                    }
                }
            }).shift()
            const nodeX = Math.round(betterRect.left / cellWidth)
            const nodeY = Math.round(betterRect.top / cellWidth)
            commit('setState', {
                list: [ ...list, { id, comp, x: nodeX, y: nodeY, w, h, title } ]
            })
        },
        /**
         * 设置拖拽阴影样式
         */
        copyNodeInnerHTML(actionObj, node) {
            Object.assign(this.__super__.$refs.draggerShadow.$el, {
                style: node.getAttribute('style'),
                innerHTML: node.innerHTML
            })
        },
        /**
         * 移动拖拽节点事件
         */
        updatePosition({ dispatch, commit, state }, payload) {
            const { left, top, cellWidth, currentNode, cols, canExceedHorizontalViewingArea } = state
            const { offsetX, offsetY, pageX, pageY } = payload
            let x = pageX - left - offsetX,
                y = pageY - top - offsetY
            x = Math.max(x, 0)
            y = Math.max(y, 0)
            this.__super__.$refs.draggerShadow.$el.style.transform = `translate(${ x }px, ${ y }px)`
            let nodeX = Math.round(x / cellWidth)
            const nodeY = Math.round(y / cellWidth)
            const { x: currentNodeX, y: currentNodeY, w } = currentNode
            if (!canExceedHorizontalViewingArea) {
                if (nodeX + w > cols) {
                    nodeX = cols - w
                }
            }
            if(currentNodeX !== nodeX || currentNodeY !== nodeY) {
                commit('setState', {
                    currentNode: Object.assign(currentNode, {
                        x: nodeX,
                        y: nodeY
                    })
                })
                dispatch('reCalcDragPosition')
                dispatch('collisionDetection')
            }
        },
        /**
         * 调节拖拽节点大小事件
         */
        updateSize({ dispatch, commit, state }, payload) {
            const { left, top, cellWidth, currentNode, cache, cols, canExceedHorizontalViewingArea } = state
            const { offsetX, offsetY, pageX, pageY } = payload
            const x1 = currentNode.x * cellWidth + offsetX,
                y1 = currentNode.y * cellWidth + offsetY
            const x2 = pageX - left,
                y2 = pageY - top
            const dx = x2 - x1, dy = y2 - y1
            const w = cache.w * cellWidth + dx,
                h = cache.h * cellWidth + dy
            this.__super__.$refs.draggerShadow.$el.style.width = `${ w }px`
            this.__super__.$refs.draggerShadow.$el.style.height = `${ h }px`
            let nodeW = Math.round(w / cellWidth)
            let nodeH = Math.round(h / cellWidth)
            const { w: currentNodeW, h: currentNodeH, x } = currentNode
            nodeW = Math.max(nodeW, 1)
            nodeH = Math.max(nodeH, 1)
            if (!canExceedHorizontalViewingArea) {
                if (x + nodeW > cols) {
                    nodeW = cols - x
                }
            }
            if(currentNodeW !== nodeW || currentNodeH !== nodeH) {
                commit('setState', {
                    currentNode: Object.assign(currentNode, {
                        w: nodeW,
                        h: nodeH
                    })
                })
                dispatch('collisionDetection')
            }
        },
        /**
         * 根据相交节点重新设置拖拽节点位置
         */
        reCalcDragPosition({ state, commit }) {
            const { currentNode, list } = state
            const intersectNodes = list.filter(e => currentNode !== e && intersect(currentNode, e))
            if (intersectNodes.length > 0) {
                const minYNode = intersectNodes.sort((e1, e2) => e1.y - e2.y).shift()
                if (currentNode.y >= (minYNode.y + minYNode.h / 2)) {
                    commit('setState', {
                        currentNode: Object.assign(currentNode, {
                            y: minYNode.y + minYNode.h
                        })
                    })
                } else {
                    commit('setState', {
                        currentNode: Object.assign(currentNode, {
                            y: minYNode.y
                        })
                    })
                }
            }
        },
        /**
         * 碰撞检测
         */
        collisionDetection({ commit, state }) {
            const { currentNode, list } = state
            const minY = list.filter(e => currentNode !== e).reduce((p, c) => intersect(currentNode, c) ? Math.max(currentNode.y - c.y, p) : p, 0)
            commit('setState', {
                list: [...list].map(node => {
                    if(currentNode !== node) {
                        if ((node.y + node.h) > currentNode.y) {
                            return {
                                ...node,
                                y: node.y + currentNode.h + minY
                            }
                        } else {
                            return node
                        }
                    } else {
                        return  node
                    }
                })
            })
        },
        /**
         * 自动吸顶
         */
        bubble({ dispatch, state }) {
            const { list, mode, currentNode } = state
            list.forEach(n => {
                const y = calcMinTop(n, list)
                if(y < n.y) {
                    if (currentNode === n && mode === OPERATION_TYPE.RESIZE) {
                        this.__super__.$nextTick(() => dispatch('updateDraggerShadowPosition'))
                    }
                    n.y = y
                }
            })
        },
        /**
         * resize时若拖拽节点的位置也发生了变化需要同步到拖拽阴影
         */
        updateDraggerShadowPosition({ dispatch, state }) {
            const { currentNode } = state
            const compLayoutTag = 'Dragger'
            const compLayoutList = this.__super__.$children.filter(item => item.$options._componentTag === compLayoutTag)
            dispatch('copyNodeInnerHTML', compLayoutList.find(item => item.id === currentNode.id).$el )
        }
    }
}

export default DashboardStore