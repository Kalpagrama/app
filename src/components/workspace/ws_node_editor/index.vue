<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $q.screen.gt.xs ? '10px' : 'none',
    overflow: 'hidden',
  }`
  ).column.full-width.b-40
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
      overflow: 'hidden'
    }`
    ).row.full-width.items-start.content-start.b-50.q-px-sm.q-mb-sm
    slot(name="header")
    //- navigation
    div(v-if="$slot ? !$slot.header : true").row.full-width.items-center.content-center.justify-between.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Node editor
      //- .col
      q-btn(
        @click="pageId === 'info' ? pageId = 'items' : pageId = 'info'"
        round icon="settings"
        :color="pageId === 'info' ? 'green' : 'white'"
        :flat="pageId !== 'info'")
    //- essence
    edit-essence(v-if="pageId !== 'info'" :node="node")
    //- pages
    .row.full-width.justify-center
      div(:style=`{maxWidth: '600px'}`).row.full-width.q-pt-sm
        q-tabs(
          :value="pageId" @input="pageId = $event"
          dense no-caps color="white"
          align="justify"
          active-color="green"
          :style=`{}`
          ).full-width
          q-tab(
            v-for="(p,pi) in pages" :key="p.id"
            :name="p.id" :label="p.name"
            dense no-caps color="white"
            :style=`{color: 'rgb(180,180,180)'}`)
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
  props: ['value'],
  data () {
    return {
      pageId: 'items',
      pages: [
        // {id: 'info', name: 'Info'},
        {id: 'items', name: 'Items'},
        {id: 'spheres', name: 'Spheres'},
        {id: 'preview', name: 'Preview'}
      ]
    }
  },
  computed: {
    node () {
      return this.value
    }
  },
  methods: {
    pageChanged (id) {
      this.$log('pageChanged', id)
      // check node.items for preview page
      if (id === 'preview') {
        if (this.node.items.length === 0) return
      }
      this.pageId = id
    }
  }
}
</script>
