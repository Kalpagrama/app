<template lang="pug">
.column.fit
  //- actions
  q-btn(
    round push color="green" icon="add" size="lg" @click="layerAdd()"
    :style=`{
      position: 'absolute', zIndex: 1000, top: '-80px', right: '18px',
      borderRadius: '50%'
    }`
  )
  //- header
  div(:style=`{borderRadius: '10px'}`
    ).row.full-width.items-center.content-center.q-pa-sm.b-100
    q-btn(round flat color="white" icon="keyboard_arrow_up").b-110
    q-btn(round flat color="white" icon="search").b-110
    .col
    q-btn(round flat color="white" icon="edit" @click="layersEdit()").b-110
    q-btn(round flat color="white" icon="sort" @click="layersSort()").b-110
  //- div().row.full-width
  //- body
  .col.full-width.scroll.q-py-sm
    div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
      div(
        v-for="(l,li) in meta.layers" :key="l.oid"
        :style=`{}`
        ).row.full-width
        div(
          v-if="true"
          :style=`{width: layersEditingToolsWidth+'px', overflow: 'hidden'}`).row
          q-checkbox(color="grey-6")
        .col.full-height
          layer-item(
            :layer="l" :layerIndex="li"
            :layerIsFirst="li === 0" :layerIsLast="li === meta.layers.length-1"
            :layerMaxHeight="layerMaxHeight"
            :player="player" :meta="meta")
        div(
          v-if="true"
          :style=`{width: layersEditingToolsWidth+'px', overflow: 'hidden'}`).row
          q-btn(flat dense icon="drag_indicator" color="white").full-width.br
            q-menu()
              .row.full-width.b-100
                div(:style=`{height: '30px'}`).row.full-width.items-center.content-center.q-px-sm
                  span(:style=`{userSelect: 'none'}`).text-white Copy
                div(:style=`{height: '30px'}`).row.full-width.items-center.content-center.q-px-sm
                  span(:style=`{userSelect: 'none'}`).text-white Delete
</template>

<script>
import layerItem from './layer_item'

export default {
  name: 'extraLayersNew',
  components: {layerItem},
  props: ['player', 'meta', 'composition'],
  data () {
    return {
      layerMaxHeight: 80,
      layersEditing: false,
      layersEditingToolsWidth: 0
    }
  },
  watch: {
    layersEditing: {
      handler (to, from) {
        this.$log('layersEditing CHANGED', to)
        if (to) {
          this.$tween.to(this, 0.5, {layersEditingToolsWidth: 40})
        }
        else {
          this.$tween.to(this, 0.5, {layersEditingToolsWidth: 0})
        }
      }
    }
  },
  methods: {
    layersSort () {
      this.$log('layersSort')
      this.composition.layers.sort((a, b) => {
        if (a.figuresAbsolute[0].t > b.figuresAbsolute[1].t) return 1
        else return -1
      })
    },
    layersEdit () {
      this.$log('layersEdit')
      this.layersEditing = !this.layersEditing
    },
    async layerAdd (startInput, endInput, layerInput) {
      this.$log('layerAdd start')
      this.$log('layerAdd inputs: ', startInput, endInput, layerInput)
      let start = startInput || this.meta.now
      let end = endInput || start + 10 < this.meta.duration ? start + 10 : this.meta.duration
      this.$log('layerAdd start/end: ', start, end)
      // get index
      let index = this.meta.layers.length
      this.$log('layerIndex index:', index)
      // get layer
      let lId = Date.now().toString()
      let l = layerInput || {
        oid: lId,
        color: this.$randomColor(lId),
        contentOid: this.meta.content.oid,
        figuresAbsolute: [
          {t: start, points: []},
          {t: end, points: []}
        ],
        figuresRelative: [],
        spheres: []
      }
      // set layer
      this.$set(this.composition.layers, index, l)
      // set meta
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndexPlay', index])
      this.$emit('meta', ['layerIndex', -1])
      this.$emit('meta', ['layerIndex', index])
      // scroll to layer?
      this.$log('layerAdd done')
    },
  }
}
</script>
