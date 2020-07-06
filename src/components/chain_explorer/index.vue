<template lang="pug">
span {{$t('chain explorer', 'chain explorer')}}
</template>

<script>
export default {
  name: 'chainExplorer',
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
