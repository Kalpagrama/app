<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $store.state.ui.borderRadius+'px',
    overflow: 'hidden',
  }`
  ).column.full-width.b-30
  //- header
  .row.full-width.q-px-sm
    //- navigation
    .row.full-width.items-center.content-center.justify-between.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Соедени с чем-нибудь
      q-btn(round flat color="white" icon="more_vert" :style=`{opacity: 0}`)
    //- types
    .row.full-width.justify-center
      div(:style=`{maxWidth: '600px'}`).row.full-width.q-px-md
        q-tabs(
          :value="type" @input="type = $event"
          dense no-caps color="white"
          align="justify"
          active-color="green"
          :style=`{}`
          ).full-width
          q-tab(
            v-for="(p,pi) in types" :key="p.id"
            :name="p.id" :label="p.name"
            dense no-caps color="white"
            :style=`{color: 'rgb(180,180,180)'}`)
  //- body
  .col.full-width
    .row.fit.justify-center
      q-tab-panels(
        v-model="type"
        swipeable infinite animated keep-alive
        :style=`{padding: 0, margin: 0, background: 'none'}`
        ).fit
        q-tab-panel(name="nodes" :style=`{padding: 0, margin: 0, background: 'none'}`)
          ws-node-list(ctx="finder")
        q-tab-panel(name="compositions" :style=`{padding: 0, margin: 0, background: 'none'}`)
          ws-composition-list(
            @composition="compositionFound"
            ctx="itemFinder"
            :style=`{
              maxWidth: 600+'px',
              borderRadius: $store.state.ui.borderRadius+'px',
              overflow: 'hidden',
            }`)
        q-tab-panel(name="content" :style=`{padding: 0, margin: 0, background: 'none'}`)
          ws-content-list(
            @content="contentFound"
            ctx="itemFinder"
            :style=`{
              maxWidth: 600+'px',
              borderRadius: $store.state.ui.borderRadius+'px',
              overflow: 'hidden',
            }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

// emits content/composition event
export default {
  name: 'chainFinder',
  data () {
    return {
      type: 'nodes',
      types: [
        {id: 'nodes', name: 'Ядра'},
        {id: 'compositions', name: 'Образы'},
        {id: 'content', name: 'Контент'},
      ]
    }
  },
  methods: {
    compositionFound (composition) {
      this.$log('compositionFound', composition)
      this.$emit('composition', composition)
      this.$emit('close')
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      let layerId = Date.now().toString()
      let layerColor = this.$randomColor(layerId)
      let layerStart = 0
      let layerEnd = layerStart + 10
      let input = {
        wsItemType: 'WS_CONTENT',
        thumbOid: content.thumbOid,
        contentOid: content.contentOid,
        contentType: 'COMPOSITION',
        name: '',
        layers: [],
        spheres: [],
        operation: { items: null, operations: null, type: 'CONCAT' }
      }
      this.$log('input', input)
      let composition = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, input)
      this.$log('contentFound done', composition)
      this.$emit('content', composition)
      this.$emit('close')
    }
  }
}
</script>
