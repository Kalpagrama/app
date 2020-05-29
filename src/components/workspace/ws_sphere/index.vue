<style lang="sass" scoped>
.sphere
  cursor: pointer
  &:hover
    background: rgb(80,80,80)
</style>

<template lang="pug">
div(
  @click="sphereClick"
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.items-center.content-center.justify-center.q-pa-sm.b-60.sphere
  span(
    :style=`{userSelect: 'none'}`
    ).text-white {{ '# '+sphere.name }}
</template>

<script>
export default {
  name: 'wsSphere',
  props: ['sphere', 'sphereIndex'],
  data () {
    return {
    }
  },
  methods: {
    sphereClick () {
      this.$log('sphereClick', this.sphere, this.sphereIndex)
      this.$emit('sphereClick')
    }
  }
}
</script>
