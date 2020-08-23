
<template lang="pug">
q-layout(view="hHh lpR fFf").b-30
  q-page-container
    div(:style=`{height: '200px', overflow: 'hidden',}`).row.full-width.items-center.content-center.justify-center.b-30
      kalpa-logo(:width="100" :height="100").q-mb-md
      h5.text-white.text-bold.q-ma-xs.q-pa-xs Kalpagramma
    router-view
</template>

<script>
export default {
  name: 'authLayout',
  meta: {
    title: 'Kalpa - Authentication'
  },
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
