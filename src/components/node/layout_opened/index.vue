<style lang="stylus">
.q-dialog {
  padding: 0;
  margin: 0;
}
</style>

<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
  //- composition finder
  q-dialog(v-model="compositionFinderOpened" :maximized="true" position="bottom")
    div(@click.self="compositionFinderOpened = false" :style=`{height: $q.screen.height+'px'}`).row.full-width.items-start.content-start.justify-center.q-px-xs.q-pb-xs
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
        q-btn(
        round flat color="green" icon="keyboard_arrow_left" @click="compositionFinderOpened = false"
        :style=`{}`)
        .col.full-height
      composition-finder(
        @layer="layerFound"
        :style=`{maxWidth: '600px', maxHeight: 'calc(100% - 60px)', borderRadius: '10px', overflow: 'hidden', opacity: 1}`).bg-black
  //- header
  div(
    v-if="true"
    :style=`{height: '60px'}`).row.full-width.justify-center.q-pa-xs
    div(:style=`{maxWidth: maxWidth+'px'}`).row.full-width.items-center.content-center.q-px-md
      q-btn(
        v-if="$route.name !== 'node'"
        round flat color="green" icon="keyboard_arrow_left" @click="$router.back()"
        :style=`{}`)
      .col.full-height
      q-btn(
        v-if="nodeRubick && $route.name !== 'node'"
        round flat color="green" icon="link" @click="$router.push('/node/' + nodeRubick.oid)"
        :style=`{}`)
  //- node wrapper
  div(:style=`{position: 'relative'}`).row.full-width.justify-center.items-start.content-start.q-px-xs
    div(:style=`{position: 'relative', maxWidth: maxWidth+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
      vote-tint(v-if="votePanning" :voteValue="voteValue")
      //- composition ONE
      div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
        composition-list(
          v-if="nodeRubick"
          ref="compositionListOne"
          :ctx="ctx" :index="needSwap ? 1 : 0"
          @width="width = $event"
          :compositions="[{preview: nodeRubick.meta.compositions[needSwap ? 1 : 0].thumbUrl, composition: nodeRubickFull ? nodeRubickFull.compositions[needSwap ? 1 : 0] : null}]"
          :mini="false" :visible="true" :active="true"
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`)
        //- actions
        //- q-btn(
        //-   round flat color="green" icon="add" @click="compositionAdd(0)"
        //-   :style=`{position: 'absolute', zIndex: 200, bottom: '16px', right: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.4)'}`)
      //- name, essence
      .row.full-width.justify-center.items-center.content-center
        div(
          v-if="nodeRubick"
          ref="nodeName" @click="nodeNameClick()"
          :style=`{
            position: 'relative', maxWidth: 600+'px', minHeight: '80px', borderRadius: '0px', overflow: 'hidden',
            marginTop: '-10px', marginBottom: '-10px'}`
          ).row.full-width.items-center.justify-center.cursor-pointer.bg-grey-2
          span.text-bold.text-center.cursor-pointer {{ nodeRubick.name }}
      //- composition TWO
      div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
        composition-list(
          v-if="nodeRubick"
          ref="compositionListTwo"
          :ctx="ctx" :index="needSwap ? 0 : 1"
          :thumbUrl="nodeRubick.meta.compositions[needSwap ? 0 : 1].thumbUrl"
          :compositions="[...compositionsTwo, {preview: nodeRubick.meta.compositions[needSwap ? 0 : 1].thumbUrl, composition: nodeRubickFull ? nodeRubickFull.compositions[needSwap ? 0 : 1] : null}]"
          :mini="false" :visible="true" :active="true"
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`)
  actions(
    :node="nodeRubick" :nodeFull="nodeRubickFull" :width="width" :maxWidth="maxWidth"
    @votePanning="votePanning = $event" @voteValue="voteValue = $event"
    :style=`{marginBottom: '400px'}`)
  //- TODO add spheres and node meta info
</template>

<script>
import voteTint from './vote_tint'
import actions from './actions'

export default {
  name: 'nodeLayoutOpened',
  props: ['node', 'nodeFull', 'nodeLoad'],
  components: {voteTint, actions},
  data () {
    return {
      voteValue: 0,
      votePanning: false,
      width: 0,
      compositionIndex: undefined,
      compositionFinderOpened: false,
      compositionOneQuery: null,
      compositionTwoQuery: null,
      compositionsTwo: [],
      nodeRubick: null,
      nodeRubickFull: null,
      needSwap: false,
      maxWidth: 500
    }
  },
  watch: {
    node: {
      immediate: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        if (to) this.$set(this, 'nodeRubick', JSON.parse(JSON.stringify(to)))
      }
    },
    nodeFull: {
      immediate: true,
      handler (to, from) {
        this.$log('nodeFull CHANGED', to)
        this.$set(this, 'nodeRubickFull', JSON.parse(JSON.stringify(to)))
        if (to) this.loadRubicks()
        else this.nodeLoad()
      }
    },
    nodeRubick: {
      deep: true,
      handler (to, from) {
        this.$log('nodeRubick CHANGED', to)
        if (to) {
          if (this.$route.name === 'node') this.$router.push('/node/' + to.oid).catch(e => e)
        }
      }
    },
    nodeRubickFull: {
      deep: true,
      handler (to, from) {
        this.$log('nodeRubickFull CHANGED', to)
        if (to) this.loadRubicks()
      }
    }
  },
  methods: {
    loadCompositions () {
      var compositions = []
      if (this.compositionOneQuery) {
        this.compositionOneQuery.items.map(async (i) => {
          let nodeFull = await this.$store.dispatch('objects/get', { oid: i.oid, priority: 0 })
          compositions.push({preview: i.meta.compositions[0].thumbUrl, composition: nodeFull.compositions[0]})
        })
      }
      this.compositionsTwo = compositions
    },
    async loadRubicks () {
      this.$log('loadRubicks')
      let nodeRubickFull = JSON.parse(JSON.stringify(this.nodeRubickFull))
      if (this.needSwap) {
        let t = nodeRubickFull.compositions[0]
        nodeRubickFull.compositions[0] = nodeRubickFull.compositions[1]
        nodeRubickFull.compositions[1] = t
      }
      this.compositionOneQuery = await this.$store.dispatch('lists/nodeNodes', {node: nodeRubickFull, position: 4, pagination: {pageSize: 30}})
      this.compositionTwoQuery = await this.$store.dispatch('lists/nodeNodes', {node: nodeRubickFull, position: 5, pagination: {pageSize: 30}})
      this.loadCompositions()
      // TODO load rubicks for nodeName...
      this.$log('compositionOneQuery', this.compositionOneQuery)
      this.$log('compositionTwoQuery', this.compositionTwoQuery)
    },
    layerFound (l) {
      this.$log('layerFound', l)
      this.compositionFinderOpened = false
      // this.nodeExtending = false
      // // TODO create new composition then publish a node with this composition...
      let c = {
        url: '',
        name: '',
        layers: [l],
        operation: {operations: null, items: [], type: 'CONCAT'}
      }
      let nodeNew = JSON.parse(JSON.stringify(this.nodeRubickFull))
      nodeNew.compositions[this.compositionIndex] = c
      this.nodePublish(nodeNew)
    },
    compositionAdd (index) {
      this.$log('compositionAdd', index)
      this.compositionIndex = index
      this.compositionFinderOpened = true
    },
    async compositionRubickClick (node) {
      this.$log('compositionRubickClick', node)
      // this.needSwap = node.meta.compositions[0].oid !== this.nodeRubick.meta.compositions[0].oid
      this.nodeRubick = node
      this.nodeRubickFull = await this.$store.dispatch('objects/get', { oid: node.oid, priority: 0 })
    },
    nodeNameClick () {
      this.$log('nodeNameClick')
    },
    async nodePublish (node) {
      try {
        this.$log('nodePublish start')
        // this.nodePublishing = true
        // this.nodePublishCheck(this.node)
        let res = await this.$store.dispatch('node/nodeCreate', node)
        this.$log('res', res)
        this.$log('nodePublish done')
        // this.nodePublishing = false
        // this.nodePublishingError = null
        this.$log('nodePublish done')
        // this.nodePublishing = false
      } catch (e) {
        this.$log('nodePublish error', e)
        // this.nodePublishingError = e
        // this.nodePublishing = false
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
