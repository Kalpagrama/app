<template lang="pug">
.column.fit
  div(
    v-if="options.header"
    :style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
    q-btn(
      v-if="options.backButton"
      round flat color="grey-5" icon="keyboard_arrow_left" @click="$emit('cancel')").q-mr-sm
    kalpa-buttons(:value="pages" :id="page" idKey="id" @id="page = $event")
  .col.q-pa-sm
    ws-items(
      :page="page"
      :options="options"
      @item="itemFound")
</template>

<script>
import wsItems from './ws_items'

export default {
  name: 'wsItemFinder',
  props: ['options'],
  components: {wsItems},
  data () {
    return {
      page: 'contentNotes',
      pages: [
        {id: 'contentNotes', name: 'Contents'},
        {id: 'node', name: 'Nodes'}
      ]
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.$emit('item', item)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
