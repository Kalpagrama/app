<template lang="pug">
img(ref="kImg" v-bind="$props" @load="onLoad")
</template>

<script>
export default {
  name: 'kImg',
  methods: {
    onLoad (e) {
      this.$log('onLoad', e)
      this.$q.notify('onLoad!' + this.$refs.kImg.clientHeight)
      // this.$q.notift('onLoad!' + e.path[0].height)
      // this.$emit('width', e.path[0].width)
      // this.$emit('height', e.path[0].height)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
