<template lang="pug">
div(
  style=`height: 500px; minWidth: 500px; borderRadius: 8px; overflow: hidden`
  v-observe-visibility=`{
    callback: visibilityChanged,
    throttle: 300,
    intersection: {
      threshold: 1
    }}`
  ).row.full-width.items-center.justify-center.bp
    span dummy: {{name}}
</template>

<script>
export default {
  name: 'kDummy',
  props: ['name'],
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
