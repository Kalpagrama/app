<template lang="pug">
div(
  :style=`{height: '60px'}`
  ).row.full-width.bg
  kalpa-buttons(:value="spheres" idKey="oid" :id="id")
</template>

<script>
export default {
  name: 'nodeEditorSpheres',
  props: ['node'],
  data () {
    return {
      id: 'x'
    }
  },
  computed: {
    spheres () {
      return this.node.spheres
    }
  }
}
</script>
