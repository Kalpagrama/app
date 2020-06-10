<template lang="pug">
.column.fit
  //- header
  .row.full-width.items-center.content-center.q-pa-md
    span(:style=`{fontSize: '18px'}`).text-white.text-bold Layers
  //- header search
  .row.full-width.q-pa-sm
    q-input(
      v-model="searchString"
      filled dark dense color="grey-6"
      label="Find layer..."
      ).full-width
  //- body
  .col.full-width.scroll
    div(:style=`{paddingBottom: '80px'}`).row.full-width.items-start.content-start.q-px-sm
      //- small.text-white {{stateExplorer.content}}
      //- small.text-white {{stateExplorer.contentWs}}
      div(
        v-for="(l,li) in layers" :key="li" @click="layerClick(l,li)"
        :class=`{
          'b-90': l.id === stateExplorer.layerId,
          'b-70': l.id !== stateExplorer.layerId,
        }`
        :style=`{
          height: '46px',
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).row.full-width.items-center.content-center.cursor-pointer.q-mb-xs.q-px-md
        .col
          span(v-if="l.spheres.length > 0").text-white {{ l.spheres[0].name }}
        span.text-white {{ $time(l.figuresAbsolute[0].t) }}
      //- add layer
      q-btn(
        @click="$emit('add')"
        flat round color="green" icon="add"
        :style=`{
          height: '46px',
          borderRadius: '10px',
          overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.justify-center.b-70
</template>

<script>
export default {
  name: 'contentLayers',
  props: ['stateExplorer'],
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    layers () {
      return this.stateExplorer.contentWs?.layers
    }
  },
  watch: {
    'stateExplorer.layerId': {
      handler (to, from) {
        this.$log('stateExplorer.layerId CHANGED', to)
        if (to) {
          let layer = this.stateExplorer.contentWs.layers.find(l => l.id === to)
          this.$log('layer', layer)
          if (layer) {
            this.stateExplorer.player.setCurrentTime(layer.figuresAbsolute[0].t)
          }
        }
      }
    }
  },
  methods: {
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      this.stateExplorer.set('layerId', l.id)
      this.stateExplorer.set('nodeEditorOpened', true)
      // this.stateExplorer.player.setCurrentTime(l.figuresAbsolute[0].t)
    }
  },
}
</script>
