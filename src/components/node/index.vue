<template lang="pug">
div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start
  //- fragments wrapper
  div(
    :style=`{
      position: 'relative',
      minHeight: previewHeight+'px', borderRadius: '10px', overflow: 'hidden',
      height: previewHeight > 0 ? previewHeight+'px' : 'auto'}`
    ).row.full-width.items-start.bg-black
    //- vote
    div(
      v-if="votePanning"
      :style=`{
        position: 'absolute', zIndex: 1000, paddingBottom: '30px',
        borderRadius: '10px', overflow: 'hidden', background: 'rgba(0,0,0,0.5)'}`
        ).row.fit.items-end.content-end.justify-center
      //- span(
      //-   :style=`{padding: 0, margin: 0, fontSize: 20*(voteValue/10) < 50 ? 50+'px' : 20*(voteValue/10)+'px',
      //-     display: 'table-cell',
      //-     verticalAlign: 'bottom'}`
      //-   ).text-center.text-bold.text-white.bg {{ voteValue }}
      div(
        :style=`{fontSize: 10*(voteValue/10) < 50 ? 50+'px' : 10*(voteValue/10)+'px'}`
      ).row.full-width.justify-center.items-end.text-bold.text-white {{ voteText }}
      .row.full-width.justify-center
        span(:style=`{fontSize: '50px'}`
          ).text-bold.text-white.text-center {{ voteLabel }}
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
      :mini="fragmentMini === 0" @mini="fragmentChange(0)"
      :style=`{
        position: previewHeight > 0 ? 'absolute' : 'relative', zIndex: fragmentMini === 0 ? 200 : 150,
        opacity: styles[0].opacity,
        maxWidth: styles[0].maxWidth+'%',
        bottom: styles[0].bottom+'px',
        right: styles[0].right+'px'}`)
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
      :mini="fragmentMini === 1" @mini="fragmentChange(1)"
      :style=`{
        position: 'absolute', zIndex: fragmentMini === 1 ? 200 : 150,
        height: fragmentMini === 1 ? 'auto' : previewHeight+'px',
        opacity: styles[1].opacity,
        maxWidth: styles[1].maxWidth+'%',
        bottom: styles[1].bottom+'px',
        right: styles[1].right+'px'}`)
    //- height: fragmentMini === 1 ? 'auto' : '100%',
    //- div(:style=`{position: 'absolute', zIndex: 100, right: 0+'px', bottom: 0+'px', height: '50px', maxWidth: 20+'%', width: '50px', opacity: 0.5}`).row.fit.bg-yellow
  //- name, essence
  div(
    ref="nodeName" @click="$emit('nodeClick', [node, nodeFull])"
    :style=`{minHeight: '60px'}`
    :class=`{'bg-red': !nodeFull}`
    ).row.full-width.items-center.justify-center
    //- span.text-green.text-bold.q-mr-sm {{index}}
    span.text-bold.text-center.cursor-pointer {{ node.name }}
  //- .row.full-width.bg-red
  //-   span.text-white.full-width stylesMaxi: {{stylesMaxi}}
  //-   span.text-white.full-width stylesMini: {{stylesMini}}
  //-   span.text-white.full-width styles[0]: {{styles[0].toString()}}
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
        round push color="white" :loading="nodeVoting" @click="nodeVote()"
        :style=`{height: '40px', width: '40px', borderRadius: '50%'}`
        ).row.items-center.justify-center.bg-green.cursor-pointer
        q-icon(name="blur_on" color="white" size="30px")
    //- vote tint and helper text
    div(
      v-if="votePanning"
      :style=`{position: 'absolute', zIndex: 198}`).row.fit.items-center.justify-center.bg-white
      span Pan to vote
    div( :style=`{marginLeft: '70px'}`).row.full-height.items-center.content-center
      span(:style=`{borderBottom: '1px solid #eee'}`).text-bold.full-width.text-center {{voteHuman(node.rate)}}
      span.text-bold.full-width.text-center {{voteHuman(node.rateUser)}}
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
      voteValue: 0,
      voteLabels: {},
      fPosition: 'absolute',
      fMarginTop: 0,
      fMini: true,
      fWidth: 100,
      fBottom: 30,
      fRight: 10,
      previewHeight: 0,
      previewWidth: 0,
      fragmentMini: 1,
      fragmentMiniStart: 1,
      nodeVoting: false,
      stylesMini: {right: 20, bottom: 20, maxWidth: 20, maxHeight: 20},
      stylesMaxi: {right: 0, bottom: 0, maxWidth: 100, maxHeight: 100},
      styles: [{right: 0, bottom: 0, maxWidth: 100, opacity: 1}, {right: 20, bottom: 20, maxWidth: 20, opacity: 1}],
      fragmentSecondPlaying: false
    }
  },
  computed: {
    voteText () {
      // let v = this.voteValue
      // if (v > 0 && < 20)
      // return Math.round(this.voteValue / 20)
      // return (this.voteValue / 20).toFixed(1)
      let v = (this.voteValue / 20).toFixed(1)
      let arr = v.split('.')
      return arr[0] + ',' + arr[1]
    },
    voteLabel () {
      let v = this.voteValue
      if (v >= 0 && v < 20) return 'That sucks'
      else if (v >= 20 && v < 40) return 'Nah'
      else if (v >= 40 && v < 60) return 'So so'
      else if (v >= 60 && v < 80) return 'High'
      else if (v >= 80 && v < 100) return 'Soo high'
      else return 'No way'
    }
  },
  watch: {
    visible: {
      immediate: false,
      async handler (to, from) {
        // this.$log('visible CHANGED', to)
        if (to) {
          this.play()
          // this.$q.notify('visible')
        } else {
          this.pause()
        }
      }
    },
    needFull: {
      immediate: true,
      async handler (to, from) {
        // this.$log('needFull CHANGED', to)
        if (to && !this.nodeFull) {
          this.nodeFull = await this.nodeLoad(this.node.oid)
        }
      }
    },
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        // this.$log('nodeFullReady CHANGED', to)
        if (to) {
          this.nodeFull = this.nodeFullReady
        }
      }
    }
  },
  methods: {
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
    voteHuman (vote) {
      let v = ((vote * 100) / 20).toFixed(1)
      let arr = v.split('.')
      return arr[0] + ',' + arr[1]
    },
    async votePan (e) {
      // this.$log('votePan', e)
      let to = this.voteLeft + e.delta.x
      if (to > 0 && to <= this.previewWidth - 80) {
        this.voteLeft += e.delta.x
        this.voteValue = Math.round((this.voteLeft / this.previewWidth) * 100)
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
    fragmentWidth (index, width) {
      // this.$log('fragmentWidth', index, width)
      if (index === 0) {
        this.previewWidth = width
        this.$emit('previewWidth', width)
      }
    },
    fragmentHeight (index, height) {
      // this.$log('fragmentHeight', index, height)
      if (index === 0) {
        this.previewHeight = height
        this.$emit('previewHeight', height)
        // TODO: emit scrollTop event of node in scroll wrapper
        // this.$emit('scrollTop', this.$el.scrollHeight)
      }
    },
    fragmentEnded (index) {
      this.$log('fragmentEnded', index)
      // if (index === 0) this.fragmentChange(0)
      // else this.fragmentChange(1)
    },
    async fragmentChange (index) {
      this.$log('fragmentChange', index)
      this.fragmentMiniStart = index === 0 ? 1 : 0
      this.$tween.to(
        this.styles[index],
        0.65,
        {
          maxWidth: 100,
          right: 0,
          bottom: 0,
          onComplete: () => {
            this.fragmentMini = index === 0 ? 1 : 0
            this.fragmentMiniStart = index === 0 ? 1 : 0
            this.styles[index === 0 ? 1 : 0].opacity = 0
            this.$tween.to(this.styles[index === 0 ? 1 : 0], 0.1, {
              maxWidth: 5,
              right: 16,
              bottom: 32,
              onComplete: () => {
                this.$tween.to(this.styles[index === 0 ? 1 : 0], 0.1, {
                  maxWidth: 25,
                  opacity: 1
                })
              }
            })
          }
        }
      )
      if (index === 0) {
        this.$refs.fragmentFirst.play()
        this.$refs.fragmentSecond.pause()
      } else {
        this.$refs.fragmentFirst.pause()
        this.$refs.fragmentSecond.play()
      }
    },
    nodeAction () {
      this.$log('nodeAction')
      this.$store.commit('node/stateSet', ['nodeOptionsPayload', JSON.parse(JSON.stringify(this.nodeFull))])
      this.$store.commit('node/stateSet', ['nodeOptionsDialogOpened', true])
    },
    async nodeVote (rate = 0.5) {
      try {
        this.$log('nodeVote start')
        this.nodeVoting = true
        await this.$wait(1000)
        let vote = await this.$store.dispatch('node/nodeRate', {oid: this.node.oid, rate: rate})
        this.$log('nodeVote done', vote)
        this.nodeVoting = false
      } catch (e) {
        this.$log('nodeVote error', e)
        this.nodeVoting = false
      }
    },
    async nodeLoad (oid) {
      // this.$log('nodeLoad start', this.index, this.node.oid)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 0 })
        this.nodeFullError = null
      } catch (err) {
        this.$logE('node', 'nodeLoad error', err)
        // this.$emit('error')
        // node = null
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
