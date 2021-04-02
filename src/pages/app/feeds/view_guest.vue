<template lang="pug">
div(
  :style=`{
    height: '80vh',
  }`
  ).row.full-width.justify-center
  div(:style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-center
    .row.full-width.justify-center
      q-icon(name="login" color="grey-8" size="100px")
    div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
      span.text-white {{$t('You will see your home feed')}}
    .row.full-width.justify-center.q-pt-md
      q-btn(
        outline color="white" no-caps
        :style=`{
          height: '50px',
        }`
        @click="$store.commit('ui/stateSet', ['authGuard', {message: null}])"
      )
        h1.text-white {{$t('Login')}}
</template>

<script>
export default {
  name: 'pageAppFeedsViewGuest'
}
</script>
