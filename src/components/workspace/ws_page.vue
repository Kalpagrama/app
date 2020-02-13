<template lang="pug">
.row.fit
  composition-editor(
    v-if="page === 'contents' && value"
    ctx="workspace"
    :node="value" :compositionIndex="0")
  node-editor(
    v-if="page === 'nodes'"
    ctx="workspace"
    :value="value"
    @node="nodeChanged")
  ws-sphere(
    v-if="page === 'spheres' && value"
    ctx="workspace"
    :value="value")
  ws-settings(
    v-if="page === 'settings'"
    ctx="workspace"
    :value="value")
</template>

<script>
import nodeEditor from 'components/node/node_editor'
import wsSphere from './ws_sphere'
import wsSettings from './ws_settings'

export default {
  name: 'wsPage',
  components: {nodeEditor, wsSphere, wsSettings},
  props: ['value'],
  data () {
    return {
    }
  },
  computed: {
    page () {
      return this.$route.params.page
    }
  }
}
</script>
