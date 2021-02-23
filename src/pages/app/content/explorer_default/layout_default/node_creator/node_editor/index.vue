<template lang="pug">
.row.full-width.justify-center.q-pb-sm
  //- figure editor of node
  div(
    :style=`{
      position: 'relative',
      minHeight: '100px',
      maxWidth: '600px',
      background: background || 'rgba(30,30,30,0.8)',
      borderRadius: '20px',
    }`
    ).row.full-width.items-start.content-start
    //- figure
    div(
      ).row.full-width
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
      actions(
        :node="node" :player="player" :contentKalpa="contentKalpa"
        @published="$emit('published', $event)")
</template>

<script>
import editSpheres from './edit_spheres.vue'
import actions from './actions.vue'

export default {
  name: 'nodeEditor',
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
      },
      nodeCreating: null,
      nodeCreatingHidden: false,
      nodeCreatingShow: false,
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
  },
  watch: {
  },
  created () {
    this.$log('created')
    let nodeDraft = this.$store.state.ui.nodeDraft
    this.$log('nodeDraft', nodeDraft)
    if (nodeDraft) {
      // remove from store...
      this.$store.commit('ui/stateSet', ['nodeDraft', null])
      // set here...
      this.node = JSON.parse(JSON.stringify(nodeDraft))
    }
  }
}
</script>
