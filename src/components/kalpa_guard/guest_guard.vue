<template lang="pug">
div(
  :style=`{
  height: '50vh',
  }`
  ).row.full-width.justify-center
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
        span.text-white  {{messageName}}
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
      div(:style=`{minHeight: '80px'}`).row.full-width.justify-center.q-pt-md
        kalpa-docs(
          :style=`{maxWidth: '300px'}`
          :alignClass="'justify-center'")
//div(
//  :style=`{
//    height: '80vh',
//  }`
//  ).row.full-width.justify-center
//  div(:style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-center
//    .row.full-width.justify-center
//      q-icon(name="login" color="grey-8" size="100px")
//    div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
//      span.text-white {{$t('Login to see your notifications')}}
//    .row.full-width.justify-center.q-pt-md
//      q-btn(
//        outline color="white" no-caps
//        :style=`{
//          height: '50px',
//        }`
//        @click="$store.commit('ui/stateSet', ['authGuard', {message: null}])"
//      )
//        h1.text-white {{$t('Login')}}
</template>

<script>
export default {
  name: 'guestGuard',
  props: ['message'],
  computed: {
    messageName() {
      switch (this.$route.name.split('.')[0]) {
        case 'notifications': return this.$t('Login to see your notifications')
        case 'workspace': return this.$t('You will be able to add YouTube videos by URL, add bookmarks, and upload files!')
        case 'home': return this.$t('Login to see your home feed')
        case 'settings': return this.$t('Login to edit your profile')
        default: return this.message
      }
    }
  },
}
</script>
