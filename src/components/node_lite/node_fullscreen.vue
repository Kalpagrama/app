<template lang="pug">
div(
  :style=`{
    position: 'fixed', zIndex: 999999,
    top: 0, left: 0, right: 0, bottom: 0,
    height: $q.screen.height+'px',
  }`
  ).row.full-width.bg-black
  //- left side with items
  .col.full-height
    .column.fit
      //- header to exit?
      .row.full-width.items-center.content-center.bg-black.q-pa-sm
        q-btn(
          @click="$emit('close')"
          flat round color="white" icon="clear")
        .col.q-px-sm
          span.text-white.text-bold {{ node.name }}
      //- body: items slider with arrows or just to read a book article
      .col.full-width
        composition-player(
          :isActive="true" :isVisible="true"
          :composition="node.meta.items[0]"
          :options=`{isFit: true}`)
  //- right side with nodes, comments, and etc
  div(:style=`{width: '300px'}`).column.full-height
</template>

<script>
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'nodeFullscreen',
  components: {compositionPlayer},
  props: ['node', 'isActive', 'isVisible'],
}
</script>
