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
        @composition="compositionFound"
        :style=`{maxWidth: '600px', maxHeight: 'calc(100% - 60px)', borderRadius: '10px', overflow: 'hidden', opacity: 1}`).bg-black
  //- composition editor
  q-dialog(v-model="compositionEditorOpened" :maximized="true").bg-black
    div(:style=`{position: 'relative', height: $q.screen.height+'px'}`).row.fit
      composition-editor(
        ctx="editor"
        :value="nodeRubickNew" :compositionIndex="compositionIndex" @composition="compositionEdited").bg-black
      q-btn(push color="green" no-caps @click="compositionEditorOpened = false, compositionEditedFinal()"
        :style=`{position: 'absolute', zIndex: 10000, top: '16px', right: '16px'}`) Ready!
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
          v-if="nodeRubick && compositionOneQuery"
          ref="compositionListOne"
          :ctx="'rubick'" label="one"
          @width="width = $event"
          @next="compositionOneNextIndex"
          :compositions="compositionOneItems"
          :compositionOid="compositionOneOid"
          :nodeOid="nodeRubick ? nodeRubick.oid : node.oid"
          :mini="false" :visible="compositionsVisible[0]" :active="compositionsActive[0]"
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`)
        //- actions
        q-btn(
          round outline color="green" icon="add" @click="compositionAdd(0)"
          :style=`{position: 'absolute', zIndex: 200, bottom: '16px', right: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.4)'}`)
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
          v-if="nodeRubick && compositionTwoQuery"
          ref="compositionListTwo"
          :ctx="'rubick'" label="two"
          @next="compositionTwoNextIndex"
          :compositions="compositionTwoItems"
          :compositionOid="compositionTwoOid"
          :nodeOid="nodeRubick ? nodeRubick.oid : node.oid"
          :mini="false" :visible="compositionsVisible[1]" :active="compositionsActive[1]"
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`)
        //- actions
        q-btn(
          round outline color="green" icon="add" @click="compositionAdd(1)"
          :style=`{position: 'absolute', zIndex: 2000, bottom: '16px', right: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.4)'}`)
      //- debug node
      div(v-if="true && nodeRubick").row.full-width.bg-red
        .row.full-width
          img(
            :src="nodeRubick.meta.compositions[0].thumbUrl"
            :style=`{width: '100px', height: '100px', objectFit: 'contain'}`)
        .row.full-width
          span {{nodeRubick.name}}
        .row.full-width
          img(
            :src="nodeRubick.meta.compositions[1].thumbUrl"
            :style=`{width: '100px', height: '100px', objectFit: 'contain'}`)
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
      compositionEditorOpened: false,
      compositionOneQuery: null,
      compositionOneOid: undefined,
      compositionTwoQuery: null,
      compositionTwoOid: undefined,
      compositionsVisible: [true, true],
      compositionsActive: [true, true],
      nodeRubick: null,
      nodeRubickFull: null,
      nodeRubickNew: null,
      nodeRubickNext: null,
      maxWidth: 600
    }
  },
  computed: {
    compositionOneItems () {
      if (!this.compositionOneQuery) return []
      return this.compositionOneQuery.items.map(node => {
        let same = this.compositionTwoOid === node.meta.compositions[1].oid
        let index = same ? 0 : 1
        return {
          node: node,
          preview: node.meta.compositions[index].thumbUrl,
          composition: null,
          compositionIndex: index,
          compositionOid: node.meta.compositions[index].oid
        }
      })
    },
    compositionTwoItems () {
      if (!this.compositionTwoQuery) return []
      return this.compositionTwoQuery.items.map(node => {
        let same = this.compositionOneOid === node.meta.compositions[0].oid
        let index = same ? 1 : 0
        return {
          node: node,
          preview: node.meta.compositions[index].thumbUrl,
          composition: null,
          compositionIndex: index,
          compositionOid: node.meta.compositions[index].oid
        }
      })
    }
  },
  watch: {
    node: {
      immediate: true,
      async handler (to, from) {
        this.$log('node CHANGED', to)
        if (to && !this.nodeRubick) {
          this.$set(this, 'nodeRubick', JSON.parse(JSON.stringify(to)))
          this.compositionOneOid = to.meta.compositions[0].oid
          this.compositionTwoOid = to.meta.compositions[1].oid
          this.compositionOneQuery = await this.$store.dispatch('lists/nodeNodes', {node: to, compositionOid: this.compositionTwoOid, pagination: {pageSize: 30}})
          this.compositionTwoQuery = await this.$store.dispatch('lists/nodeNodes', {node: to, compositionOid: this.compositionOneOid, pagination: {pageSize: 30}})
        }
      }
    },
    nodeFull: {
      immediate: true,
      handler (to, from) {
        this.$log('nodeFull CHANGED', to)
        if (to && !this.nodeRubickFull) {
          this.$set(this, 'nodeRubickFull', JSON.parse(JSON.stringify(to)))
          // TODO load queries
        }
      }
    },
    nodeRubick: {
      deep: true,
      handler (to, from) {
        this.$log('nodeRubick CHANGED', to)
        if (to && this.$route.name === 'node') {
          this.$router.push('/node/' + to.oid).catch(e => e)
        }
      }
    },
    nodeRubickFull: {
      deep: true,
      handler (to, from) {
        this.$log('nodeRubickFull CHANGED', to)
      }
    }
  },
  methods: {
    compositionAdd (index) {
      this.$log('compositionAdd', index)
      this.$set(this.compositionsActive, 0, false)
      this.$set(this.compositionsActive, 1, false)
      this.compositionIndex = index
      this.compositionFinderOpened = true
    },
    async compositionFound (composition) {
      this.$log('compositionFound', composition)
      this.nodeRubickNew = JSON.parse(JSON.stringify(this.nodeRubickFull))
      this.nodeRubickNew.compositions[this.compositionIndex] = composition
      this.compositionEditorOpened = true
      await this.$wait(300)
      this.compositionFinderOpened = false
    },
    compositionEdited (composition) {
      this.$log('compositionEdited', composition)
      this.$set(this.compositionsActive, 0, true)
      this.$set(this.compositionsActive, 1, true)
      this.$set(this.nodeRubickNew.compositions, this.compositionIndex, composition)
      this.$log('compositionEdited: nodeNew', this.nodeRubickNew)
    },
    async compositionEditedFinal () {
      this.$log('compositionEditedFinal', this.nodeRubickNew)
      await this.nodePublish(this.nodeRubickNew)
      this.nodeRubickNew = null
    },
    async compositionOneNextIndex (index) {
      this.$log('cONEnext index', index)
      let node = this.compositionOneItems[index].node
      let swap = this.compositionOneOid !== node.meta.compositions[0].oid
      this.$log('cONEnext swap', swap)
      this.nodeRubick = node
      this.compositionOneOid = this.compositionOneItems[index].compositionOid
      this.compositionOneQuery = await this.$store.dispatch('lists/nodeNodes', {compositionOid: this.compositionTwoOid, pagination: {pageSize: 30}})
      this.compositionTwoQuery = await this.$store.dispatch('lists/nodeNodes', {compositionOid: this.compositionOneOid, pagination: {pageSize: 30}})
      // this.compositionOneOid = this.compositionOneItems[index].compositionOid
    },
    async compositionTwoNextIndex (index) {
      this.$log('cTWOnext index', index)
      let node = this.compositionTwoItems[index].node
      let swap = this.compositionTwoOid !== node.meta.compositions[1].oid
      this.$log('cTWOnext swap', swap)
      this.nodeRubick = node
      this.compositionTwoOid = this.compositionTwoItems[index].compositionOid
      this.compositionOneQuery = await this.$store.dispatch('lists/nodeNodes', {compositionOid: this.compositionTwoOid, pagination: {pageSize: 30}})
      this.compositionTwoQuery = await this.$store.dispatch('lists/nodeNodes', {compositionOid: this.compositionOneOid, pagination: {pageSize: 30}})
      // this.compositionTwoOid = this.compositionTwoItems[index].compositionOid
    },
    nodeNameClick () {
      this.$log('nodeNameClick')
    },
    async nodePublish (node) {
      try {
        this.$log('nodePublish start')
        // this.nodePublishing = true
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
  }
}
</script>
