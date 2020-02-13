<template lang="pug">
div(
  :style=`{height: '60px'}`
  ).row.full-width
  kalpa-buttons(:value="spheres" idKey="oid" :id="id")
</template>

<script>
export default {
  name: 'nodeEditorSpheres',
  props: ['node'],
  data () {
    return {
      id: 'x',
      spheres: [
        {id: 'x', name: 'x'},
        {id: 'y', name: 'y'}
      ]
    }
  }
}
</script>
