<template lang="pug">
div(:style=`{borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).column.fit
  //- div(
  //-   v-if="options.header"
  //-   :style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm.b-50
  //-   q-btn(
  //-     v-if="options.backButton"
  //-     round flat color="grey-5" icon="keyboard_arrow_left" @click="$emit('cancel')").q-mr-sm
  //-   kalpa-buttons(:value="pages" :id="page" idKey="id" @id="page = $event")
  .col.b-40
    //- ws-items(
    //-   :page="page"
    //-   :options="options"
    //-   @item="itemFound")
    ws-content-list(:showHeader="false")
</template>

<script>
import wsContentList from './ws_content_list'

export default {
  name: 'wsItemFinder',
  props: ['options'],
  components: {wsContentList},
  data () {
    return {
      page: 'content',
      pages: [
        {id: 'content', name: 'Contents'},
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
