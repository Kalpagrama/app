<template lang="pug">
div(
  :style=`{
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).row.full-width
  div(:style=`{width: '50px'}`).row.full-height.items-start.content-start.justify-center.q-pa-sm.br
    q-btn(
      v-for="(t,ti) in tabs" :key="t.id"
      @click="tabId = t.id"
      round flat dense color="white" icon="menu"
    ).full-width
  .col.bg
    //- header
    div(
      :style=`{
        background: 'rgba(50,50,50,0.9)',
        borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)',
      }`
      ).row.full-width.q-py-sm
      //- div(v-if="false && layer").row.full-width.items-center.content-center.text-grey-4.q-px-sm.q-pb-sm
      //-   small.q-ml-sm {{ $time(layerStart) }}
      //-   small.q-mx-xs -
      //-   small {{ $time(layerEnd) }}
      //-   small.q-mx-xs /
      //-   small {{ $time(layerDuration) }}
      //-   .col
      //-   q-btn(round flat color="green" icon="check" @click="layerDone()")
      div(v-if="tabId === 'name'").row.full-width.items-center.content-center.q-px-sm
        .col
          q-input(
            :value="layerName"
            ref="nameInput"
            filled dark color="grey-5"
            label="What do you see?"
            autogrow
            @input="nameInputChanged"
            @focus="nameInputFocused"
            @blur="nameInputBlurred"
            :style=`{
              borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)',
            }`
            ).full-width.b-50
        q-btn(round flat color="green" icon="check" @click="layerDone()").q-ml-sm
      div(v-if="tabId === 'frames' && layer").row.full-width.q-py-sm
        layer-frames(:layer="layer" :stateExplorer="stateExplorer")
      //- div(v-if="layer").row.full-width.q-pa-sm
      //-   q-btn(round flat dense color="white" icon="play_arrow")
      //-   .col.full-height.q-px-sm
      //-     div(
      //-       :style=`{
      //-         position: 'relative',
      //-         borderRadius: '10px', overflow: 'hidden',
      //-       }`).row.fit.b-70
      //-       div(
      //-         :style=`{
      //-           position: 'absolute', zIndex: 200,
      //-           left: '0px',
      //-           width: layerPercent*100+'%',
      //-           background: layer.color,
      //-           pointerEvents: 'none',
      //-         }`
      //-         ).row.full-height
      //-   q-btn(round flat dense color="white" icon="refresh")
      //-   q-btn(round flat dense color="white" icon="tune")
</template>

<script>
import layerFrames from './layer_frames'

export default {
  name: 'layerEditor',
  components: {layerFrames},
  props: ['stateExplorer'],
  data () {
    return {
      mode: 'mini',
      name: '',
      tabId: 'name',
      tabs: [
        {id: 'name'},
        {id: 'frames'},
        {id: 'spheres'},
      ]
    }
  },
  computed: {
    layer () {
      return this.stateExplorer.contentWs.layers.find(layer => layer.id === this.stateExplorer.layerSelected)
    },
    layerName () {
      if (this.layer?.spheres.length > 0) return this.layer.spheres[0].name
      else return ''
    },
    layerStart () {
      return this.layer?.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer?.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layer?.figuresAbsolute[1].t - this.layer?.figuresAbsolute[0].t
    },
    layerPercent () {
      return (this.stateExplorer.currentTime - this.layerStart) / this.layerDuration
    }
  },
  methods: {
    layerAdd (layerInput) {
      this.$log('layerAdd')
      if (!layerInput) {
        let start = this.stateExplorer.currentTime
        let end = start + 10 > this.stateExplorer.duration ? this.stateExplorer.duration : start + 10
        layerInput = {
          contentOid: this.stateExplorer.content.oid,
          figuresAbsolute: [
            {t: start, points: []},
            {t: end, points: []}
          ],
          figuresRelative: [],
          spheres: []
        }
      }
      // make layer input
      let layerIndex = this.stateExplorer.contentWs.layers.length
      let layerId = Date.now().toString()
      layerInput.id = layerId
      layerInput.color = this.$randomColor(layerId)
      this.$log('layerAdd layerInput', layerInput)
      // set layer
      this.$set(this.stateExplorer.contentWs.layers, layerIndex, layerInput)
      this.$log('layerAdd done')
      return layerId
    },
    layerDone () {
      this.$log('layerDone')
      this.stateExplorer.set('layerSelected', null)
    },
    nameInputChanged (e) {
      this.$log('nameInputChanged', e)
      this.$set(this.layer.spheres, 0, {name: e})
    },
    async nameInputFocused () {
      this.$log('nameInputFocused')
      if (this.layer) {
      }
      else {
        this.stateExplorer.set('layerSelected', await this.layerAdd())
        this.$nextTick(() => {
          this.$refs.nameInput.focus()
        })
      }
    },
    nameInputBlurred () {
      this.$log('nameInputBlurred')
    }
  }
}
</script>
