<template lang="pug">
div
  //- actions
  //- q-btn(
  //-   round push color="green" icon="add"
  //-   :style=`{position: 'absolute', zIndex: 1000, right: '30px', bottom: styles.paddingBottom+0+'px', borderRadius: '50%'}`
  //- )
  //- header
  //- div(:style=`{position: 'absolute', zIndex: 1000, height: '60px', left: '0px', width: 'calc(100% + 0px)', top: '0px'}`).row.bg-grey-10.bg
  //- extra
  //- v-touch-pan.mouse.vertical.prevent="onExtraPan"
  div(
    :style=`{
      position: 'absolute', height: extraHeight+'px', left: '0px', bottom: '0px',
      borderRadius: '10px 10px 0 0'
      }`
    ).column.full-width.bg-grey-9
    //- q-btn(
    //-   v-touch-pan.mouse.vertical.prevent="onExtraPan"
    //-   round flat dense color="white" icon="drag_indicator"
    //-   :style=`{position: 'absolute', zIndex: 1000, top: '8px', right: '8px', background: 'rgba(0,0,0,0.2)'}`)
    //- body
    .col.full-width
      component(
        v-if="tab" :is="`extra-${tab}`"
        :composition="composition" :meta="meta" :player="player" :styles="styles"
        :height="extraHeight"
        @meta="$parent.$emit('meta', $event)")
    //- footer
    div(
      v-touch-pan.mouse.vertical.prevent="onExtraPan"
      :style=`{height: '60px', order: -1}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(
        flat color="white" icon="keyboard_arrow_left" @click="$emit('cancel')"
        :style=`{width: '42px', height: '42px', background: 'rgba(0,0,0,0.3)'}`)
      .col.q-px-sm
        kalpa-buttons(:value="tabs" :id="tab" @id="tabChanged($event)").justify-start
      q-btn(
        push color="green" no-caps @click="$emit('cancel')"
        :style=`{height: '42px'}`)
        span Done
</template>

<script>
import extraInfo from './extra/extra_info'
import extraLayers from './extra/extra_layers'
import extraExplore from './extra/extra_explore'

export default {
  name: 'videoComposer-composer',
  components: {extraInfo, extraLayers, extraExplore},
  props: ['ctx', 'mode', 'composition', 'meta', 'player', 'styles'],
  data () {
    return {
      extraHeight: 60,
      tab: 'info',
      tabs: [
        {id: 'info', name: 'Info'},
        {id: 'layers', name: 'Layers'},
        // {id: 'explore', name: 'Explore'}
      ]
    }
  },
  computed: {
    heights () {
      return {
        mini: 120,
        original: this.$q.screen.height / 3,
        middle: this.$q.screen.height / 2,
        maxiPre: this.$q.screen.height - 120,
        maxi: this.$q.screen.height - 60
      }
    }
  },
  watch: {
    extraHeight: {
      immediate: true,
      handler (to, from) {
        this.styles.paddingBottom = to + 4
      }
    }
  },
  methods: {
    tabChanged (to) {
      this.$log('tabChanged', to)
      if (this.tab === to) {
        this.tab = null
        this.$tween.to(this, 0.3, {extraHeight: 60})
      }
      else {
        this.tab = to
        switch (to) {
          case 'nodes': {
            this.$tween.to(this, 0.3, {extraHeight: this.$q.screen.height - this.heights.original})
            break
          }
          default: {
            this.$tween.to(this, 0.3, {extraHeight: this.$q.screen.height - this.heights.middle})
          }
        }
      }
    },
    onExtraPan (e) {
      // this.$log('onExtraHeaderPan', e)
      let to = this.extraHeight - e.delta.y
      if (to < 60 || to > this.heights.maxi) return
      this.extraHeight = to
      if (e.isFinal) {
        let heights = Object.values(this.heights)
        let goal = this.$q.screen.height - to
        const output = heights.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev)
        // this.$log('output', output)
        this.$tween.to(this, 0.2, {extraHeight: this.$q.screen.height - output})
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.$wait(200).then(() => {
      this.tabChanged('layers')
    })
    // window.addEventListener('blur', () => {
    //   alert('blur')
    //   window.focus()
    // })
    // window.addEventListener('focus', () => {
    //   alert('focus')
    // })
    window.onkeydown = (e) => {
      switch (e.keyCode) {
        // space
        case 32: {
          if (this.meta.playing) this.player.pause()
          else this.player.play()
          break
        }
        // left
        case 37: {
          let to = this.meta.now - 5
          if (to < 0) to = 0
          this.$parent.$emit('meta', ['mode', 'watch'])
          this.player.setCurrentTime(to)
          this.player.update()
          break
        }
        // right
        case 39: {
          let to = this.meta.now + 5
          if (to > this.meta.duration) to = this.meta.duration
          this.$parent.$emit('meta', ['mode', 'watch'])
          this.player.setCurrentTime(to)
          this.player.update()
          break
        }
      }
    }
    // this.player.mutedToggle()
    // this.styles.paddingTop = 8
    // this.styles.paddingLeft = 4
    // this.styles.paddingRight = 4
  }
}
</script>
