<style lang="sass" scoped>
.s-item
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
div(
  :style=`{overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.q-pa-sm.q-my-sm
  .row.full-width.justify-center
    div(
      @click="serviceClick({id: 'oAuthUrlGoogle'})"
      :style=`{
        width: '268px', height: '54px',
        borderRadius: '5px',
      }`
      ).row.items-center.content-center.justify-center.bg-white.cursor-pointer
      q-icon(name="fab fa-google" size="18px").q-mr-xs
      //- span.text-bold Sign in with Google
      span.text-bold Войти с Google
  .row.full-width.justify-center.q-mt-md
    div(
      @click="serviceClick({id: 'oAuthUrlApple'})"
      :style=`{
        width: '268px', height: '54px',
        borderRadius: '5px',
      }`
      ).row.items-center.content-center.justify-center.bg-white.cursor-pointer
      q-icon(name="fab fa-apple" size="20px").q-mr-sm
      //- span.text-bold Sign in with Apple
      span.text-bold Войти с Apple
  //- .row.full-width.justify-center.q-py-sm
    q-btn(
      @click="serviceClick({id: 'oAuthUrlGoogle'})"
      flat color="white" no-caps
      :style=`{
        position: 'relative',
        //- height: '55px',
        padding: '0px',
      }`).full-width.b-40.q-mb-xs
      div(
        :style=`{
          position: 'relative',
          minWidth: '264px',
          height: '50px',
          borderRadius: '10px',
          overflow: 'hidden',
        }`).row
        img(
          src="other/btn_google_signin_light_normal_web@2x.png"
          :style=`{
            position: 'absolute', zIndex: 100, top: '-10px', left: '-10px',
            width: 'calc(100% + 20px)',
            height: 'calc(100% + 20px)',
          }`)
    q-btn(
      @click="serviceClick({id: 'oAuthUrlApple'})"
      flat color="white" no-caps).full-width.b-40
      img(src="other/appleid_button@1x.png")
</template>

<script>
import {assert} from 'src/system/common/utils'
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
      let settings = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'settings')
      assert(settings && settings.services, '!services')
      this.$log('serviceClick', s, si, settings.services)
      let url = settings.services[s.id]
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
