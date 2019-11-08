<template lang="pug">
div(id="q-app")
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
