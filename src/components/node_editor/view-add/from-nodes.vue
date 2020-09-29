<template lang="pug">
ws-nodes(
  :mode="'pick'"
  :query="{}"
  )
</template>

<script>
export default {
  name: 'nodeEditor_viewAdd_fromNodes',
  components: {
    wsNodes: () => import('pages/app/ws_nodes/index.vue'),
  },
  data () {
    return {
    }
  }
}
</script>
