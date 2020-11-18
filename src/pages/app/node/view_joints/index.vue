<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
  }`
  ).row.full-width.justify-center
  sphere-joints(
    :oid="node.oid"
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    )
</template>

<script>
export default {
  name: 'pageApp-node-nodeJoints',
  components: {
    sphereJoints: () => import('components/joint/sphere_joints.vue')
  },
  props: ['node'],
}
</script>
