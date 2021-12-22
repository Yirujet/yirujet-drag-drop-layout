import { getOffset, getParentNode } from '@/utils/common'
import { OPERATION_TYPE } from '@/utils/model'

const draggerStore = {
    name: 'dragger',

    store: {
        pageX: 0,
        pageY: 0,
        offsetX: 0,
        offsetY: 0
    },

    mutations: {
        setState(state, payload) {
            Object.assign(state, payload)
        }
    },

    actions: {
        updateCurrentNode({ commit, get }, id) {
            const { list } = get('dashboard', 'list')
            const node = list.find(item => item.id === id)
            commit('dashboard/setState', {
                currentNode: node,
                cache: JSON.parse(JSON.stringify({
                    id: node.id,
                    x: node.x,
                    y: node.y,
                    w: node.w,
                    h: node.h
                }))
            })
        },
        startDrag({ commit, dispatch }, payload, id) {
            const { pageX, pageY, offsetX, offsetY, target } = payload
            const $el = getParentNode(target, 'dragger-container')
            const offset = getOffset(target, $el, { offsetX, offsetY })
            commit('setState', {
                pageX,
                pageY,
                offsetX: offset.offsetX,
                offsetY: offset.offsetY
            })
            commit('dashboard/setState', { mode: OPERATION_TYPE.DRAG })
            dispatch('updateCurrentNode', id)
            dispatch('dashboard/copyNodeInnerHTML', $el)
        },
        drag({ dispatch, state }, payload) {
            const { pageX: pageXFrom, pageY: pageYFrom, offsetX, offsetY } = state
            const { pageX: pageXTo, pageY: pageYTo } = payload
            if (Math.abs(pageXFrom - pageXTo) > 5 || Math.abs(pageYFrom - pageYTo) > 5) {
                dispatch('dashboard/updatePosition', {
                    offsetX, 
                    offsetY, 
                    pageX: pageXTo, 
                    pageY: pageYTo
                })
            }
        },
        endDrag({ dispatch }) {
            dispatch('clear')
        },
        startResize({ commit, dispatch }, payload, id) {
            const { pageX, pageY, offsetX, offsetY, target } = payload
            const $el = getParentNode(target, 'dragger-container')
            const offset = getOffset(target, $el, { offsetX, offsetY })
            commit('setState', {
                pageX,
                pageY,
                offsetX: offset.offsetX,
                offsetY: offset.offsetY
            })
            commit('dashboard/setState', { mode: OPERATION_TYPE.RESIZE })
            dispatch('updateCurrentNode', id)
            dispatch('dashboard/copyNodeInnerHTML', $el)
        },
        resize({ dispatch, state }, payload) {
            const { pageX: pageXFrom, pageY: pageYFrom, offsetX, offsetY } = state
            const { pageX: pageXTo, pageY: pageYTo } = payload
            if (Math.abs(pageXFrom - pageXTo) > 5 || Math.abs(pageYFrom - pageYTo) > 5) {
                dispatch('dashboard/updateSize', {
                    offsetX, 
                    offsetY, 
                    pageX: pageXTo, 
                    pageY: pageYTo
                })
            }
        },
        endResize({ dispatch }) {
            dispatch('clear')
        },
        clear({ commit }) {
            commit('setState', {
                pageX: 0,
                pageY: 0,
                offsetX: 0,
                offsetY: 0
            }),
            commit('dashboard/setState', {
                currentNode: null,
                cache: null,
                mode: null
            })
        }
    }
}

export default draggerStore