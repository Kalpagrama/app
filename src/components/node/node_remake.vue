<template lang="pug">
q-btn(
  @click="start()"
  round flat color="grey-9" icon="cached").shaking
</template>

<script>
export default {
  name: 'nodeRemake',
  data () {
    return {
    }
  },
  methods: {
    start () {
      this.$log('start')
      // take items, spheres, name, and create ws_node...
    }
  }
}
</script>
