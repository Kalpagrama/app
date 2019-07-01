<template lang="pug">
div(style=`height: 300px`).row.full-width.items-center.justify-center
  span {{$t('not_implemented_yet')}}
</template>

<script>
export default {
  name: 'bookFind__sourceWorkspace',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
