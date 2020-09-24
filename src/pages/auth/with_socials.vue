<style lang="sass" scoped>
.s-item
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
div(
  :style=`{overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
  .row.full-width.justify-between.q-py-sm
    //- q-btn(
      v-for="(s,si) in socials" :key="s.id" @click="serviceClick(s,si)"
      flat round color="white" :icon="s.icon"
      :style=`{width: '40px', height: '40px'}`).s-item
    q-btn(
      @click="serviceClick({id: 'oAuthUrlGoogle'})"
      flat color="white" icon="fab fa-google" no-caps).full-width.b-40.q-py-xs
      span.q-ml-sm {{title}}
</template>

<script>
import assert from 'assert'
import { Platform } from 'quasar'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageAuth-withSocials',
  props: ['title'],
  data () {
    return {
      socials: [
        {id: 'oAuthUrlYandex', name: 'Yandex', icon: 'fab fa-yandex'},
        {id: 'oAuthUrlFacebook', name: 'Facebook', icon: 'fab fa-facebook-f'},
        {id: 'oAuthUrlVk', name: 'Vkontakte', icon: 'fab fa-vk'},
        {id: 'oAuthUrlTwitter', name: 'Twitter', icon: 'fab fa-twitter'},
        {id: 'oAuthUrlGoogle', name: 'Google', icon: 'fab fa-google'},
        {id: 'oAuthUrlGithub', name: 'Github', icon: 'fab fa-github'}
      ]
    }
  },
  methods: {
    async serviceClick (s, si) {
      let services = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'services')
      assert(services, '!services')
      this.$log('serviceClick', s, si, services)
      let url = services[s.id]
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
      // alert(to)
      this.$log('to', to)
      window.location = to
    }
  }
}
</script>
