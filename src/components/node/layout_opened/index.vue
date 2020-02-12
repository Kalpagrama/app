<style lang="stylus">
.q-dialog {
  padding: 0;
  margin: 0;
}
</style>

<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
  //- actions
  //- composition finder
  q-dialog(v-model="compositionFinderOpened" :maximized="true" position="bottom")
    div(@click.self="compositionFinderOpened = false").row.full-width.window-height.items-center.content-center.justify-center.q-py-md
      composition-finder(
        @layer="layerFound"
        :style=`{maxWidth: '600px', borderRadius: '10px', overflow: 'hidden', opacity: 1}`).bg-black
  //- header
  div(
    v-if="false"
    :style=`{height: '60px'}`).row.full-width
    h1 hello
  //- vote tint on fragments
  div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.q-px-sm.q-pt-md
    div(
      v-if="votePanning"
      :style=`{
        position: 'absolute', zIndex: 1000, paddingBottom: '30px',
        borderRadius: '10px', overflow: 'hidden', background: 'rgba(0,0,0,0.5)'}`
        ).row.fit.items-end.content-end.justify-center
      //- vote number
      div(
        :style=`{fontSize: 10*(voteValue/10) < 50 ? 50+'px' : 10*(voteValue/10)+'px'}`
      ).row.full-width.justify-center.items-end.text-bold.text-white {{ voteText }}
      //- vote text
      .row.full-width.justify-center
        span(:style=`{fontSize: '50px'}`
          ).text-bold.text-white.text-center {{ voteLabel }}
    //- composition ONE query
    .row.full-width.justify-center.q-py-md
      div(:style=`{maxWidth: 600+'px', height: '100px'}`).row.full-width.scroll
        div(v-if="compositionOneQuery").row.no-wrap
          img(
            v-for="(n,ni) in compositionOneQuery.items"
            :src="n.meta.compositions[1].oid === node.meta.compositions[1].oid ? n.meta.compositions[1].thumbUrl : n.meta.compositions[0].thumbUrl"
            :style=`{height: '100px', borderRadius: '10px', overflow: 'hidden'}`).q-mr-sm
    //- composition ONE
    .row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: 600+'px'}`).row.full-width.items-start.content-start
        composition(
          ref="fragmentFirst"
          :ctx="ctx" :index="0"
          :thumbUrl="node.meta.compositions[0].thumbUrl"
          :composition="nodeFull ? nodeFull.compositions[0] : null"
          :mini="false" :visible="visible"
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`)
        //- actions
        q-btn(
          round push color="green" icon="add" @click="extendComposition(0)"
          :style=`{position: 'absolute', zIndex: 200, top: '16px', right: '16px'}`)
        q-btn(
          round push color="green" icon="keyboard_arrow_right"
          :style=`{position: 'absolute', zIndex: 200, top: 'calc(50% - 20px)', right: '16px'}`)
    //- name, essence
    .row.full-width.justify-center
      div(
        v-if="true"
        ref="nodeName" @click="nodeNameClick()"
        :style=`{position: 'relative', maxWidth: 600+'px', minHeight: '80px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.justify-center.cursor-pointer.q-my-md.bg-grey-2
        span.text-bold.text-center.cursor-pointer {{ node.name }}
        //- actions
        q-btn(
          round push color="green" icon="add" @click="extendEssence()"
          :style=`{position: 'absolute', zIndex: 200, top: 'calc(50% - 20px)', right: '16px'}`)
    //- composition TWO
    .row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: 600+'px'}`).row.full-width.items-start.content-start
        composition(
          ref="fragmentFirst"
          :ctx="ctx" :index="1"
          :thumbUrl="node.meta.compositions[1].thumbUrl"
          @previewWidth="previewWidth = $event"
          :composition="nodeFull ? nodeFull.compositions[1] : null"
          :mini="false" :visible="visible"
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`)
        //- actions
        q-btn(
          round push color="green" icon="add" @click="extendComposition(1)"
          :style=`{position: 'absolute', zIndex: 200, top: '16px', right: '16px'}`)
        q-btn(
          round push color="green" icon="keyboard_arrow_right"
          :style=`{position: 'absolute', zIndex: 200, top: 'calc(50% - 20px)', right: '16px'}`)
    //- composition TWO query
    .row.full-width.justify-center.q-py-md
      div(:style=`{maxWidth: 600+'px', height: '100px'}`).row.full-width.scroll
        div(v-if="compositionTwoQuery").row.no-wrap
          img(
            v-for="(n,ni) in compositionTwoQuery.items"
            :src="n.meta.compositions[0].oid === node.meta.compositions[0].oid ? n.meta.compositions[0].thumbUrl : n.meta.compositions[1].thumbUrl"
            :style=`{height: '100px', borderRadius: '10px', overflow: 'hidden'}`).q-mr-sm
  //- actions
  .row.full-width.justify-center.q-px-sm.q-pb-md
    div(:style=`{maxWidth: 600+'px'}`).row.full-width
      div(
        v-if="nodeFull"
        :style=`{
          position: 'relative', height: '70px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.bg-grey-4
        //- pan btn
        div(
          v-touch-pan.left.right.prevent.mouse="votePan"
          :style=`{
            position: 'absolute', left: voteLeft+'px', zIndex: 200,
            height: '60px', width: '90px'}`
            ).row.items-center.justify-center
          q-btn(
            round push color="white" :loading="nodeVoting" @click="nodeVote()"
            :style=`{height: '40px', width: '40px', borderRadius: '50%', cursor: votePanning ? 'grab' : 'pointer'}`
            ).row.items-center.justify-center.bg-green
            q-icon(name="blur_on" color="white" size="30px")
        //- vote tint and helper text
        div(
          v-if="votePanning"
          :style=`{position: 'absolute', zIndex: 198}`).row.fit.items-center.justify-center.bg-white
          span Pan to vote
        div(
          v-if="nodeFull"
          :style=`{marginLeft: '70px'}`).row.full-height.items-center.content-center
          span(:style=`{borderBottom: '1px solid #eee'}`).text-bold.full-width.text-center {{voteHuman(nodeFull.rate)}}
          span.text-bold.full-width.text-center {{voteHuman(nodeFull.rateUser)}}
        //- user name
        div(
          @click="$router.push('/user/' + nodeFull.author.oid)").col.full-height
          .row.fit.items-center.justify-end.cursor-pointer
            span(:style=`{userSelect: 'none'}`) {{ nodeFull.author.name | cut(40) }}
        //- user avatar
        div(
          @click="$router.push('/user/' + nodeFull.author.oid)"
          :style=`{height: '60px', width: '75px'}`).row.items-center.justify-center.cursor-pointer
          div(:style=`{height: '40px', width: '40px', borderRadius: '50%', overflow: 'hidden'}`).bg-grey-8
            //- img(
            //-   :src="nodeFull.author.thumbUrl"
            //-   :style=`{width: '100%', height: '100%', objectFit: 'cover'}`).bg-grey-7
    //- spheres and timestamp
    div(v-if="nodeFull").row.full-width
      //- spheres
      div(:style=`{height: '50px'}`).row.full-width.scroll
        .row.justify-start.items-start.content-start.no-wrap.q-pa-md
          div(
            v-for="(s, si) in nodeFull.spheres" :key="si" @click="$router.push('/sphere/' + s.oid)"
            :style=`{}`).q-mr-sm.cursor-pointer
            span(:style=`{borderRadius: '4px', whiteSpace: 'nowrap', userSelect: 'none'}`).bg-grey-2.q-px-sm.q-py-xs {{ s.name }}
      //- timestamp
      div(v-if="false").row.full-width.justify-start.items-center.content-center.q-pa-md
        small.text-grey-7 31.12.2019
        .col
        q-btn(push no-caps dense color="green" @click="nodeExtend()").q-px-sm.q-ml-sm
          span Extend
</template>

<script>
export default {
  name: 'nodeLayoutOpened',
  props: ['node', 'nodeFull'],
  data () {
    return {
      voteValue: 0,
      votePanning: false,
      voteLeft: 0,
      previewWidth: 0,
      previewHeight: 0,
      compositionIndex: undefined,
      compositionFinderOpened: false,
      compositionOneQuery: null,
      compositionTwoQuery: null,
      essenceQuery: null
    }
  },
  computed: {
    voteText () {
      let v = (this.voteValue / 10).toFixed(1)
      let arr = v.split('.')
      return arr[0] + ',' + arr[1]
    },
    voteLabel () {
      let v = this.voteValue
      if (v >= 0 && v < 20) return this.$t('That sucks')
      else if (v >= 20 && v < 40) return this.$t('Nah')
      else if (v >= 40 && v < 60) return this.$t('So so')
      else if (v >= 60 && v < 80) return this.$t('High')
      else if (v >= 80 && v < 100) return this.$t('Soo high')
      else return this.$t('No way')
    }
  },
  methods: {
    voteHuman (vote) {
      let v = ((vote * 100) / 10).toFixed(1)
      let arr = v.split('.')
      return arr[0] + ',' + arr[1]
    },
    async votePan (e) {
      // this.$log('votePan', e.delta.x)
      let to = this.voteLeft + e.delta.x
      if (to > 0 && to <= this.previewWidth - 90) {
        this.voteLeft += e.delta.x
        let v = Math.round((this.voteLeft / (this.previewWidth - 90)) * 100)
        if (v === 0) this.voteValue = 1
        else if (v === 100) this.voteValue = 99
        else this.voteValue = v
      }
      if (e.isFirst) {
        this.$log('votePan FIRST')
        this.votePanning = true
      }
      if (e.isFinal) {
        this.$log('votePan FINAL', this.voteValue / 100)
        await this.nodeVote(this.voteValue / 100)
        this.$tween.to(this, 0.4, {voteLeft: 0})
        this.votePanning = false
      }
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
      let nodeNew = JSON.parse(JSON.stringify(this.nodeFull))
      nodeNew.compositions[this.compositionIndex] = c
      this.nodePublish(nodeNew)
    },
    compositionExtend (index) {
      this.$log('compositionExtend', index)
      this.compositionIndex = index
      this.compositionFinderOpened = true
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
    },
    extendEssence () {
      this.$log('extendEssence')
      // open essence finder
      // preview the result
      // publish
    },
    extendComposition (index) {
      this.$log('extendComposition', index)
      // open composition finder
      // preview the result
      // publish
      this.compositionIndex = index
      this.compositionFinderOpened = true
    },
    nodeExtend () {
      this.$log('nodeExtend')
      if (this.nodeExtending) {
        this.nodeExtending = false
      } else {
        this.nodeExtending = true
      }
    },
    async nodeVote (rate = 0.5) {
      try {
        this.$log('nodeVote start', this.node.oid)
        this.nodeVoting = true
        // await this.$wait(1000)
        this.$store.dispatch('node/nodeRate', {node: this.node, rateUser: rate})
          .catch(err => this.$logE('nodeVote err', err))
        this.$log('nodeVote done')
        this.nodeVoting = false
      } catch (e) {
        this.$log('nodeVote error', e)
        this.nodeVoting = false
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.compositionOneQuery = await this.$store.dispatch('lists/nodeNodes', {node: this.nodeFull, position: 1, pagination: {pageSize: 30}})
    this.compositionTwoQuery = await this.$store.dispatch('lists/nodeNodes', {node: this.nodeFull, position: 3, pagination: {pageSize: 30}})
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
