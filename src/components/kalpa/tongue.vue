<template lang="pug">
//- div(:style=`{position: 'relative'}`).row.fit
</template>

<script>
export default {
  name: 'kalpaTongue',
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
