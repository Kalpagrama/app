<style lang="sass" scoped>
.s-item
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
div(
  :style=`{height: '56px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)'}`
  ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
  div(v-if="!userIdentified").row.full-width.justify-between.q-py-md
    q-btn(
      v-for="(s,si) in socials" :key="s.id" @click="serviceClick(s,si)"
      flat round color="white" :icon="s.icon"
      :style=`{width: '40px', height: '40px'}`).s-item
</template>

<script>
  import assert from 'assert'
  import { Platform } from 'quasar'
export default {
  name: 'pageAuth-withSocials',
  data () {
    return {
      socials: [
        {id: 'oAuthUrlYandex', name: 'Yandex', icon: 'fab fa-yandex'},
        {id: 'oAuthUrlFacebook', name: 'Facebook', icon: 'fab fa-facebook-f'},
        {id: 'oAuthUrlVk', name: 'Vkontakte', icon: 'fab fa-vk'},
        {id: 'oAuthUrlTwitter', name: 'Twitter', icon: 'fab fa-twitter'},
        {id: 'oAuthUrlGoogle', name: 'Google', icon: 'fab fa-google'},
        {id: 'goAuthUrlGithub', name: 'Github', icon: 'fab fa-github'}
      ]
    }
  },
  methods: {
    serviceClick (s, si) {
      this.$log('serviceClick', s, si, this.$store.state.auth.services)
      let url = this.$store.state.auth.services[s.id]
      this.$log('oauth url = ', url)
      assert(url, '!url')
      let location
      // eslint-disable-next-line no-constant-condition
      if (Platform.is.capacitor) {
        location = 'app.kalpa://redirect_to_app/path' // custom_url_scheme for android & ios
      } else {
        location = window.location
        location = location.toString().replace('#', '_octothorp_') // vk режет все после символа #
      }
      this.$log('location', location)
      let to = `${url}&state={"origin":"${location}"}` // сообщаем серверу куда делать редирект после успешной аутентификации
      alert(to)
      this.$log('to', to)
      window.location = to
    }
  }
}
</script>
