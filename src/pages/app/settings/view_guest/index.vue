<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-center
    .row.full-width.justify-center.q-py-lg
      //- q-icon(name="login" color="grey-8" size="100px")
      div(
        :style=`{
          width: '200px', height: '200px',
          minWidth: '200px', minHeight: '200px',
          maxWidth: '200px', maxHeight: '200px',
          borderRadius: '50%',
        }`
        ).b-40
    div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
      span.text-white {{$t('Login to edit your profile')}}
    .row.full-width.justify-center.q-py-md
      q-btn(
        outline color="white" no-caps
        :style=`{
          height: '50px',
        }`
        @click="$store.commit('ui/stateSet', ['authGuard', {message: null}])"
      )
        h1.text-white {{$t('Login')}}
    .row.full-width.justify-center.q-pt-md
      kalpa-docs(:style=`{maxWidth: '300px'}`)
</template>

<script>
export default {
  name: 'viewGuest',
}
</script>
