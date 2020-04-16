<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- footer MOBILE ONLY
  //- div(:style=`{height: '60px'}`).row.full-width.justify-center
  //-   div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.items-center.q-px-sm
  //-     q-btn(round flat color="white" icon="menu").q-mr-sm
  //-     kalpa-buttons(:value="pages" :id="page" idKey="id" @id="$emit('page', $event)")
  //- body
  .col.full-width
    component(:is="`ws-`+page+`-list`" @item="$emit('item', $event)" @add="$emit('add', $event)" :ctx="ctx")
</template>

<script>
import wsNoteList from './ws_note_list'
import wsContentNotesList from './ws_content_notes_list'
import wsNodeList from './ws_node_list'
import wsChainList from './ws_chain_list'

export default {
  name: 'wsItems',
  components: {wsNoteList, wsContentNotesList, wsNodeList, wsChainList},
  props: ['page', 'pages'],
  data () {
    return {
    }
  }
}
</script>
