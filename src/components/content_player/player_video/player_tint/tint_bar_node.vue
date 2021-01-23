<template lang="pug">
div(
  :style=`{
    //- position: 'relative',
  }`
  ).row.full-width.justify-center
  div(
    :style=`{
      position: 'absolute', bottom: '0px',
      borderRadius: '10px',
      maxWidth: '340px',
    }`
    ).row.b-30.q-pa-sm
    div(
      :style=`{
        position: 'absolute', top: '0px', right: '-36px',
        width: '36px',
      }`
      ).row.items-start.content-start.full-height
      q-btn(
        @click="nodePublish()"
        round flat dense color="green" icon="check"
        :loading="nodePublishing")
      q-btn(
        @click="nodeDelete()"
        round flat dense color="red" icon="delete_outline")
    .row.full-width
      q-input(
        v-model="node.name"
        borderless dark dense
        type="textarea" autogrow
        placeholder="В чем суть?"
        :counter="true || node.name.length > 10"
        :maxlength="120"
        :input-style=`{
          paddingLeft: '8px',
          paddingTop: '8px',
          paddingRight: '8px',
          fontSize: fontSize+'px',
        }`
        :style=`{
        }`).full-width
        template(v-slot:hint)
          .row.full-width
            q-btn(
              @click="nodeStart()"
              round flat dense size="sm"
              :color="nodePlaying ? 'red' : 'white'"
              :icon="nodePlaying ? 'stop' : 'play_arrow'").q-mr-sm
            q-btn(
              @click="nodeRefresh()"
              round flat dense size="sm" icon="refresh")
    //- .row.full-width.br
      //- template(v-slot:hint)
      div(:style=`{}`).row.full-width.bg
          div(:style=`{}`).row.full-width
            q-btn(
              @click="nodeStart()"
              round flat dense size="sm"
              :color="player.playing ? 'red' : 'white'"
              :icon="player.playing ? 'pause' : 'play_arrow'")
            .col.q-px-sm
              div(:style=`{position: 'relative',}`).row.fit.items-center.content-center
                div(
                  ref="figure-wrapper"
                  :style=`{position: 'relative', height: '6px',borderRadius: '3px',marginBottom: '1px',}`).row.full-width.b-50
                  div(
                    v-show="figurePercent >= 0 && figurePercent <= 1"
                    :style=`{
                      position: 'absolute', zIndex: 100,
                      left: '0px',
                      width: figurePercent*100+'%',
                      height: '100%',
                      borderRadius: '3px',
                    }`).row.bg-white
                    div(
                      v-touch-pan.mouse.prevent="onPan"
                      :style=`{
                        position: 'absolute', zIndex: 1000,
                        right: -20+3+'px',
                        top: -20+3+'px',
                        width: '40px', height: '40px',
                        cursor: 'grabbing',
                      }`
                      ).row.items-center.content-center.justify-center
                      div(
                        :style=`{
                          pointerEvents: 'none',
                          height: 16+'px', width: 16+'px',
                          borderRadius: '50%',
                        }`
                        ).row.bg-white
            q-btn(
              @click="nodeRefresh()"
              round flat dense size="sm" icon="refresh")
    .row.full-width.q-pt-xs.q-mt-sm
      //- small.text-grey-7 Развлечения, #sphereald maklsd mlaksmd alk1, #sphere2 alskd alskd laksd alks, #sphere3 kadsals dalsk dlaskd laskd lak
      q-input(
        v-model="spheres"
        borderless dark dense size="xs" no-caps
        type="textarea" autogrow
        :rows="1"
        :input-style=`{
          fontSize: '12px',
          //- height: '20px',
          //- padding: '4px',
        }`
        :style=`{
          fontSize: '12px',
          //- height: '20px',
        }`).full-width.text-grey-5
        template(v-slot:prepend)
          small(:style=`{fontSize: '12px',}`).text-grey-7 Развлечения
</template>

<script>
export default {
  name: 'tintBarNode',
  props: ['player', 'convert'],
  data () {
    return {
      node: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      },
      nodePublishing: false,
      nodePlaying: false,
      width: 0,
      spheres: ''
    }
  },
  computed: {
    figureDuration () {
      return this.player.figure[1].t - this.player.figure[0].t
    },
    figurePercent () {
      return (this.player.currentTime - this.player.figure[0].t) / this.figureDuration
    },
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    }
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (!this.nodePlaying) return
        this.$log('player.currentTime TO', to)
        if (to < this.player.figure[0].t || to >= this.player.figure[1].t) {
          this.player.setCurrentTime(this.player.figure[0].t)
        }
      }
    }
  },
  methods: {
    async onPan (e) {
      this.$log('onPan', e)
      if (e.delta.x === 0) return
      if (e.isFirst) {
        // this.$emit('first')
        // this.pointDragging = true
        // this.pointDraggingIndex = index
        this.player.pause()
      }
      // work
      let t = this.player.currentTime
      let tTotal = t + (e.delta.x * this.figureDuration) / this.width / this.figurePercent
      // this.$log('onPan t', t)
      this.player.setCurrentTime(tTotal)
      // final
      if (e.isFinal) {
        // await this.$wait(300)
        // this.$emit('final')
        // this.pointDragging = false
        // this.pointDraggingIndex = -1
      }
    },
    nodeDelete () {
      this.$log('nodeDelete')
      this.player.setState('figure', null)
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        await this.$wait(1000)
        // TODO: do stuff
        this.$log('nodePublish done')
        this.nodePublishing = false
      }
      catch (e) {
        this.$log('nodePublish')
        this.nodePublishing = false
      }
    },
    nodeStart () {
      this.$log('nodeStart')
      if (this.nodePlaying) {
        this.nodePlaying = false
      }
      else {
        this.nodePlaying = true
        if (this.figurePercent < 0 || this.figurePercent > 1) {
          this.player.setCurrentTime(this.player.figure[0].t)
        }
        this.player.play()
      }
      // if (this.player.playing) {
      //   this.player.pause()
      // }
      // else {
      //   if (this.figurePercent < 0 || this.figurePercent > 1) {
      //     this.player.setCurrentTime(this.player.figure[0].t)
      //   }
      //   this.player.play()
      // }
    },
    nodeRefresh () {
      this.$log('nodeRefresh')
      this.player.setCurrentTime(this.player.figure[0].t)
      // this.player.play()
    }
  },
  mounted () {
    this.$log('mounted')
    // let {width, height} = this.$refs['figure-wrapper'].getBoundingClientRect()
    // this.width = width
  }
}
</script>
