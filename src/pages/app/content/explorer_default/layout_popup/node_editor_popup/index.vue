<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width.justify-center.q-pb-sm
  //- node creating
  q-dialog(
    v-model="nodeCreatingShow"
    :maximized="$q.screen.xs"
    :full-width="$q.screen.xs")
    node-feed(
      :isActive="true"
      :isVisible="true"
      :node="nodeCreating"
      :style=`{
        background: 'rgba(30,30,30,0.5)',
        borderRadius: '10px',
      }`)
  //- figure editor of node
  div(
    v-if="player.figure"
    :style=`{
      position: 'relative',
      minHeight: '100px',
      maxWidth: '600px',
      background: background || 'rgba(30,30,30,0.8)',
      borderRadius: '20px',
    }`
    ).row.full-width.items-start.content-start
    //- progress...
    div(
      v-if="nodeCreating && !nodeCreatingHidden"
      :style=`{
      }`
      ).row.fit.items-center.content-center.justify-center
      q-spinner(size="50px" color="white")
      .row.full-width.justify-center
        q-btn(
          @click="nodeCreatingHide"
          flat color="white" no-caps)
          span Продолжить в фоне
    //- figure
    div(
      v-if="player.figure"
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
        @nodeCreating="nodeCreating = $event")
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
    nodeCreatingHide () {
      this.$log('nodeCreatingHide')
      this.nodeCreatingHidden = true
    }
  },
  watch: {
    nodeCreating: {
      deep: true,
      handler (to, from) {
        if (to) {
          this.$log('nodeCreating', to.uploadStage, to.uploadStageProgress)
          // wait for the
          if (to.uploadStage === 'COMPLETE' && to.uploadStageProgress === 100) {
            // open popup...
            // remove this.nodeCreating
            this.$store.commit('ui/stateSet', ['nodeCreating', false])
            this.nodeCreatingShow = true
            // this.nodeCreating = null
          }
        }
      }
    },
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
