<template lang="pug">
.column.fit
  div(:style=`{height: '60px'}`).row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
      kalpa-buttons(:value="pages" :id="page" idKey="id" @id="$emit('page', $event)")
  .col.full-width
    component(:is="`ws-`+page+`-list`" @item="$emit('item', $event)" @add="$emit('add', $event)" :ctx="ctx")
</template>

<script>
import wsContentNotesList from './ws_content_notes_list'
import wsNodeList from './ws_node_list'
import wsSphereList from './ws_sphere_list'
import wsSettingList from './ws_setting_list'

export default {
  name: 'wsItems',
  components: {wsContentNotesList, wsNodeList, wsSphereList, wsSettingList},
  props: ['page', 'pages'],
  data () {
    return {
    }
  }
}
</script>
