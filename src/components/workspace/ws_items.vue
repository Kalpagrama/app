<template lang="pug">
component(:is="`ws-`+page+`-list`" @item="$emit('item', $event)" @add="$emit('add', $event)" :ctx="ctx" :options="options")
  template(v-slot:header)
    slot(name="header")
</template>

<script>
import wsNoteList from './ws_note_list'
import wsContentList from './ws_content_list'
import wsNodeList from './ws_node_list'
import wsChainList from './ws_chain_list'

export default {
  name: 'wsItems',
  components: {wsNoteList, wsContentList, wsNodeList, wsChainList},
  props: ['page', 'pages', 'options'],
  data () {
    return {
    }
  }
}
</script>
