<style lang="sass" scoped>
.s-item
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
div(
  :style=`{overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
  .row.full-width.justify-center.q-py-sm
    img(
      @click="serviceClick({id: 'oAuthUrlGoogle'})"
      src="other/btn_google_signin_light_normal_web@2x.png"
      :style="{width: '268px', height: '60px'}").cursor-pointer.q-mb-sm
    q-btn(
      @click="serviceClick({id: 'oAuthUrlApple'})"
      flat color="white" no-caps).full-width.b-40
      img(src="other/appleid_button@1x.png")
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
        {id: 'oAuthUrlApple', name: 'Apple', icon: 'fab fa-apple'},
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
      // alert('serviceClick')
      let location
      // eslint-disable-next-line no-constant-condition
      if (Platform.is.capacitor) {
        location = 'app.kalpa://auth' // custom_url_scheme for android & ios
      } else {
        location = window.location.origin + '/auth'
      }
      this.$log('location', location)
      const urlObj = new URL(url)
      urlObj.searchParams.set('state', `{"origin":"${location}"}`); // сообщаем серверу куда делать редирект после успешной аутентификации
      this.$log('urlObj', urlObj.toString())
      // window.location = urlObj.toString()
      await this.$systemUtils.openUrl(urlObj.toString(), true)
    }
  }
}
</script>
