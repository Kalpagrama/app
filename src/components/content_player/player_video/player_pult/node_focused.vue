<template lang="pug">
div(
  ).row.full-width.items-center.content-center.justify-center.q-pa-sm
  q-dialog(
    v-model="nodeShow"
    :maximized="true"
    position="bottom"
    :contentStyle=`{
      backgroundColor: 'rgba(30,30,30,0.99)',
    }`)
    div(
      @click.self="nodeShow = false"
      :style=`{
        height: $q.screen.height+'px',
        background: 'rgba(20,20,20,0.99)',
      }`
      ).row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        :style=`{
          minHeight: '66px',
        }`
        ).row.full-width
        div(
          v-if="nodeCreating"
          :style=`{textAlign: 'center'}`).row.full-width.justify-center.q-pa-lg
          h1(:style=`{fontSize: '36px',}`).text-white.text-bold {{$t('Ядро создано 🎉')}}
      item-feed(
        :itemState="{}"
        :isActive="true"
        :isVisible="true"
        :itemShortOrFull="player.node"
        :style=`{
          maxWidth: 600+'px',
          background: 'rgba(20,20,20,0.95)',
          borderRadius: '10px',
        }`).q-pb-sm
      .row.full-width.justify-center.q-py-sm
        div(
          :style=`{
            maxWidth: 600+'px',
          }`
          ).row.full-width
          q-btn(
            outline no-caps color="green"
            :style=`{
              height: '50px',
            }`
            @click="copyLink"
            ).full-width
            span.text-bold {{$t('Copy link')}}
          q-btn(
            outline no-caps color="grey-8"
            :style=`{
              height: '50px',
            }`
            @click="nodeShow = false"
            ).full-width.q-mt-sm
            span.text-bold {{$t('Back to watching')}}
  //q-btn(
  //  @click="nodeRefresh()"
  //  round flat color="white" icon="refresh")
  div(
    @click="nodeLaunch()"
    ).row.col.cursor-pointer
    div(
      :style=`{
        textAlign: 'center'
      }`
      ).row.full-width.justify-center
      span(:style=`{pointerEvents: 'none', fontSize: fontSize + 'px'}`).text-white {{ player.node.name }}
  q-btn(
    round flat color="red" icon="clear"
    @click="player.setState('node', null)").absolute-bottom-right
</template>

<script>
import { makeRoutePath } from 'src/system/common/common_func'

export default {
  name: 'nodeFocused',
  props: ['player', 'contentKalpa', 'options'],
  data () {
    return {
      nodeShow: false,
      nodeCreating: false,
      nodeCreated: false,
      shareLink: ''
    }
  },
  computed: {
    start () {
      return this.player.figures[0].t
    },
    end () {
      return this.player.figures[1].t
    },
    fontSize () {
      let l = this.player.node.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else if (l >= 40) return 12
      else return 14
    },
  },
  watch: {
    nodeShow: {
      handler (to, from) {
        if (to) this.player.pause()
        else this.player.play()
      }
    },
    'player.node.uploadStage': {
      deep: false,
      handler (to, from) {
        if (!this.nodeCreating) return
        this.$logW('player.node TO', to)
        if (to === 'COMPLETE') {
          // if (!this.isHidden) this.$emit('created')
          this.nodeShow = true
          this.nodeCreated = true
          this.$q.notify({
            type: 'positive',
            message: 'Node created 🎉',
            position: 'top',
            actions: [
              {
                // label: 'Перейти',
                color: 'white',
                icon: 'launch',
                handler: () => {
                  this.$router.push(`/node/${this.player.node.oid}`)
                }
              }
            ]
          })
        }
      }
    },
    'player.currentTime': {
      handler (to, from) {
        if (to >= this.end) {
          this.player.setCurrentTime(this.start)
        }
        if (to < this.start - 0.5) {
          this.player.setCurrentTime(this.start)
        }
      }
    },
  },
  methods: {
    async copyLink () {
      this.$log('copyLink')
      this.shareLink = makeRoutePath(this.player.node, true)
      await this.$systemUtils.writeToClipboard(this.shareLink, this.$t('Ссылка скопирована!'))
    },
    // nodeRefresh () {
    //   this.$log('nodeRefresh')
    //   this.player.setCurrentTime(this.start)
    //   this.player.play()
    // },
    nodeLaunch () {
      this.$log('nodeLaunch')
      if (this.player.node.oid) {
        this.nodeShow = true
      }
      else {
        // do what?
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.player.node.uploadStage === 'COMPLETE') {
      this.nodeCreating = false
      this.nodeCreated = true
      // this.nodeShow = true
    }
    else {
      this.nodeCreating = true
      this.nodeCreated = false
    }
  }
}
</script>
