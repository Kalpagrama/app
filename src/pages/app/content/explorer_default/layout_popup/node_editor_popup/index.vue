<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width.justify-center.q-pb-sm
  div(
    :style=`{
      minHeight: '100px',
      maxWidth: '600px',
      background: background || 'rgba(30,30,30,0.8)',
      borderRadius: '20px',
    }`
    ).row.full-width.items-start.content-start
    q-input(
      v-model="node.name"
      dark borderless color="white"
      type="textarea" autogrow :rows="1"
      placeholder="В чем суть?"
      :input-style=`{
        padding: '20px',
        fontSize: fontSize+'px',
        color: 'white',
      }`
      ).full-width
    edit-spheres(:node="node")
    actions(:node="node" :player="player" :contentKalpa="contentKalpa")
</template>

<script>
import editSpheres from '../node_editor/edit_spheres.vue'
import actions from '../node_editor/actions.vue'

export default {
  name: 'nodeEditorPopup',
  props: ['player', 'contentKalpa', 'background'],
  components: {
    editSpheres,
    actions,
  },
  data () {
    return {
      node: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      }
    }
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 20
      else if (l < 30) return 16
      else if (l < 40) return 14
      else return 12
    }
  },
  methods: {
  }
}
</script>
