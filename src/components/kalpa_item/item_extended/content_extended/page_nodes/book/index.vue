<style lang="sass" scoped>
.node
  cursor: pointer

  //&:hover
    background: rgba(50,50,50,0.5)
</style>

<template lang="pug">
page-nodes-root(
  :contentKalpa="contentKalpa"
  :player="player")
  template(v-slot:header)
    .row.full-width.items-center.content-center.q-py-md.q-px-lg
      span.text-white.text-bold {{$t('Nodes')}}
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  template(v-slot:item=`{item,isSelected}`)
    q-btn(
      v-if="item.items[0] && item.items[0].layers"
      round outline no-caps
      :color="$rateMeta.find(r => $rateMeta.checkHitRate(item.rate, r)).colorName"
      @click="player.showItem(item), $emit('close')"
    ).row.full-width.q-mb-md.node
      // цитата + СУТЬ
      div(:style=`{ borderRadius: '10px'}`).row.full-width.q-px-md.q-ma-xs
        small.text-grey-4 {{ getText(item) }}
      .row.full-width.justify-center.q-px-md
        span.text-white.text-bold {{ item.name }}

    //q-btn(
    //  v-if="item.items[0] && item.items[0].layers"
    //  round outline no-caps
    //  :style=`{
    //      border: '2px solid ' + $rateMeta.find(r => item.rate >= r.valueMin && item.rate <= r.valueMax).color,
    //      }`
    //  @click="player.showItem(item), $emit('close')"
    //).row.full-width.q-mb-md.node
    //  // цитата + суть
    //  div(:style=`{ borderRadius: '10px'}`).row.full-width.q-px-md.b-50
    //    small.text-grey-4 {{ getText(item) }}
    //  .row.full-width.justify-center.q-px-md
    //    span.text-white.text-bold {{ item.name }}
</template>

<script>
import pageNodesRoot from 'src/components/kalpa_item/item_extended/content_extended/page_nodes'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player'],
  components: {
    pageNodesRoot
  },
  data () {
    return {}
  },
  methods: {
    getText (item) {
      let text = item.items[0].layers[0].figuresAbsolute[0].epubCfiText
      if (text.length > 220) {
        return text.slice(0, 220) + '...'
      } else {
        return text
      }
    }
  }
}
</script>
