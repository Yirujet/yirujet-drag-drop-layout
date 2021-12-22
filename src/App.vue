<template>
  <div id="app">
    <div class="operation">
      <div class="btn" @click="add">Add</div>
      <div class="btn" @click="preview">Preview Mode</div>
      <div class="btn" @click="design">Design Mode</div>
    </div>
    <div class="content">
      <drag-layout-container>
      </drag-layout-container>
    </div>
  </div>
</template>

<script>
import StoreRegistory from '@/store/registory'
import { mapMutations, mapActions } from '@/utils/store'
import DragLayoutContainer from './index'
import { v4 as uuidv4 } from 'uuid'
import { CANVAS_MODE } from '@/utils/model' 

export default {
  name: 'App',

  components: {
    DragLayoutContainer
  },

  data() {
    return {
      StoreRegistory
    }
  },

  methods: {
    ...mapMutations('dashboard', ['setState']),
    ...mapActions('dashboard', ['appendDraggerNode']),

    add() {
      const newDraggerNode = {
        id: uuidv4(),
        title: 'test',
        comp: {
          tag: 'XanwayEmpty'
        },
        w: 5,
        h: 4
      }
      this.appendDraggerNode(newDraggerNode)
    },
    preview() {
      this.setState({
        canvasMode: CANVAS_MODE.PREVIEW
      })
    },
    design() {
      this.setState({
        canvasMode: CANVAS_MODE.DESIGN
      })
    }
  }
}
</script>

<style lang="less" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}
.operation {
  height: 30px;
  padding: 10px;
  background-color: #F5F7FA;
  .btn {
    display: inline-block;
    padding: 5px 10px;
    background-color: rgba(24,144,255,1);
    color: #fff;
    border-radius: 3px;
    cursor: pointer;
    &:hover {
      background-color: rgba(24,144,255, .6);
    }
    &:nth-child(n + 2) {
      margin-left: 10px;
    }
  }
}
.content {
  position: relative;
  height: calc(100% - 50px);
}
</style>
