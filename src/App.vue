<template lang="pug">
  div(id="q-app").row.window-height.full-width.items-center.justify-center.bg-black
    router-view
</template>

<script>
  import { AddressbarColor } from 'quasar'

  export default {
    beforeCreate () {
      console.log('App beforeCreate')
    },
    created () {
      console.log('App created')
      AddressbarColor.set('#342d58')
    },
    beforeMount () {
      console.log('App beforeMount')
    },
    mounted () {
      console.log('App mounted')
    }
  }
</script>
