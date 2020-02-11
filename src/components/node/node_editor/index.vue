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
    :style=`{position: 'relative', maxWidth: '600px'}`
    ).column.fit
    //- actions
    //- composition editor
    //- TODO: reuse q-dialog props from UI module of vuex...?
    q-dialog(v-model="compositionEditorOpened").bg-black
      composition-editor(
        ctx="composition"
        :node="node" :compositionIndex="compositionIndex").bg-black
    //- composition finder
    q-dialog(v-model="compositionFinderOpened").bg-black
      composition-finder(@layer="layerFound").bg-black
    //- header
    div(
      :style=`{height: '60px'}`
      ).row.full-width.items-center.content-center.q-px-sm
      .col.full-height
        .row.fit.items-center.content-center.q-px-md
          span.text-bold.text-green Node editor
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.content-center.justify-center
        q-btn(round flat icon="refresh" color="green" :loading="nodeRefreshing" @click="nodeRefresh()")
    .col.full-width.scroll
      //- composition one
      div(
        :style=`{position: 'relative', minHeight: '300px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-start.content-start.bg-grey-9
        composition(v-if="node.compositions[0]" :composition="node.compositions[0]" :visible="compositionVisible[0]" ctx="composition")
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
        :style=`{position: 'relative', minHeight: '300px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.bg-grey-9
        composition(v-if="node.compositions[1]" :composition="node.compositions[1]" :visible="compositionVisible[1]" ctx="composition")
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
      .row.full-width.bg-green
        small.full-width.text-white revision: {{ node.revision }}
      //- category, spheres
      div(:style=`{minHeight: '60px'}`).row.full-width.items-start
        div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
          span.text-bold.text-green Category & spheres
        .row.full-width
          span(
            v-if="node"
            v-for="(s,si) in node.spheres" :key="si"
            :class=`{}`
            :style=`{borderRadius: '10px'}`
          ).text-green.q-pa-sm.bg-grey-10.q-mb-sm.q-mr-sm {{ s.name }}
      //- footer: save, publish
      div(:style=`{height: '60px'}`
        ).row.full-width.items-center.q-px-sm
        q-btn(
          outline color="green" no-caps :loading="nodeSaving" @click="nodeSave()"
          :style=`{borderRadius: '10px'}`)
          span().text-bold.text-green Save
        .col.full-height
        q-btn(
          push color="green" no-caps :loading="nodePublishing" @click="nodePublish()"
          :style=`{borderRadius: '10px'}`)
          span().text-bold Publish
</template>

<script>
import { debounce } from 'quasar'

export default {
  name: 'nodeEditor',
  components: {},
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
          this.node = to
        } else {
          this.node = this.nodeNew
        }
      }
    },
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        if (to.oid !== from.oid) return
        if (to) {
          if (this.nodeSavePause) {
            this.nodeSavePause = false
          } else {
            this.nodeSave(to)
          }
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
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', node || this.node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node || this.node)))
        this.$log('res', res)
        this.nodeSavePause = true
        this.node = JSON.parse(JSON.stringify(res))
        this.$log('nodeSave done')
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
