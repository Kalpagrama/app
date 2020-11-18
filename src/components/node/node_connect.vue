<template lang="pug">
div(
  :style=`{
    position: 'relative',
    //- height: '60px',
    paddingTop: '2px',
  }`).row.full-height.items-start.content-start.justify-center.q-px-sm
  q-btn(
    v-if="!$scopedSlots.action"
    @click="$router.push('/workspace/joint/new?oid='+node.oid)"
    round flat dense color="green").shaking
    q-icon(name="link" size="30px" color="grey-9")
  //- joints count
  div(
    v-if="node.countJoints > 0"
    :style=`{position: 'absolute', zIndex: 10, bottom: '8px',}`).row.full-width.justify-center
    small.text-grey-9 {{ node.countJoints }}
</template>

<script>
export default {
  name: 'nodeConnect',
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
      nodeConnectOpened: false
    }
  },
  methods: {
    connectStart () {
      this.$log('connectStart')
      this.nodeConnectOpened = true
      // this.$router.push('/workspace/joint/new?oid='+node.oid)
    }
  }
}
</script>
