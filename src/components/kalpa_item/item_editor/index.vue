<template lang="pug">
kalpa-layout().b-30
  template(v-slot:body)
    div(:style=`{minHeight: $q.screen.height+'px',}`).row.full-width.items-start.content-start
      composer(:joint="joint" :item="item" @close="$emit('close', $event)" @remove="$emit('remove', $event)").row.full-width.full-height
</template>

<script>
import composer from 'src/components/kalpa_item/item_editor/composer'

export default {
  name: 'itemEditor',
  components: {
    composer
  },
  props: ['joint', 'item'],
}
</script>
