<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px',}`).row.full-width.items-start.content-start
    sphere-joints(
      :oid="contentKalpa.oid"
      )
</template>

<script>
export default {
  name: 'contentExplorerVideo_viewJoints',
  props: ['node', 'player', 'contentKalpa', 'contentBookmark'],
  components: {
    sphereJoints: () => import('components/joint/sphere_joints.vue')
  }
}
</script>
