<template lang="pug">
div(
  :style=`{
    height: '60px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.b-70
  .row.full-width.q-px-md.q-py-sm
    span.text-white.text-bold {{ groupName }}
  .row.full-width
</template>

<script>
export default {
  name: 'layerGroup',
  props: ['value'],
  data () {
    return {
    }
  },
  computed: {
    groupName () {
      return this.value.spheres[0].name
    }
  },
  mounted () {
  }
}
</script>
