<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).column.full-width.b-50
  .row.full-width.q-px-sm
    .row.full-width.items-center.content-center.justify-between.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Item finder
      q-btn(round flat color="white" icon="more_vert")
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
  .col.full-width
    .row.fit.justify-center
      ws-content-list(
        v-if="type === 'content'"
        @content="contentFound"
        ctx="itemFinder"
        :style=`{
          maxWidth: 600+'px',
          borderRadius: '10px',
          overflow: 'hidden',
        }`)
      ws-composition-list(
        v-if="type === 'composition'"
        @composition="compositionFound"
        ctx="itemFinder"
        :style=`{
          maxWidth: 600+'px',
          borderRadius: '10px',
          overflow: 'hidden',
        }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'itemFinder',
  data () {
    return {
      type: 'composition',
      types: [
        {id: 'composition', name: 'Compositions'},
        {id: 'content', name: 'Contents'},
      ]
    }
  },
  methods: {
    compositionFound (composition) {
      this.$log('compositionFound', composition)
      this.$emit('item', composition)
      this.$emit('close')
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      let layerId = Date.now().toString()
      let layerColor = this.$randomColor(layerId)
      let layerStart = 0
      let layerEnd = layerStart + 10
      let compositionInput = {
        wsItemType: 'WS_CONTENT',
        thumbOid: content.thumbOid,
        contentOid: content.contentOid,
        contentType: 'COMPOSITION',
        name: '',
        layers: [
          {
            id: layerId,
            color: layerColor,
            contentOid: content.contentOid,
            figuresAbsolute: [
              {t: layerStart, points: []},
              {t: layerEnd, points: []}
            ],
            figuresRelative: [],
            spheres: []
          }
        ],
        spheres: [],
        operation: { items: null, operations: null, type: 'CONCAT' }
      }
      this.$log('compositionInput', compositionInput)
      let composition = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, compositionInput)
      this.$log('composition', composition)
      this.$emit('item', composition)
      this.$emit('close')
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
