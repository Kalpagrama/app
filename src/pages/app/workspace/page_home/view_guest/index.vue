<template lang="pug">
div(
  :style=`{
    height: '50vh',
  }`
  ).row.full-width.justify-center.q-pa-sm
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      borderRadius: '10px',
    }`).row.full-width.items-center.content-center.justify-center.b-35.q-pa-md
    .row.full-width.justify-center
      q-icon(name="login" color="grey-8" size="100px")
    div(
      :style=`{textAlign: 'center'}`
      ).row.full-width.justify-center
      span.text-white {{$t('You will be able to add YouTube videos by URL, add bookmarks, and upload files!')}}
    .row.full-width.justify-center.q-pt-md
      q-btn(
        outline color="white" no-caps
        :style=`{
          height: '50px',
          minWidth: '200px',
        }`
        @click="$store.commit('ui/stateSet', ['authGuard', {message: null}])"
        )
        h1.text-white {{$t('Login')}}
</template>

<script>
export default {
  name: 'viewGuest',
}
</script>
