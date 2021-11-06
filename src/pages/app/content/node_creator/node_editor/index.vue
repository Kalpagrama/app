<template lang="pug">
.row.full-width.justify-center
  //- figure editor of node
  div(
    :style=`{
    // position: 'relative',
    minHeight: '100px',
    // maxWidth: '600px',
    // background: background || 'rgba(30,30,30,0.8)',
    // borderRadius: '20px',
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
        color: 'white'}`
      ).full-width
        q-btn(round flat color="white" icon="clear" @click="close")
      edit-spheres(:sphereOwner="node")
      actions(
        :node="node" :player="player" :contentKalpa="contentKalpa" :showColor="showColor"
        @close="close"
      )
</template>

<script>
import editSpheres from './edit_spheres.vue'
import actions from './actions.vue'

export default {
  name: 'nodeEditor',
  props: {
    player: { type: Object, required: true },
    contentKalpa: { type: Object, required: true },
    background: { type: String, required: false },
    showColor: { type: Boolean, default: false },
    node: {
      type: Object,
      default () {
        return {
          name: '',
          layout: 'HORIZONTAL',
          items: [],
          vertices: [],
          spheres: [],
          category: 'FUN',
          temporary: true
        }
      }
    }
  },
  components: {
    editSpheres,
    actions
  },
  data () {
    return {
      nodeCreating: null,
      nodeCreatingHidden: false,
      nodeCreatingShow: false
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
    close () {
      this.$log('close')
      this.player.selectedDraft = null
    }
  },
  watch: {},
  created () {
    this.$log('created')
  }
}
</script>
