<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: 600+'px',
      minHeight: '500px',
    }`
    ).row.full-width.items-center.content-center
    .row.full-width.justify-center
      q-icon(name="login" color="grey-8" size="100px")
    div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
      span.text-white {{$t('To create drafts, login')}}
    .row.full-width.justify-center.q-pt-md
      q-btn(
        outline color="white" no-caps
        :style=`{
          height: '50px',
        }`
        @click="$store.commit('ui/stateSet', ['authGuard', {message: null}])")
        h1.text-white {{$t('Login')}}
</template>

<script>
export default {
  name: 'pageNotesRoot__viewGuest',
  data () {
    return {
    }
  }
}
</script>
