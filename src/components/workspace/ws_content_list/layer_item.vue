<style lang="sass" scoped>
.layer
  cursor: pointer
  &:hover
    background: rgb(110,110,110) !important
</style>

<template lang="pug">
div(
  @click.self="layerClick()"
  @mouseenter="mouseIsOver = true"
  @mouseleave="mouseIsOver = false"
  :class=`{}`
  :style=`{
    position: 'relative',
    height: '50px',
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-center.content-center.justify-start.q-px-md.b-90.q-mb-xs.layer
  span(:style=`{userSelect: 'none'}`).text-white {{ layerName }}
  q-btn(
    v-show="layerPreviewShow"
    flat no-caps color="white" @click="layerPreview()"
    :class=`{
      'b-130': mouseIsOver
    }`
    :style=`{position: 'absolute', zIndex: 100, right: '7px', top: '7px'}`) Preview
</template>

<script>
export default {
  name: 'layerItem',
  props: ['layer', 'content', 'layerIndex', 'contentIndex'],
  data () {
    return {
      mouseIsOver: false
    }
  },
  computed: {
    layerName () {
      return this.layer.spheres[0].name
    },
    layerPreviewShow () {
      if (this.$q.screen.xs) {
        return true
      }
      else {
        return this.mouseIsOver
      }
    }
  },
  methods: {
    layerClick () {
      this.$log('layerClick')
      this.$emit('choose')
    },
    layerPreview () {
      this.$log('layerPreview')
      this.$emit('preview')
    }
  }
}
</script>
