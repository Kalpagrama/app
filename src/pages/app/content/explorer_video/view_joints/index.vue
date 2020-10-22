<template lang="pug">
sphere-joints(
  :oid="contentKalpa.oid"
  ).q-mt-lg
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
