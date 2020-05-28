<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $q.screen.gt.xs ? '10px' : 'none',
    overflow: 'hidden',
  }`
  ).column.full-width.b-50
  //- header
  div().row.full-width.items-start.content-start
    //- main
    div(:style=`{}`).row.full-width.items-center.content-center.q-pa-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Node editor
    //- essence
    .row.full-width.q-px-sm
      edit-essence(:node="node")
    //- tabs
    .row.full-width.q-px-sm
      kalpa-buttons(:value="pages" :id="pageId" idKey="id" @id="pageId = $event")
  //- body
  .col.full-width
    component(:is="`edit-${pageId}`" :node="node" @close="$emit('close')")
</template>

<script>
import editEssence from './edit_essence'
import editInfo from './edit_info'
import editItems from './edit_items'
import editSpheres from './edit_spheres'
import editPreview from './edit_preview'

export default {
  name: 'wsNodeEditor',
  components: {editInfo, editEssence, editItems, editSpheres, editPreview},
  props: ['node'],
  data () {
    return {
      pageId: 'items',
      pages: [
        {id: 'info', name: 'Info'},
        {id: 'items', name: 'Items'},
        {id: 'spheres', name: 'Spheres'},
        {id: 'preview', name: 'Preview'}
      ]
    }
  }
}
</script>
