<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px'}`).row.full-width
  //- fragments
  div(:style=`{position: 'relative'}`).row.full-width
    nc-fragment(
      :width="width" :fragment="nodeFull.fragments[0]" :mini="false")
    nc-fragment(
      ref="fBottom"
      :width="fWidth" :fragment="nodeFull.fragments[1]" :mini="fMini" @mini="fragmentMini"
      :style=`{position: 'absolute', zIndex: 200, maxWidth: fWidth+'px', right: fRight+'px', bottom: fBottom+'px'}`)
  //- name
  div(
    :style=`{minHeight: '60px'}`
    ).row.full-width.items-center.justify-center
    span.text-bold.text-center {{ node.name }}
  //- div(:style=`{}`)
  //- actions
  div(:style=`{position: 'relative', height: '60px', borderRadius: '10px', overflow: 'hidden', marginTop: fMarginTop+'px'}`).row.full-width.items-center
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
  div(v-if="false").row.full-width.bg-red
    small.full-width {{ nodeFull.fragments[0].cuts }}
</template>

<script>
import ncFragment from 'components/node_composer/nc_fragment'

export default {
  name: 'nodeNew',
  props: ['index', 'width', 'node', 'nodeFullReady'],
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
      fRight: 10
    }
  },
  watch: {
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
      this.$log('fragmentMini START')
      this.$tween.to(this, 0.5, {
        fBottom: -270,
        fWidth: this.width - 16,
        fRight: 0,
        fMarginTop: 210,
        onComplete: async () => {
          this.$log('fragmentMini DONE')
          // this.fPosition = 'relative'
          this.fMini = !this.fMini
          // this.$refs.fBottom.setSize(this.width, 210)
          // await this.$wait(600)
        }
      })
    },
    votePan (e) {
      // this.$log('votePan', e)
      let to = this.voteLeft + e.delta.x
      if (to > 0 && to <= this.width - 90 - 16) {
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
    },
    pause () {
      this.$log('pause')
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
  async mounted () {
    this.$log('mounted', this.node)
    // await this.$wait(600)
    // this.fragmentMini()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
