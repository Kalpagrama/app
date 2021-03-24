<template lang="pug">
div(
  :style=`{
    position: 'relative',
    zIndex: 9999999,
    height: '500px',
  }`
  ).row.full-width.items-center.content-center.b-30.q-pa-lg
  div(:style=`{position: 'absolute',zIndex: 100, left: '0px', top: '0px',}`).row.full-width.q-pa-sm
    .col
    q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  .row.full-width.justify-center
    q-icon(name="login" color="grey-8" size="100px")
  div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
     span.text-white {{ authGuard.message }}
  .row.full-width.justify-center.q-pt-md
    q-btn(
      outline color="white" no-caps
      :to="'/auth/sign-in'"
      :style=`{
        height: '50px',
      }`)
      h1.text-white {{$t('Login')}}
</template>

<script>
export default {
  name: 'kalpaAuthGuard',
  computed: {
    authGuard () {
      return this.$store.state.ui.authGuard
    }
  }
}
</script>
