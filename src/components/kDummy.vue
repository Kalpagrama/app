<template lang="pug">
div(
  style=`height: 500px; width: 500px; borderRadius: 8px; overflow: hidden`
  v-observe-visibility=`{
    callback: visibilityChanged,
    throttle: 300,
    intersection: {
      threshold: 1
    }}`
  ).row.items-center.justify-center.bp
    .row.full-width.bg-red.br
      slot(name="header" :obj="name")
      div(v-if="!$scopedSlots.header").row.full-width
        span Default header
    .row.full-width
      slot(name="default" :obj="name")
      .row.full-width
        span dummy: {{name}}
    .row.full-width.bg-green.bg
      slot(name="footer" :obj="name")
      div(v-if="!$scopedSlots.footer").row.full-width
        span Default footer
</template>

<script>
export default {
  name: 'kDummy',
  props: ['name', 'header', 'footer'],
  data () {
    return {
    }
  },
  methods: {
    visibilityChanged (isVisible, entry) {
      // this.$log('visibilityChanged', isVisible, entry)
      if (isVisible) {
        this.$log('isVisible', isVisible, this.name)
        this.$emit('visible', isVisible)
      }
    }
  }
}
</script>
