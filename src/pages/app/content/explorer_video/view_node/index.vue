<template lang="pug">
div(
  ).row.full-width.justify-center.q-pt-xs
  div(
    :style=`{
      maxWidth: '800px',
    }`).row.full-width
    //- editor wrapper
    div(
      :style=`{
        borderRadius: '10px',
        }`
      ).row.full-width.items-start.content-start.q-pb-md.b-40
      //- composition.editor
      .row.full-width
        composition-editor(
          :player="player" :composition="item"
          :contentKalpa="contentKalpa")
      //- node.name/node.sphers editors wrapper
      div(:style=`{paddingLeft: '40px', paddingRight: '40px',}`).row.full-width.q-pt-sm
        //- node.name editor
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100,}`).row.full-width
          q-input(
            v-model="node.name"
            filled dark dense color="grey-6"
            autogrow type="textarea"
            placeholder="What do you see?"
            :input-style=`{
              minHeight: '60px',
            }`).full-width
        ws-sphere-editor(:item="node").q-py-sm
    //- footer: actions close, createNode
    .row.full-width.q-pa-md
      q-btn(flat color="white" no-caps @click="$emit('close')").b-40 Close
      .col
      q-btn(color="green" no-caps) Publish
</template>

<script>
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'contentExplorerVideo_viewNode',
  components: {compositionEditor},
  props: ['node', 'player', 'contentKalpa', 'contentBookmark'],
  data () {
    return {
    }
  },
  computed: {
    item () {
      return this.node.items[0]
    }
  },
}
</script>
