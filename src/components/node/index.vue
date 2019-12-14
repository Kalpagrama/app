<template lang="pug">
div(:style=`{borderRadius: '10px'}`).row.full-width
  //- fragments
  div(:style=`{position: 'relative'}`).row.full-width
    nc-fragment(
      ref="fTop"
      :ctx="ctx"
      :thumbUrl="node.meta.fragments[0].thumbUrl"
      @previewLoaded="previewHeight = $event, $emit('previewLoaded', $event)"
      :width="width" :fragment="nodeFull ? nodeFull.fragments[0] : null" :mini="false")
    //- nc-fragment(
    //-   ref="fBottom"
    //-   :ctx="ctx"
    //-   :thumbUrl="node.meta.fragments[1].thumbUrl"
    //-   :width="fWidth" :fragment="nodeFull ? nodeFull.fragments[1] : null" :mini="fMini" @mini="fragmentMini"
    //-   :style=`{position: 'absolute', zIndex: 200, maxWidth: fWidth+'px', right: fRight+'px', bottom: fBottom+'px'}`)
  //- name
  div(
    ref="nodeName" @click="$emit('nodeClick', [node, nodeFull])"
    :style=`{minHeight: '60px'}`
    ).row.full-width.items-center.justify-center
    span.text-bold.text-center.cursor-pointer {{ node.name }}
  //- actions
  div(
    v-if="ctx === 'inEditor'"
    :style=`{position: 'relative', height: '60px', borderRadius: '10px', overflow: 'hidden', marginTop: fMarginTop+'px'}`).row.full-width.items-center
    div(
      v-touch-pan.left.right.prevent.mouse="votePan"
      :style=`{
        position: 'absolute', left: voteLeft+'px', zIndex: 200,
        height: '60px', width: '90px'}`
        ).row.items-center.justify-center
      div(:style=`{height: '40px', width: '40px', borderRadius: '50%'}`).row.items-center.justify-center.bg-primary
        q-icon(name="blur_on" color="white" size="30px")
    div(
      v-if="votePanning"
      :style=`{position: 'absolute', zIndex: 198, borderTop: '1px solid #eee'}`).row.fit.items-center.justify-center.bg-white
      span Pan to vote
    div(:style=`{marginLeft: '90px'}`).row.full-height.items-center
      span.text-bold 100
      small.text-bold / 10
    .col
    q-btn(round flat color="grey-9" icon="keyboard_arrow_up" @click="fragmentMini()")
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat color="grey-9" icon="more_vert" @click="nodeActions")
  //- author
  //- transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
  //-   div(
  //-     v-if="opened"
  //-     :style=`{height: '50px'}`).row.full-width.items-center.justify-center
  //-     div(:style=`{height: '50px', width: '50px'}`).row.items-center.justify-center
  //-       div(:style=`{height: '35px', width: '35px', borderRadius: '50%'}`).bg-grey-3
  //-     .col.full-height
  //-       .row.fit.items-center
  //-         span Author
</template>

<script>
import ncFragment from 'components/node_composer/nc_fragment'

export default {
  name: 'nodeNew',
  props: ['ctx', 'index', 'width', 'node', 'needFull', 'nodeFullReady', 'visible'],
  components: {ncFragment},
  data () {
    return {
      nodeFullError: null,
      nodeFull: null,
      voteLeft: 0,
      votePanning: false,
      opened: false,
      fPosition: 'absolute',
      fMarginTop: 0,
      fMini: true,
      fWidth: 100,
      fBottom: 30,
      fRight: 10,
      previewHeight: 0
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
    async fragmentMini () {
      if (this.ctx === 'inList') {
        this.$log('inList')
      } else {
        this.$log('fragmentMini START')
        this.$tween.to(this, 0.6, {
          fBottom: -(this.previewHeight + 60),
          fWidth: this.width - 16,
          fRight: 0,
          fMarginTop: this.previewHeight,
          onComplete: async () => {
            this.$log('fragmentMini DONE')
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
      if (to > 0 && to <= 500 - 90 - 16) {
        this.voteLeft += e.delta.x
      }
      if (e.isFirst) {
        this.votePanning = true
      }
      if (e.isFinal) {
        this.votePanning = false
        this.opened = !this.opened
        this.$tween.to(this, 0.4, {voteLeft: 0})
      }
    },
    play () {
      this.$log('play')
      this.$refs.fTop.play()
    },
    pause () {
      this.$log('pause')
      this.$refs.fTop.pause()
    },
    open () {
      this.$log('open')
    },
    nodeActions () {
      this.$log('nodeActions')
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad start', this.index, this.node.oid)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 0 })
        this.nodeFullError = null
      } catch (err) {
        this.$logE('node', 'nodeLoad error', err)
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
