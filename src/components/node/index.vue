<template lang="pug">
div(:style=`{borderRadius: '10px'}`).row.full-width
  //- fragments
  div(:style=`{position: 'relative', height: previewHeight > 0 ? previewHeight+'px' : 'auto'}`).row.full-width
    nc-fragment(
      ref="fragmentFirst"
      :ctx="ctx" :index="0"
      :thumbUrl="node.meta.fragments[0].thumbUrl"
      @previewWidth="$event => fragmentWidth(0, $event)"
      @previewHeight="$event => fragmentHeight(0, $event)"
      @ended="fragmentEnded(0)"
      @action="nodeAction"
      :visible="visible"
      :fragment="nodeFull ? nodeFull.fragments[0] : null"
      :mini="fragmentMini === 0" @mini="fragmentChange(1)"
      :style=`fragmentMini === 0 ? fragmentMiniStyles : {}`)
    nc-fragment(
      ref="fragmentSecond"
      :ctx="ctx" :index="1"
      :thumbUrl="node.meta.fragments[1].thumbUrl"
      @previewWidth="$event => fragmentWidth(1, $event)"
      @previewHeight="$event => fragmentHeight(1, $event)"
      @ended="fragmentEnded(1)"
      @action="nodeAction"
      :visible="visible"
      :fragment="nodeFull ? nodeFull.fragments[1] : null"
      :mini="fragmentMini === 1" @mini="fragmentChange(0)"
      :style=`fragmentMini === 1 ? fragmentMiniStyles : {height: '100%', width: '100%', objectFit: 'contain'}`)
  //- name, essence
  div(
    ref="nodeName" @click="$emit('nodeClick', [node, nodeFull])"
    :style=`{minHeight: '60px'}`
    ).row.full-width.items-center.justify-center
    span.text-bold.text-center.cursor-pointer {{ node.name }}
  //- actions
  div(
    v-if="nodeFull && opened"
    :style=`{
      position: 'relative', height: '60px',
      borderTop: '1px solid #eee', borderBottom: '1px solid #eee'}`).row.full-width.items-center
    //- pan btn
    div(
      v-touch-pan.left.right.prevent.mouse="votePan"
      :style=`{
        position: 'absolute', left: voteLeft+'px', zIndex: 200,
        height: '60px', width: '90px'}`
        ).row.items-center.justify-center
      q-btn(
        :loading="nodeVoting" @click="nodeVote()"
        round push :style=`{height: '40px', width: '40px', borderRadius: '50%'}`
        ).row.items-center.justify-center.bg-green.cursor-pointer
        q-icon(name="blur_on" color="white" size="30px")
    //- vote tint and helper text
    div(
      v-if="votePanning"
      :style=`{position: 'absolute', zIndex: 198}`).row.fit.items-center.justify-center.bg-white
      span Pan to vote
    div( :style=`{marginLeft: '70px'}`).row.full-height.items-center.content-center
      span(:style=`{borderBottom: '1px solid #eee'}`).text-bold.full-width.text-center {{node.rate}}
      span.text-bold.full-width.text-center {{node.rateUser}}
    //- user name
    div(
      @click="$router.push('/user/' + nodeFull.author.oid)").col.full-height
      .row.fit.items-center.justify-end.cursor-pointer
        span(:style=`{userSelect: 'none'}`) {{ nodeFull.author.name | cut(40) }}
    //- user avatar
    div(
      @click="$router.push('/user/' + nodeFull.author.oid)"
      :style=`{height: '60px', width: '60px'}`).row.items-center.justify-center.cursor-pointer
      div(:style=`{height: '35px', width: '35px', borderRadius: '50%', overflow: 'hidden'}`).bg-grey-3
        img(
          :src="nodeFull.author.thumbUrl"
          :style=`{width: '100%', height: '100%', objectFit: 'cover'}`)
  //- spheres and timestamp
  div(v-if="nodeFull && opened").row.full-width
    //- spheres
    div(:style=`{height: '50px'}`).row.full-width.scroll
      .row.justify-start.items-start.content-start.no-wrap.q-pa-md
        div(
          v-for="(s, si) in nodeFull.spheres" :key="si" @click="$router.push('/sphere/' + s.oid)"
          :style=`{}`).q-mr-sm.cursor-pointer
          span(:style=`{borderRadius: '4px', whiteSpace: 'nowrap', userSelect: 'none'}`).bg-grey-2.q-px-sm.q-py-xs {{ s.name }}
    //- timestamp
    .row.full-width.justify-start.q-pa-md
      small.text-grey-7 20.12.2019
</template>

<script>
import ncFragment from 'components/node_composer/nc_fragment'

