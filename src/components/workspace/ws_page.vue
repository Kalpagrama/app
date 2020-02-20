<template lang="pug">
.row.fit
  composition-editor(
    v-if="page === 'contents' && itemType === 'content'" ctx="workspace"
    :value="$store.state.workspace.item" :compositionIndex="0")
  node-editor(
    v-if="page === 'nodes'" ctx="workspace"
    :value="$store.state.workspace.item")
  ws-sphere(
    v-if="page === 'spheres' && itemType === 'sphere'" ctx="workspace"
    :value="$store.state.workspace.item")
  ws-settings(
    v-if="page === 'settings' && itemType === 'settings'" ctx="workspace"
    :value="$store.state.workspace.item")
</template>

<script>
import nodeEditor from 'components/node/node_editor'
import wsSphere from './ws_sphere'
import wsSettings from './ws_settings'

export default {
  name: 'wsPage',
  components: {nodeEditor, wsSphere, wsSettings},
  props: [],
  data () {
    return {
    }
  },
  computed: {
    page () {
      return this.$route.params.page
    },
    itemType () {
      return this.$store.state.workspace.itemType
    }
  }
}
</script>
