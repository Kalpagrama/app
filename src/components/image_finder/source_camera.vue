<template lang="pug">
div(style=`height: 300px`).row.full-width.items-center.justify-center
  span {{$t('not_implemented_yet')}}
</template>

<script>
export default {
  name: 'imageFind__sourceCamera',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
    // TODO: define it cordova or not to implement file upload from device
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
