<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
</style>
<template lang="pug">
.row.fit.justify-center
  //- column
  div(
    :style=`{position: 'relative'}`
    ).column.fit
    //- actions
    //- composition editor
    //- TODO: reuse q-dialog props from UI module of vuex...?
    q-dialog(v-model="compositionEditorOpened").bg-black
      composition-editor(
        ctx="workspace"
        :node="node" :compositionIndex="compositionIndex").bg-black
    //- composition finder
    q-dialog(v-model="compositionFinderOpened").bg-black
      composition-finder(@layer="layerFound").bg-black
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start.justify-center.q-px-sm
        //- header
        div(
          :style=`{height: '113px'}`
          ).row.full-width.items-start.content-start.justify-center.q-px-sm
          div(:style=`{maxWidth: '600px'}`).row.full-width.items-start.content-start
            //- header
            div(
              :style=`{height: '60px'}`
              ).row.full-width.items-center
            //- header actions
            div(
              :style=`{height: '53px'}`
              ).row.full-width.items-center.content-center.q-px-sm
              q-btn(
                v-if="node && node.oid"
                outline color="red" no-caps :loading="nodeDeleting" @click="nodeDelete(node.oid)"
                :style=`{borderRadius: '10px'}`)
                span Delete
              .col
              q-btn(
                v-if="node && node.oid"
                outline color="green" no-caps :loading="nodeSaving" @click="nodeSave()"
                :style=`{borderRadius: '10px'}`).q-mr-md
                span().text-bold.text-green Save
              //- .col.full-height
              q-btn(
                v-if="node && node.oid"
                push color="green" no-caps :loading="nodePublishing" @click="nodePublish()"
                :style=`{borderRadius: '10px'}`)
                span().text-bold Publish
        div(:style=`{maxWidth: '600px'}`).row.full-width.items-start.content-start
          //- composition one
          div(
            :style=`{position: 'relative', minHeight: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-start.content-start.bg-grey-9
            composition(v-if="node.compositions[0]" :value="node.compositions[0]" :active="true" :visible="true" :mini="false" ctx="workspace")
            //- composition actions
            div(
              v-if="!node.compositions[0]"
              :style=`{position: 'absolute', zIndex: 3000}`
              ).row.fit.items-center.content-center.justify-center
              q-btn(v-if="!node.compositions[0]" round flat color="green" icon="add" size="lg" @click="compositionFind(0)")
            q-btn(v-if="node.compositions[0]" round flat color="white" icon="edit" @click="compositionEdit(0)"
                :style=`{position: 'absolute', zIndex: 3000, right: '16px', top: '40%', background: 'rgba(0,0,0,0.3)'}`)
            q-btn(v-if="node.compositions[0]" round flat color="red" icon='clear' @click="compositionDelete(0)"
                :style=`{position: 'absolute', zIndex: 3000, right: '16px', top: '16px', background: 'rgba(0,0,0,0.3)'}`)
          //- essence editor
          div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-my-md
            input(
              v-if="node"
              v-model="node.name"
              placeholder="Whats the essence?").fit.bg-white.kinput
          //- composition two
          div(
            :style=`{position: 'relative', minHeight: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.bg-grey-9
            composition(v-if="node.compositions[1]" :value="node.compositions[1]" :active="true" :visible="true" :mini="false" ctx="workspace")
            //- composition actions
            div(
              v-if="!node.compositions[1]"
              :style=`{position: 'absolute', zIndex: 3000}`
              ).row.fit.items-center.content-center.justify-center
              q-btn(v-if="!node.compositions[1]" round flat color="green" icon="add" size="lg" @click="compositionFind(1)")
            q-btn(v-if="node.compositions[1]" round flat color="white" icon="edit" @click="compositionEdit(1)"
                :style=`{position: 'absolute', zIndex: 3000, right: '16px', top: '40%', background: 'rgba(0,0,0,0.3)'}`)
            q-btn(v-if="node.compositions[1]" round flat color="red" icon='clear' @click="compositionDelete(1)"
                :style=`{position: 'absolute', zIndex: 3000, right: '16px', top: '16px', background: 'rgba(0,0,0,0.3)'}`)
          //- debug
          div(
            v-if="$store.state.ui.debug"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-green.q-pa-sm.q-my-sm
            small.full-width.text-white revision: {{ node.revision }}
            small.full-width.text-white oid: {{ node.oid }}
        div(:style=`{height: '400px'}`).row.full-width
          //- span hello
          //- spheres(:node="node")
          //- div(
          //-   v-if="node && node.name.length > 0"
          //-   :style=`{minHeight: '400px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.bg-grey-10.q-my-md
          //-   div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
          //-     span.text-bold.text-green Category & spheres
          //-   .row.full-width
          //-     span(
          //-       v-if="node"
          //-       v-for="(s,si) in node.spheres" :key="si"
          //-       :class=`{}`
          //-       :style=`{borderRadius: '10px'}`
          //-     ).text-green.q-pa-sm.bg-grey-10.q-mb-sm.q-mr-sm {{ s.name }}
</template>

<script>
import { debounce } from 'quasar'
import spheres from './spheres'

export default {
  name: 'nodeEditor',
  components: {spheres},
  props: ['value'],
  data () {
    return {
      nodeSavePause: false,
      nodeSaving: false,
      nodeSavingError: null,
      nodePublishing: false,
      nodePublishingError: null,
      nodeRefreshing: false,
      nodeRefreshingError: null,
      nodeDeleting: false,
      nodeDeletingError: null,
      nodeRes: null,
      node: null,
      nodeNew: {
        name: '',
        revision: 1,
        layout: 'PIP',
        category: 'FUN',
        spheres: [],
        compositions: [
          // {
          //   operation: { type: 'CONCAT', items: [], operations: null },
          //   layers: [{ content: content, figuresAbsolute: [] }]
          // }
        ]
      },
      compositionEditorOpened: false,
      compositionFinderOpened: false,
      compositionIndex: undefined,
      compositionVisible: [true, true]
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) {
          if (from) {
            if (to.oid !== from.oid) {
              this.node = to
            }
          } else {
            this.node = to
          }
        } else {
          this.node = this.nodeNew
        }
      }
    },
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        if (to.oid) this.$emit('node', JSON.parse(JSON.stringify(to)))
        if (to.oid !== from.oid) return
        if (to) {
          if (this.nodeSavePause) {
            this.nodeSavePause = false
          } else {
            this.nodeSave(to)
          }
        }
      }
    },
    nodeRes: {
      deep: true,
      handler (to, from) {
        if (to) {
          // this.$log('nodeRes changed', to)
          this.nodeSavePause = true
          this.node = JSON.parse(JSON.stringify(to))
        }
      }
    }
  },
  methods: {
    layerFound (l) {
      this.$log('layerFound', l)
      // add layer to existing composition
      if (this.node.compositions[this.compositionIndex]) {
        this.node.compositions[this.compositionIndex].layers.push(l)
      }
      // create new composition with given index and layer
      else {
        let c = {
          url: '',
          name: '',
          layers: [l],
          operation: {operations: null, items: [], type: 'CONCAT'}
        }
        this.$set(this.node.compositions, this.compositionIndex, c)
      }
      this.compositionFinderOpened = false
    },
    compositionFind (index) {
      this.$log('compositionFind', index)
      this.compositionIndex = index
      this.compositionVisible[index] = false
      this.compositionFinderOpened = true
    },
    compositionEdit (index) {
      this.$log('compositionEdit', index)
      this.compositionIndex = index
      this.compositionVisible[index] = false
      this.compositionEditorOpened = true
    },
    compositionDelete (index) {
      this.$log('compositionDelete', index)
      this.compositionVisible[index] = false
      this.$delete(this.node.compositions, index)
    },
    async nodeDelete (oid) {
      try {
        this.$log('nodeDelete start')
        if (!oid) throw new Error('Need oid to delete node!')
        if (!confirm('Delete node?')) return
        this.nodeDeleting = true
        await this.$wait(1000)
        let res = await this.$store.dispatch('workspace/wsItemDelete', oid)
        this.$log('nodeDelete done')
        this.nodeDeleting = false
        this.nodeDeletingError = null
        // TODO delete node and exit
        this.node = this.nodeNew
      } catch (e) {
        this.$log('nodeDelete error', e)
        this.nodeDeleting = false
        this.nodeDeletingError = e
      }
    },
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', node || this.node)
        this.nodeSaving = true
        this.nodeRes = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node || this.node)))
        // let xxx = JSON.parse(JSON.stringify(this.nodeRes))
        // this.$log('res', xxx)
        // this.nodeSavePause = true
        // this.node = JSON.parse(JSON.stringify(this.nodeRes))
        // this.$log('nodeSave done', xxx)
        this.nodeSaving = false
        this.nodeSavingError = null
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSavingError = e
        this.nodeSaving = false
      }
    },
    async nodePublishCheck (node) {
      this.$log('nodePublishCheck', node)
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        // this.nodePublishCheck(this.node)
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.$log('nodePublish done')
        this.nodePublishing = false
        this.nodePublishingError = null
        this.$log('nodePublish done')
        this.nodePublishing = false
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishingError = e
        this.nodePublishing = false
      }
    },
    async nodeRefresh () {
      try {
        this.$log('nodeRefresh start')
        this.nodeRefreshing = true
        await this.$wait(2000)
        this.$log('nodeRefresh done')
        this.nodeRefreshing = false
      } catch (e) {
        this.$log('nodeRefresh error', e)
        this.nodeRefreshingError = e
        this.nodeRefreshing = false
      }
    }
  },
  created () {
    this.nodeSave = debounce(this.nodeSave, 1000)
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
