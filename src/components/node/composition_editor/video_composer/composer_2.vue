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
  div(
    v-touch-pan.mouse.vertical.prevent="onExtraPan"
    :style=`{
      position: 'absolute', height: extraHeight+'px', left: '0px', bottom: '0px',
      borderRadius: '10px 10px 0 0'
      }`
    ).column.full-width.bg-grey-9
    //- body
    .col.full-width
      component(v-if="tab" :is="`extra-${tab}`"
        :composition="composition" :meta="meta" :player="player" :styles="styles"
        :height="extraHeight"
        @meta="$parent.$emit('meta', $event)")
    //- footer
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(
        flat color="white" icon="keyboard_arrow_left" @click="$emit('cancel')"
        :style=`{width: '38px', height: '38px', background: 'rgba(0,0,0,0.3)'}`)
      .col
        kalpa-buttons(:value="tabs" :id="tab" @id="tabChanged($event)").justify-center
      q-btn(
        push color="green" icon="check" @click="$emit('cancel')"
        :style=`{width: '38px', height: '38px'}`)
</template>

<script>
import extraInfo from './extra/extra_info'
import extraNodes from './extra/extra_nodes'
import extraExplore from './extra/extra_explore'

export default {
  name: 'videoComposer_composer',
  components: {extraInfo, extraNodes, extraExplore},
  props: ['ctx', 'mode', 'composition', 'meta', 'player', 'styles'],
  data () {
    return {
      extraHeight: 60,
      tab: 'info',
      tabs: [
        {id: 'info', name: 'Info'},
        {id: 'nodes', name: 'Nodes'},
        {id: 'explore', name: 'Explore'}
      ]
    }
  },
  computed: {
    layers () {
      return this.composition.layers
    },
    layer () {
      return this.layers[this.meta.layerIndex]
    },
    content () {
      return this.layer.content
    },
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
  mounted () {
    this.$log('mounted')
    this.styles.paddingTop = 4
    this.styles.paddingLeft = 4
    this.styles.paddingRight = 4
    // this.styles.paddingBottom = this.$q.screen.height / 2
    // this.styles.paddingBottom = this.extraHeight + 4
  }
}
</script>
