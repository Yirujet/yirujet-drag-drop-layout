<template>
    <div 
        class="dragger-shadow-container"
        :style="{ padding: `${ this.margin }px` }"
    >
    </div>
</template>

<script>
import { createStore, mapStates } from '@/utils/store'
import StoreRegistory from '@/store/registory'
import DraggerStore from '@/store/dragger'

export default {
    name: 'DraggerShadow',

    props: {
        margin: {
            type: Number,
            default: 0
        }
    },

    data() {
        const draggerStore = createStore(this, StoreRegistory, DraggerStore)
        return {
            StoreRegistory,
            draggerStore
        }
    },

    computed: {
        ...mapStates('dashboard', [
            'animation'
        ])
    }
}
</script>
<style lang='less' scoped>
.dragger-shadow-container {
    position: absolute;
    display: none;
    z-index: 102;
    box-sizing: border-box;
    opacity: .6;
}
</style>