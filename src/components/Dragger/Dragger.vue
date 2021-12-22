<template>
    <div 
        class="dragger-container" 
        :class="{'animation-model': animation, 'only-view': canvasMode === CANVAS_MODE.PREVIEW}"
        :style="{ padding,  width,  height, transform }"
    >
        <div class="dragger">
            <div class="header" @mousedown="handleStartDrag($event)">{{ title }}</div>
            <div class="content">
                <slot></slot>
            </div>
            <div 
                class="resize-node" 
                :style="{ 'margin-right': `${ margin }px`, 'margin-bottom': `${ margin }px` }" 
                @mousedown="handleStartResize($event)"
                v-if="canvasMode === CANVAS_MODE.DESIGN"
            >
            </div>
        </div>
        <div class="tip" v-if="currentNode !== null && currentNode.id === id">
            <span class="position" v-show="mode === OPERATION_TYPE.DRAG">[{{ parseFloat(left) }},{{ parseFloat(top) }}]</span>
            <span class="size" v-show="mode === OPERATION_TYPE.RESIZE">{{ parseFloat(width) }}x{{ parseFloat(height) }}</span>
        </div>
    </div>
</template>

<script>
import { createStore, mapStates, mapActions } from '@/utils/store'
import DraggerStore from '@/store/dragger'
import props from './props'
import StoreRegistory from '@/store/registory'
import { OPERATION_TYPE, CANVAS_MODE } from '@/utils/model' 

export default {
    name: 'Dragger',

    componentName: 'Dragger',

    props,

    data() {
        const draggerStore = createStore(this, StoreRegistory, DraggerStore)
        return {
            StoreRegistory,
            draggerStore,
            OPERATION_TYPE,
            CANVAS_MODE
        }
    },

    computed: {
        ...mapStates('dashboard', [
            'cellWidth', 
            { 'margin': states => states.draggerMargin },
            'parentLeft',
            'parentTop',
            'currentNode',
            'mode',
            'animation',
            'canvasMode'
        ]),
        padding() {
            return `${ this.margin }px`
        },
        width() {
            return `${ this.w * this.cellWidth }px`
        },
        height() {
            return `${ this.h * this.cellWidth }px`
        },
        left() {
            return `${ this.x * this.cellWidth }px`
        },
        top() {
            return `${ this.y * this.cellWidth }px`
        },
        transform() {
            return `translate(${ this.left }, ${ this.top })`
        }
    },

    watch: {},

    methods: {
        ...mapActions('dragger', [
            'startDrag', 
            'drag', 
            'endDrag',
            'startResize',
            'resize',
            'endResize'
        ]),
        handleStartDrag(e) {
            if (this.canvasMode !== CANVAS_MODE.DESIGN) return
            this.startDrag(e, this.id)
            document.addEventListener('mousemove', this.handleDrag)
            document.addEventListener('mouseup', this.handleEndDrag)
            document.onselectstart = () => false
        },
        handleDrag(e) {
            this.drag(e)
        },
        handleEndDrag() {
            document.removeEventListener('mousemove', this.handleDrag)
            document.removeEventListener('mouseup', this.handleEndDrag)
            document.onselectstart = () => null
            this.endDrag()
        },
        handleStartResize(e) {
            this.startResize(e, this.id)
            document.addEventListener('mousemove', this.handleResize)
            document.addEventListener('mouseup', this.handleEndResize)
            document.onselectstart = () => false
        },
        handleResize(e) {
            this.resize(e)
        },
        handleEndResize(e) {
            document.removeEventListener('mousemove', this.handleResize)
            document.removeEventListener('mouseup', this.handleEndResize)
            document.onselectstart = () => null
            this.endResize(e)
        }
    }
}
</script>