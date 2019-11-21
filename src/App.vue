<template lang="pug">
div(id="q-app").row.window-height.full-width.items-center.justify-center.bg-black
  router-view
</template>

<script>
import { AddressbarColor } from 'quasar'

export default {
  created () {
    AddressbarColor.set('#342d58')
  }
}
</script>
