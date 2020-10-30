<template lang="pug">
component(
  :is="$q.screen.gt.sm ? 'view-desktop' : 'view-mobile'"
  v-bind="$props"
  )
</template>

<script>
export default {
  name: 'contentExplorerVideoIndex',
  props: ['contentKalpa', 'query'],
  components: {
    viewDesktop: () => import('./view_desktop.vue'),
    viewMobile: () => import('./view_mobile.vue')
  }
}
</script>
