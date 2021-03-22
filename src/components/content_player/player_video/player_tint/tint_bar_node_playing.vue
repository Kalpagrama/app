<template lang="pug">
div(
  ).row.full-width.items-center.content-center.justify-center.q-pa-sm
  q-dialog(
    v-model="nodeShow"
    :maximized="true"
    :full-width="true"
    :contentStyle=`{
      //- backgroundColor: 'rgba(0,0,0,0.7)',
    }`)
    div(
      @click.self="nodeShow = false"
      :style=`{
        //- background: 'rgba(0,0,0,0.7)',
      }`
      ).row.fit.items-center.content-center.justify-center
      div(
        v-if="nodeCreating"
        :style=`{textAlign: 'center'}`).row.full-width.justify-center.q-pa-lg
        h1(:style=`{fontSize: '36px',}`).text-white.text-bold Ядро создано 🎉
      node-feed(
        :isActive="true"
        :isVisible="true"
        :node="player.nodePlaying"
        :style=`{
          maxWidth: 600+'px',
          background: 'rgba(30,30,30,0.9)',
          borderRadius: '10px',
        }`).q-pb-sm
  q-btn(
    @click="nodeRefresh()"
    round flat color="white" icon="refresh")
  div(
    @click="nodeLaunch()"
    ).col.cursor-pointer
    div(
      :style=`{
        textAlign: 'center'
      }`
      ).row.full-width.justify-center
      h1(:style=`{pointerEvents: 'none'}`).text-white {{ player.nodePlaying.name }}
  q-btn(
    round flat color="red" icon="clear"
    @click="player.setState('nodePlaying', null)")
</template>

<script>
export default {
  name: 'tintBarNodePlaying',
  props: ['player', 'contentKalpa', 'options'],
  data () {
    return {
      nodeShow: false,
      nodeCreating: false,
      nodeCreated: false,
    }
  },
  computed: {
    start () {
      return this.player.nodePlaying.items[0].layers[0].figuresAbsolute[0].t
    },
    end () {
      return this.player.nodePlaying.items[0].layers[0].figuresAbsolute[1].t
    }
  },
  watch: {
    nodeShow: {
      handler (to, from) {
        if (to) this.player.pause()
        else this.player.play()
      }
    },
    'player.nodePlaying': {
      deep: true,
      handler (to, from) {
        if (!this.nodeCreating) return
        this.$log('player.nodePlaying TO', to.uploadStage, to.uploadStageProgress)
        if (to.uploadStage === 'COMPLETE' && to.uploadStageProgress === 100) {
          // if (!this.isHidden) this.$emit('created')
          this.nodeShow = true
          this.nodeCreated = true
          this.$q.notify({
            type: 'positive',
            message: 'Ядро создано 🎉',
            position: 'top',
            actions: [
              {
                // label: 'Перейти',
                color: 'white',
                icon: 'launch',
                handler: () => {
                  this.$router.push(`/node/${to.oid}`)
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
    nodeRefresh () {
      this.$log('nodeRefresh')
      this.player.setCurrentTime(this.start)
      this.player.play()
    },
    nodeLaunch () {
      this.$log('nodeLaunch')
      this.nodeShow = true
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.player.nodePlaying.uploadStage === 'COMPLETE') {
      this.nodeCreating = false
      this.nodeCreated = true
    }
    else {
      this.nodeCreating = true
      this.nodeCreated = false
    }
  }
}
</script>
