<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- layers list
  .col.full-width
    div(:style=`{}`).column.fit
      //- header
      div(
        v-if="false"
        :style=`{}`).row.full-width.justify-center
        div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center.q-py-xs
          q-btn(round flat dense color="grey-4" icon="search")
          .col
          q-btn(round flat dense color="grey-4" icon="sort")
      //- body
      .col.full-width.scroll
        .row.full-width.justify-center
          div(:style=`{}`).row.full-width.justify-center
            div(
              v-for="(l,li) in composition.layers" :key="li"
              :style=`{maxWidth: l.id === layerSelected ? '100%' : '680px',}`
              ).row.full-width.items-start.content-start.q-mb-xs
              //- left: select
              div(
                v-if="l.id !== layerSelected"
                :style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                q-checkbox(
                  v-model="layersSelected" :val="l.id"
                  dark dense color="grey-6"
                  :style=`{opacity: layersSelected.includes(l.id) ? 1 : 0.6}`)
              //- middle: input name
              .col.full-height
               layer-editor(
                 :selected="layerSelected = l.id"
                 :layer="l")
              //- right: drag
              div(
                v-if="l.id !== layerSelected"
                :style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                q-btn(
                  round flat dense color="grey-6" icon="drag_indicator")
            div(:style=`{}`).row.full-width.justify-center.q-py-sm
              div(:style=`{maxWidth: '600px'}`).row.full-width
                q-btn(
                  flat color="green" icon="add"
                  :style=`{height: '40px'}`
                  ).full-width.b-60
  //- footers for something
  div().row.full-width.q-py-sm.bg-red
  div().row.full-width.q-py-sm.bg-blue
</template>

<script>
import layerEditor from './layer_editor'

export default {
  name: 'pageEdit',
  components: {layerEditor},
  props: ['composition'],
  data () {
    return {
      name: '',
      layersSelected: [],
      layerSelected: 0
    }
  },
  mounted () {
    this.$log('mounted')
    this.layerSelected = this.composition.layers[0].id
  }
}
</script>
