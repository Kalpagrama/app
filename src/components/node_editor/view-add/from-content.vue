<template lang="pug">
ws-contents(
  :mode="'pick'"
  :query="{}"
  )
</template>

<script>
export default {
  name: 'nodeEditor_viewAdd_fromContent',
  components: {
    wsContents: () => import('pages/app/ws_contents/index.vue'),
  },
  data () {
    return {
    }
  }
}
</script>
