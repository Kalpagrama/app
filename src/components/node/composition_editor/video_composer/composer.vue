<template lang="pug">
div
  div(
    :style=`{
      position: 'absolute', height: extraHeight+'px', left: '0px', bottom: '0px',
      borderRadius: '10px 10px 0 0'
      }`
    ).column.full-width.bg-grey-9
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
      :style=`{height: '60px', order: 10, borderRadius: '10px'}`).row.full-width.items-center.content-center.q-px-sm.b-100
      //- q-btn(
      //-   flat color="white" icon="keyboard_arrow_left" @click="$emit('cancel')"
      //-   :style=`{width: '42px', height: '42px', background: 'rgba(0,0,0,0.1)'}`)
      .col
        kalpa-buttons(:value="tabs" :id="tab" @id="tabChanged($event)").justify-start
      q-btn(
        push color="green" no-caps @click="$emit('cancel')"
        :style=`{height: '42px'}`)
        span Done
</template>

<script>
import extraInfo from './extra/extra_info'
import extraLayers from './extra/extra_layers_new'
import extraExplore from './extra/extra_explore'
import extraSpheres from './extra/extra_spheres'

export default {
  name: 'videoComposer-composer',
  components: {extraInfo, extraLayers, extraExplore, extraSpheres},
  props: ['ctx', 'mode', 'composition', 'meta', 'player', 'styles'],
  data () {
    return {
      extraHeight: 60,
      tab: 'info',
      tabs: [
        {id: 'info', name: 'Info'},
        {id: 'layers', name: 'Layers'},
        // {id: 'spheres', name: 'Spheres'},
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
        maxiPre: this.$q.screen.height - 60,
        maxi: this.$q.screen.height - 0
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
  }
}
</script>