export default {
  name: 'nodeNew',
  props: ['ctx', 'index', 'opened', 'node', 'needFull', 'nodeFullReady', 'visible'],
  components: {ncFragment},
  data () {
    return {
      nodeFullError: null,
      nodeFull: null,
      voteLeft: 0,
      votePanning: false,
      fPosition: 'absolute',
      fMarginTop: 0,
      fMini: true,
      fWidth: 100,
      fBottom: 30,
      fRight: 10,
      previewHeight: 0,
      previewWidth: 0,
      fragmentMini: 1,
      fragmentMiniStyles: {
        position: 'absolute',
        zIndex: 200,
        maxWidth: 100 + 'px',
        right: 16 + 'px',
        bottom: 20 + 'px',
        opacity: 0.8,
        objectFit: 'contain'
      },
      nodeVoting: false
    }
  },
  watch: {
    visible: {
      immediate: false,
      async handler (to, from) {
        this.$log('visible CHANGED', to)
        if (to) this.play()
        else this.pause()
      }
    },
    needFull: {
      immediate: true,
      async handler (to, from) {
        this.$log('needFull CHANGED', to)
        if (to && !this.nodeFull) {
          this.nodeFull = await this.nodeLoad(this.node.oid)
        }
      }
    },
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        this.$log('nodeFullReady CHANGED', to)
        if (to) {
          this.nodeFull = this.nodeFullReady
        }
      }
    }
  },
  methods: {
    async nodeVote () {
      try {
        this.$log('nodeVote start')
        this.nodeVoting = true
        await this.$wait(500)
        let vote = await this.$store.dispatch('node/nodeRate', {oid: this.node.oid, rate: 0.5})
        this.$log('nodeVote done', vote)
        this.nodeVoting = false
      } catch (e) {
        this.$log('nodeVote error', e)
        this.nodeVoting = false
      }
    },
    fragmentWidth (index, width) {
      this.$log('fragmentWidth', index, width)
      if (index === 0) {
        this.previewWidth = width
        this.$emit('previewWidth', width)
      }
    },
    fragmentHeight (index, height) {
      this.$log('fragmentHeight', index, height)
      if (index === 0) {
        this.previewHeight = height
        this.$emit('previewHeight', height)
      }
    },
    fragmentEnded (index) {
      this.$log('fragmentEnded', index)
      if (index === 0) this.fragmentChange(0)
      else this.fragmentChange(1)
    },
    async fragmentChange (index) {
      this.$log('fragmentChange', index)
      this.$refs.fragmentFirst.pause()
      this.$refs.fragmentSecond.pause()
      await this.$wait(300)
      if (index === 0) this.$refs.fragmentSecond.play()
      else this.$refs.fragmentFirst.play()
      this.fragmentMini = index
    },
    async fragmentMove () {
      if (this.ctx === 'inList') {
        this.$log('inList')
      } else {
        this.$log('fragmentMove START')
        this.$tween.to(this, 0.6, {
          fBottom: -(this.$el.clientHeight - 60),
          fWidth: this.$el.clientWidth,
          fRight: 0,
          fMarginTop: this.$el.clientHeight - 120,
          onComplete: async () => {
            this.$log('fragmentMove DONE')
            // this.fPosition = 'relative'
            this.fMini = !this.fMini
            // this.$refs.fBottom.setSize(this.width, 210)
            // await this.$wait(600)
          }
        })
      }
    },
    votePan (e) {
      // this.$log('votePan', e)
      let to = this.voteLeft + e.delta.x
      if (to > 0 && to <= this.previewWidth - 80) {
        this.voteLeft += e.delta.x
      }
      if (e.isFirst) {
        this.votePanning = true
      }
      if (e.isFinal) {
        this.votePanning = false
        // this.opened = !this.opened
        this.$tween.to(this, 0.4, {voteLeft: 0})
      }
    },
    play () {
      this.$log('play')
      if (this.fragmentMini === 0) this.$refs.fragmentSecond.play()
      else this.$refs.fragmentFirst.play()
    },
    pause () {
      this.$log('pause')
      if (this.fragmentMini === 0) this.$refs.fragmentSecond.pause()
      else this.$refs.fragmentFirst.pause()
    },
    open () {
      this.$log('open')
    },
    nodeActions () {
      this.$log('nodeActions')
    },
    nodeAction () {
      this.$log('nodeAction')
      this.$store.commit('node/stateSet', ['nodeOptionsPayload', JSON.parse(JSON.stringify(this.nodeFull))])
      this.$store.commit('node/stateSet', ['nodeOptionsDialogOpened', true])
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad start', this.index, this.node.oid)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 0 })
        this.nodeFullError = null
      } catch (err) {
        this.$logE('node', 'nodeLoad error', err)
        this.$emit('error')
        node = null
        this.nodeFullError = err
      }
      this.$log('nodeLoad done', this.index, this.node.oid)
      return node
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
