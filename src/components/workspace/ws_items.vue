<template lang="pug">
.column.fit
  div(:style=`{height: '60px'}`).row.full-width
    kalpa-buttons(:value="pages" :id="page" idKey="id" @id="$emit('page', $event)")
  .col.full-width
    component(:is="`ws-`+page+`-list`" @item="$emit('item', $event)" @add="$emit('add', $event)" :ctx="ctx")
</template>

<script>
import wsNoteList from './ws_note_list'
import wsContentList from './ws_content_list'
// import wsCompositionList from './ws_composition_list'
import wsNodeList from './ws_node_list'
import wsSphereList from './ws_sphere_list'
import wsSettingList from './ws_setting_list'

export default {
  name: 'wsItems',
  components: {wsNoteList, wsContentList, wsNodeList, wsSphereList, wsSettingList},
  props: ['page', 'pages'],
  data () {
    return {
    }
  }
}
</script>
