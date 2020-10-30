<template lang="pug">
sphere-joints(
  :oid="contentKalpa.oid"
  :style=`{zIndex: 0}`
  )
</template>

<script>
export default {
  name: 'typeCommunity',
  props: ['node', 'player', 'contentKalpa', 'contentBookmark'],
  components: {
    sphereJoints: () => import('components/joint/sphere_joints.vue')
  },
  data () {
    return {
    }
  }
}
</script>
