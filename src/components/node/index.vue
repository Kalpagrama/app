<template lang="pug">
div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start
  //- fragments wrapper
  div(
    :style=`{
      position: 'relative',
      minHeight: previewHeight+'px', borderRadius: '10px', overflow: 'hidden',
      height: previewHeight > 0 ? previewHeight+'px' : 'auto'}`
    ).row.full-width.items-start.bg-black
    //- vote tint on fragments
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
    component(:is="fc ? fc : 'nc-fragment'"
      ref="fragmentFirst"
      :ctx="ctx" :index="0"
      :thumbUrl="node.meta.fragments[0].thumbUrl"
      @previewWidth="$event => fragmentWidth(0, $event)"
      @previewHeight="$event => fragmentHeight(0, $event)"
      @ended="fragmentEnded(0)"
      @action="nodeActionStart"
      :visible="visible"
      :fragment="nodeFull ? nodeFull.fragments[0] : null"
      :mini="fragmentMini === 0" @mini="fragmentChange(0)"
      :style=`{
        position: previewHeight > 0 ? 'absolute' : 'relative', zIndex: fragmentMini === 0 ? 200 : 150,
        opacity: styles[0].opacity,
        maxWidth: styles[0].maxWidth+'%',
        bottom: styles[0].bottom+'px',
        right: styles[0].right+'px'}`)
    component(:is="fc ? fc : 'nc-fragment'"
      ref="fragmentSecond"
      :ctx="ctx" :index="1"
      :thumbUrl="node.meta.fragments[1].thumbUrl"
      @previewWidth="$event => fragmentWidth(1, $event)"
      @previewHeight="$event => fragmentHeight(1, $event)"
      @ended="fragmentEnded(1)"
      @action="nodeActionStart"
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
      small.text-grey-7 31.12.2019
</template>

<script>
import nodeFragment from 'components/node/fragment'
import ncFragment from 'components/node_composer/nc_fragment'
import { fragments } from 'src/schema/fragments'
import { apollo } from 'src/boot/apollo'

export default {
  name: 'nodeNew',
  // TODO заменить имя св-ва visible на active
  props: ['ctx', 'index', 'opened', 'node', 'needFull', 'needFullPreload', 'nodeFullReady', 'visible', 'fc'],
  components: {nodeFragment, ncFragment},
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
  watch: {
    visible: {
      immediate: false,
      async handler (to, from) {
        if (to) {
          this.$log(` indx=${this.index} active(visible) CHANGED to ${to}`)
          this.play()
        } else {
          this.$log(`. indx=${this.index} active(visible) CHANGED to ${to} index = ${this.index}`)
          this.pause()
        }
      }
    },
    needFull: {
      immediate: true,
        async handler (to, from) {
          if (to) await this.nodeLoad()
          else await this.nodeDestroy()
        }
    },
    needFullPreload: {
      immediate: true,
      async handler (to, from) {
        if (to) await this.nodePreLoad()
        else await this.nodeDestroy()
      }
    },
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$log('nodeFullReady CHANGED', to)
          this.nodeFull = this.nodeFullReady
        }
      }
    },
    // node: {
    //   immediate: true,
    //   handler (to, from) {
    //     this.$log('node CHANGED:', to)
    //   }
    // }
  },
  methods: {
    async play () {
      if (this.nodeFull){
        // this.$log(` play indx=${this.index} fr=${this.fragmentMini}`, this.$refs.fragmentFirst, this.$refs.fragmentSecond)
        if (this.fragmentMini === 0) await this.$refs.fragmentSecond.play()
        else await this.$refs.fragmentFirst.play()
      }
    },
    pause () {
      this.$log('pause')
      if (this.fragmentMini === 0) this.$refs.fragmentSecond.pause()
      else this.$refs.fragmentFirst.pause()
    },
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
        if (this.visible) this.play()
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
    nodeActionStart () {
      this.$log('nodeActionStart')
      this.$store.dispatch('ui/action', [
        {
          timeout: 4000,
          payload: this.nodeFull,
          name: this.node.name,
          actions: {
            save: {name: 'Save to WS'},
            confirm: {name: 'Mix node'}
          }
        },
        this.nodeAction
      ])
      this.$store.commit('node/stateSet', ['nodeOptionsPayload', JSON.parse(JSON.stringify(this.nodeFull))])
      this.$store.commit('node/stateSet', ['nodeOptionsDialogOpened', true])
    },
    nodeAction (action) {
      this.$log('nodeAction', action)
      switch (action) {
        case 'confirm': {
          this.$log('MIX MIX MIX')
          let nodeInput = this.nodeFull
          delete nodeInput.oid
          this.$store.commit('workspace/stateSet', ['wsItem', {type: 'node', item: nodeInput}], { root: true })
          this.$router.push('/create')
          break
        }
        case 'save': {
          this.$log('SAVE SAVE')
          let nodeInput = this.nodeFull
          delete nodeInput.oid
          this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(nodeInput)), { root: true })
          break
        }
      }
      this.$log('nodeAction done')
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
    },
    // упреждающая загрузка ядра (с низким приоритетом. Запрос на сервер будет сделан по-возможности)
    async nodePreLoad () {
      if (this.nodeFull) return
      let oid = this.node.oid
      this.$log(`nodePreLoad start indx=${this.index} oid=${oid}`)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, priority: 1 })
      } catch (err) {
        // приоритет 1 - не гарантирует что ядро будет загружено. Запрос может быть отвергнут.
        if (err !== 'queued object was evicted legally'){
          // this.$logE('nodePreLoad error', err)
          this.$emit('hide') // не показывать это ядро
          node = null
        }
      }
      if (node) this.$log('nodePreLoad OK! indx=', this.index, oid)
    },
    // гарантированная загрузка ядра
    async nodeLoad () {
      if (this.nodeFull) return
      let oid = this.node.oid
      this.$log(` nodeLoad start indx=${this.index}  oid=${oid}`)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, priority: 0 })
        this.nodeFullError = null
      } catch (err) {
        // this.$logE('nodeLoad error', err)
        this.$emit('hide') // не показывать это ядро
        node = null
        this.nodeFullError = err
      }
      if (node) {
        // this.$log(`np-test: nodeLoad OK ! indx=${this.index}  oid=${oid}`, node)
        this.nodeFull = node
        this.$nextTick(async () => {
          if (this.visible) await this.play()
        })
      }
    },
    async nodeDestroy(){
      if (this.nodeFull && !this.needFull && !this.needFullPreload){
        this.$log(` node CLEAR indx=${this.index} oid=${this.node.oid}`)
        this.nodeFull = null
      }
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
