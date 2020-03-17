<template lang="pug">
.row.full-width
  div(:style=`{}`).row.full-width.justify-center.q-py-xl
    kalpa-spinner(@click.native="$router.push('/auth').catch(e => e)").cursor-pointer
    .row.full-width.justify-center.q-py-sm
      span(
        @click="$router.push('/auth').catch(e => e)"
        :style=`{fontSize: '20px', userSelect: 'none'}`).text-bold.text-white.cursor-pointer Kalpa
  router-view
</template>

<script>
export default {
  name: 'authLayout',
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
