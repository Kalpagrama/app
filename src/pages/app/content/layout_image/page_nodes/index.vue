<style lang="sass" scoped>
.node
  cursor: pointer
  &:hover
    // background: rgba(50,50,50,0.5)
</style>

<template lang="pug">
page-nodes-root(
  :contentKalpa="contentKalpa"
  :player="player")
  template(v-slot:header)
    .row.full-width.items-center.content-center.q-py-md.q-px-lg
      span.text-white.text-bold Ядра
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  template(v-slot:item=`{item,isSelected}`)
    div(
      v-if="item.items[0] && item.items[0].layers"
      @click="$emit('close')"
      :style=`{
      }`
      ).row.full-width.q-px-md.q-mb-md.node.q-py-sm
      //- .row.full-width
        div(
          :style=`{
            borderRadius: '10px',
          }`
          ).row.full-width.q-pa-sm.b-40
          small.text-grey-4 {{ getText(item) }}
      .row.full-width.q-px-sm.q-py-xs
        span.text-white {{ item.name }}
</template>

<script>
import pageNodesRoot from '../../page_nodes_root/index.vue'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player'],
  components: {
    pageNodesRoot,
  },
  data () {
    return {
    }
  },
  methods: {
    // getText (item) {
    //   let text = item.items[0].layers[0].figuresAbsolute[0].epubCfiText
    //   if (text.length > 220) {
    //     return text.slice(0, 220) + '...'
    //   }
    //   else {
    //     return text
    //   }
    // }
  }
}
</script>
