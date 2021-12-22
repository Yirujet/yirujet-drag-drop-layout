<template>
    <div class="xanway-empty">
        <span>{{ emptyText }}</span>
    </div>
</template>

<script>

export default {
    name: 'XanwayEmpty',

    props: {
        emptyText: {
            type: String,
            default: 'No results found'
        }
    },

    data() {
        return {

        }
    },
    computed: {},
    watch: {},
    methods: {},
    created() {},
    mounted() {},
}
</script>
<style lang='less' scoped>
    .xanway-empty {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        flex-direction: column;
        color: #98A2B3;
        font-size: 0.75rem;
        & > i, span {
            margin: 4px 0;
        }
    }
</style>