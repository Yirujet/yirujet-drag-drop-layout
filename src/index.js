import Vue from 'vue'
import { createStore, mapStates, mapMutations, mapActions } from '@/utils/store'
import { CANVAS_MODE } from '@/utils/model'
import DashboardStore from '@/store/dashboard'
import StoreRegistory from '@/store/registory'
import '@/assets/style.less'

const components = require.context('@/components', true, /\.vue$/)
components.keys().forEach(fileName => {
  const componentName = components(fileName).default.name
  if (componentName) {
      Vue.component(componentName, components(fileName).default)
  }
})

const DragLayoutContainer = Vue.component('drag-layout-container', {
    name: 'DragLayoutContainer',

    props: {
        defaultList: {
            type: Array,
            default: () => []
        },
        defaultDraggerMargin: {
            type: Number,
            default: 5
        },
        defaultCols: {
            type: Number,
            default: 36
        },
        defaultCanExceedHorizontalViewingArea: {
            type: Boolean,
            default: false
        },
        defaultShowGridLine: {
            type: Boolean,
            default: false
        },
        defaultAnimation: {
            type: Boolean,
            default: true
        },
        defaultCanvasMode: {
            type: String,
            default: 'design'
        }
    },

    data() {
        const dashboardStore = createStore(this, StoreRegistory, DashboardStore)
        
        return {
            StoreRegistory,
            dashboardStore
        }
    },

    computed: {
        ...mapStates('dashboard', [
            'list',
            'draggerMargin',
            'cellWidth',
            'currentNode',
            'left',
            'top',
            'cache',
            'canExceedHorizontalViewingArea',
            'showGridLine',
            'cols',
            'canvasMode'
        ])
    },

    methods: {
        ...mapMutations('dashboard', ['setState']),
        ...mapActions('dashboard', ['init', 'bubble', 'appendDraggerNode'])
    },

    watch: {
        list: {
            handler() {
                this.bubble()
            },
            deep: true
        },
        cols() {
            this.init(this.$el.getBoundingClientRect())
        }
    },

    created () {
        this.setState({
            list: this.defaultList,
            draggerMargin: this.defaultDraggerMargin,
            cols: this.defaultCols,
            canExceedHorizontalViewingArea: this.defaultCanExceedHorizontalViewingArea,
            showGridLine: this.defaultShowGridLine,
            animation: this.defaultAnimation,
            canvasMode: this.defaultCanvasMode
        })
    },

    mounted() {
        this.init(this.$el.getBoundingClientRect())
    },

    render(h) {
        const compLayoutContainerList = this.list.map(item => {
            return h('Dragger', {
                props: {
                    id: item.id,
                    title: item.title,
                    x: item.x,
                    y: item.y,
                    w: item.w,
                    h: item.h
                },
                key: item.id,
                class: this.currentNode?.id === item.id ? 'dragging' : ''
            }, [h(item.comp.tag, { ...item.comp.data })])
        })
        const draggerShadowVNode = h('DraggerShadow', {
            props: {
                margin: this.draggerMargin
            },
            ref: 'draggerShadow'
        })
        return h('div', {
            class: [
                'drag-layout-container', 
                `${ this.currentNode === null ? '' : 'has-dragging-node' }`,
                `${ this.showGridLine ? 'grid-line' : '' }`
            ],
            style: {
                'background-size': `${ this.cellWidth }px ${ this.cellWidth }px`,
                'background-position': `${ this.draggerMargin }px ${ this.draggerMargin }px`
            }
        }, [compLayoutContainerList, this.canvasMode === CANVAS_MODE.DESIGN ? draggerShadowVNode : null])
    },
})

export default DragLayoutContainer