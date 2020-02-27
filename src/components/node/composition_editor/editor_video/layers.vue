<template lang="pug">
.column.fit
  //- header
  //- TODO its not only layers, its VIDEO, content meta....
  div(
    :style=`{height: '60px'}`
    ).row.full-width
    .col.full-height
      .row.fit.items-center.content-center.q-px-sm
        //- TODO change meta information of the content: layers, nodes, users, spheres, etc...
        q-btn(
          v-if="mode === 'edit'"
          flat round
          color="green"
          :icon="meta.mode === 'play' ? 'pause' : 'play_arrow'" @click="playPause()"
          :style=`{borderRadius: '10px'}`)
        span.text-bold.text-green Layers
  //- body
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    //- .row.full-width.q-px-sm
    //-   .row.full-width.bg-red.text-white
    //-     div(v-for="(l, li) in layers").row.full-width.q-pa-xs layer: {{li+1}}-{{l.figuresAbsolute}}
    .row.full-width.items-start.content-start.q-pa-sm
      div(
        v-for="(l, li) in layersFiltered" :key="li"
        :class=`{'bg-grey-10': li !== meta.layerIndex, 'bg-grey-8': li === meta.layerIndex}`
        :style=`{position: 'relative', minHeight: '40px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-mb-sm.cursor-pointer
        //- inactive tint
        div(
          v-if="meta.layerIndex !== li" @click="layerClick(l, li)"
          :style=`{position: 'absolute', zIndex: 200, opacity: 0.3}`
          ).row.fit.cursor-pointer.bg-black
        //- inactive layer
        div(
          v-if="l.figuresAbsolute.length > 0"
          :style=`{height: '40px'}`
          ).row.full-width.items-center.content-center
          .col.full-height
            div(@click="layerNameSet(l)").row.fit.items-center.content-center.q-px-sm.br
              span(v-if="l.spheres.length > 0").text-white {{ l.spheres[0].name }}
          div(:style=`{width: '83px'}`).row.full-height.justify-center.items-center.content-center
            span.text-white {{ $time(l.figuresAbsolute[0].t) }}
          div(:style=`{width: '83px'}`).row.full-height.justify-center.items-center.content-center
            span.text-white {{ $time(l.figuresAbsolute[1].t) }}
        //- active layer
        div(
          v-if="meta.layerIndex === li"
          :style=`{height: height+'px'}`
          ).row.full-width.items-end.content-end.justify-end
          //- active layer EDIT
          div(
            v-if="mode === 'edit'"
            :style=`{height: '50px'}`).row.full-width.items-center.content-end.justify-end
            .col.full-height
            q-btn(round flat color="green" icon="keyboard_arrow_left" @click="l.figuresAbsolute[0].t -= 0.100")
            q-btn(round flat color="green" icon="keyboard_arrow_right" @click="l.figuresAbsolute[0].t += 0.100")
            q-btn(round flat color="green" icon="keyboard_arrow_left" @click="l.figuresAbsolute[1].t -= 0.100")
            q-btn(round flat color="green" icon="keyboard_arrow_right" @click="l.figuresAbsolute[1].t += 0.100")
            //- .col.full-height
            q-btn(
              v-if="layers.length > 1"
              round flat color="red" icon="delete_outline" @click="layerDelete(li)").q-mr-sm
          //- active layer PICK
          div(
            v-if="mode === 'pick'"
            :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between
            q-btn(dense no-caps color="green" @click="layerExport(l, li)").q-px-sm Export
</template>

<script>
export default {
  name: 'editorVideoLayers',
  props: ['mode', 'layers', 'composition', 'player', 'meta'],
  data () {
    return {
      height: 50
    }
  },
  computed: {
    layersFiltered () {
      return this.layers.filter(l => {
        return l.figuresAbsolute.length > 0
      })
    }
  },
  methods: {
    playPause () {
      this.$log('playPause', this.meta.mode)
      if (this.meta.mode === 'watch') {
        this.$emit('meta', ['mode', 'play'])
        this.$emit('meta', ['layerIndex', 0])
        this.$emit('meta', ['layerIndexPlay', -1])
        this.player.play()
      }
      else {
        this.$emit('meta', ['mode', 'watch'])
        this.$emit('meta', ['layerIndex', 0])
        this.$emit('meta', ['layerIndexPlay', -1])
      }
    },
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      if (this.mode === 'edit') {
        this.$emit('meta', ['mode', 'layer'])
        this.$emit('meta', ['layerIndexPlay', li])
      }
      else if (this.mode === 'pick') {
        this.$emit('pick', JSON.parse(JSON.stringify(this.layers[li])))
      }
    },
    layerExport (l, li) {
      this.$log('layerExport', l, li)
      // this.$emit('layerExport', l)
    },
    layerPlay () {
      this.$log('layerPlay')
    },
    layerDelete (li) {
      this.$log('layerDelete')
      // TODO: check if the layer is the fucking last??
      // TODO: delete by finding the figuresAbsolute...
      if (this.layers.length > 1) {
        this.$emit('meta', ['mode', 'layer'])
        this.$emit('meta', ['layerIndex', this.meta.layerIndex - 1])
        this.$emit('meta', ['layerIndexPlay', this.meta.layerIndex - 1])
        this.$delete(this.layers, li)
      }
    },
    layerNameSet (l) {
      this.$log('layerNameSet', l)
      this.$set(l.spheres, 0, {name: 'Layer: ' + l.figuresAbsolute[0].t})
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
