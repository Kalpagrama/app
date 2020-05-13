<template lang="pug">
component(:is="`ws-`+page+`-list`" @item="$emit('item', $event)" @add="$emit('add', $event)" :ctx="ctx" :options="options")
</template>

<script>
import wsNoteList from './ws_note_list'
import wsContentNotesList from './ws_content_notes_list'
import wsNodeList from './ws_node_list'
import wsChainList from './ws_chain_list'

export default {
  name: 'wsItems',
  components: {wsNoteList, wsContentNotesList, wsNodeList, wsChainList},
  props: ['page', 'pages', 'options'],
  data () {
    return {
    }
  }
}
</script>
