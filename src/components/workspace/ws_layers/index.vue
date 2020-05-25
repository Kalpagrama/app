<style lang="sass">
</style>

<template lang="pug">
.column.fit.q-pt-sm
  div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start.b-50
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Content layers
    div(:style=`{}`).row.full-width.items-center.content-center.q-px-sm
      .col
        kalpa-buttons(:value="types" :id="type" @id="type = $event" wrapperBg="b-70").justify-start
      q-btn(flat no-caps color="white").b-70 Filters
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md
      kalpa-loader(type="WS_CONTENT" :variables='{selector: {}}')
        template(v-slot=`{items}`)
          .row.full-width.items-start.content-start
            q-expansion-item(
              v-for="(c,ci) in items" :key="ci"
              :label="c.name"
              color="white" dark
              :style=`{borderRadius: '10px', overflow: 'hidden'}`
              ).full-width.b-70.q-mb-sm
              div.row.full-width.justify-start.q-pa-sm
                layer-item(
                  v-for="(l,li) in c.layers" :key="li"
                  v-if="l.spheres.length > 0"
                  :content="c" :contentIndex="ci"
                  :layer="l" :layerIndex="li")
</template>

<script>
import layerItem from './layer_item'

export default {
  name: 'wsLayers',
  components: {layerItem},
  data () {
    return {
      type: 'VIDEO',
      types: [
        {id: 'all', name: 'All'},
        {id: 'VIDEO', name: 'Video'},
        {id: 'BOOK', name: 'Books'}
      ]
    }
  }
}
</script>
